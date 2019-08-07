const functions = require("firebase-functions");

const app = require("express")();

// *** SCREAM ROUTES:
const { getAllScreams, postOneScream } = require("./handlers/screams");

// get all database of screams and order by createdAt descendingly
app.get("/screams", getAllScreams);

// post a new scream
const FBAuth = require("./util/fbAuth"); // Firebase Authentication Midleware to check if user already logined by using idToken
app.post("/scream", FBAuth, postOneScream);

// *** USER ROUTES:
const { signUp, logIn } = require("./handlers/users");

// SIGNUP Route
app.post("/signUp", signUp);

//LOGIN Route
app.post("/logIn", logIn);

// export api = route/api/...
exports.api = functions.https.onRequest(app);
