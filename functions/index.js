const functions = require("firebase-functions");

const app = require("express")();

const { db } = require("./util/admin");

// *** SCREAM ROUTES:
const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream
} = require("./handlers/screams");
const FBAuth = require("./util/fbAuth"); // Firebase Authentication Midleware to check if user already logined by using idToken

app.get("/screams", getAllScreams); // get all database of screams and order by createdAt descendingly
app.post("/scream", FBAuth, postOneScream); // Route to post New scream
app.get("/scream/:screamId", getScream); // Route to post New scream
app.delete("/scream/:screamId", FBAuth, deleteScream); // Route to delete a scream
app.get("/scream/:screamId/like", FBAuth, likeScream); // Route to like a scream
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream); // Route to unlike a scream
app.post("/scream/:screamId/comment", FBAuth, commentOnScream); // Route to comment on scream

// *** USER ROUTES:
const {
    signUp,
    logIn,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead
} = require("./handlers/users");

app.post("/signUp", signUp); // SIGNUP Route
app.post("/logIn", logIn); //LOGIN Route
app.post("/user/image", FBAuth, uploadImage); // Route to upload image
app.post("/user", FBAuth, addUserDetails); //Route to add user detail
app.get("/user", FBAuth, getAuthenticatedUser); //Route to get user detail
app.get("/user/:handle", getUserDetails); //Route to get user detail
app.post("/notifications", FBAuth, markNotificationsRead); //Route to get user detail

//export api = route/api/...
exports.api = functions.https.onRequest(app);

//like notification
exports.createNotificationOnLike = functions
    .region("europe-west1")
    .firestore.document(`likes/{id}`)
    .onCreate(snapshot => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: "like",
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch(err => console.error(err));
    });

//delete notification once unlike
exports.deleteNotificationOnUnlike = functions
    .region("europe-west1")
    .firestore.document("likes/{id}")
    .onDelete(snapshot => {
        return db
            .doc(`notifications/${snapshot.id}`)
            .delete()
            .catch(err => console.error(err));
    });

// comment notification
exports.createNotificationOnComment = functions
    .region("europe-west1")
    .firestore.document(`comments/{id}`)
    .onCreate(snapshot => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: "comment",
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .catch(err => console.error(err));
    });

//Once user's image changed => update the new user image URL to all related screams
exports.onUserImageChange = functions
    .region("europe-west1")
    .firestore.document(`/users/{userId}`)
    .onUpdate(change => {
        console.log(change.before.data());
        console.log(change.after.data());
        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log("user image changed !!!");
            const batch = db.batch();
            return db
                .collection("screams")
                .where("userHandle", "==", change.before.data().handle)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        const scream = db.doc(`/screams/${doc.id}`);
                        batch.update(scream, { userImage: change.after.data().imageUrl });
                    });
                    return batch.commit();
                });
        } else return true;
    });

//Once a scream deleted => delete comments, likes, notifications on the scream.
exports.onScreamDelete = functions
    .region("europe-west1")
    .firestore.document(`/screams/{screamId}`)
    .onDelete((snapshot, context) => {
        const screamId = context.params.screamId;
        const batch = db.batch();
        return db
            .collection("comments")
            .where("screamId", "==", screamId)
            .get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db
                    .collection("likes")
                    .where("screamId", "==", screamId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                });
                return db
                    .collection("notifications")
                    .where("screamId", "==", screamId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                });
                return batch.commit();
            })
            .catch(err => console.error(err));
    });
