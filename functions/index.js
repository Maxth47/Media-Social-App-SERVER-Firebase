const functions = require("firebase-functions");

const app = require("express")();

// *** SCREAM ROUTES:
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream
} = require("./handlers/screams");
const FBAuth = require("./util/fbAuth"); // Firebase Authentication Midleware to check if user already logined by using idToken

app.get("/screams", getAllScreams); // get all database of screams and order by createdAt descendingly
app.post("/scream", FBAuth, postOneScream); // Route to post New scream
app.get("/scream/:screamId", getScream); // Route to post New scream
// TODO: delete a scream
// TODO: like a scream
// TODO: unlike a scream
// TODO: comment on scream
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

// *** USER ROUTES:
const {
  signUp,
  logIn,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/users");

app.post("/signUp", signUp); // SIGNUP Route
app.post("/logIn", logIn); //LOGIN Route
app.post("/user/upload-image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

// export api = route/api/...
exports.api = functions.https.onRequest(app);
