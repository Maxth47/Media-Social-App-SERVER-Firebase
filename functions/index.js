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
app.post("/user/upload-image", FBAuth, uploadImage); // Route to upload image
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
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
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
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

//delete notification once unlike
exports.deleteNotificationOnUnlike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onDelete(snapshot => {
    db.doc(`notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

// comment notification
exports.createNotificationOnComment = functions
  .region("europe-west1")
  .firestore.document(`comments/{id}`)
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
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
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
