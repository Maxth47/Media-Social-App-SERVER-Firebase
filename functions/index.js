const functions = require("firebase-functions");

const app = require("express")();

// *** SCREAM ROUTES:
const { getAllScreams, postOneScream } = require("./handlers/screams");
const FBAuth = require("./util/fbAuth"); // Firebase Authentication Midleware to check if user already logined by using idToken

app.get("/screams", getAllScreams); // get all database of screams and order by createdAt descendingly
app.post("/scream", FBAuth, postOneScream); // New scream Route

// *** USER ROUTES:
const { signUp, logIn, uploadImage } = require("./handlers/users");
app.post("/signUp", signUp); // SIGNUP Route
app.post("/logIn", logIn); //LOGIN Route
app.post("/user/upload-image", FBAuth, uploadImage);

// export api = route/api/...
exports.api = functions.https.onRequest(app);
