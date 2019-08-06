const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const app = require("express")();

const firebaseConfig = {
  apiKey: "AIzaSyDnkXVr8a7mXN3g1Csldnh9m8cId0EePCc",
  authDomain: "socialmediaapp-5ccbf.firebaseapp.com",
  databaseURL: "https://socialmediaapp-5ccbf.firebaseio.com",
  projectId: "socialmediaapp-5ccbf",
  storageBucket: "socialmediaapp-5ccbf.appspot.com",
  messagingSenderId: "903287923873",
  appId: "1:903287923873:web:875b5fc498170f1f"
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// get all database of screams and order by createdAt descendingly
app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

// upload a new scream
app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    userHandle: req.body.userHandle
  };
  console.log(JSON.stringify(newScream));
  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.log(err);
    });
});

// Signup route
app.post("/signUp", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // TODO validate value
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      console.log("doc", doc);
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then(data => {
            userId = data.user.uid;
            console.log("data.user", data.user);
            return data.user.getIdToken();
          })
          .then(idToken => {
            console.log("newUser.handle", newUser.handle);
            token = idToken;
            const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
          })
          .then(() => {
            return res.status(201).json({ token });
          })
          .catch(err => {
            if (err.code === "auth/email-already-in-use") {
              return res
                .status(400)
                .json({ email: "this email is already in use" });
            } else {
              return res.status(500).json({ error: err.code });
            }
          });
      }
    });

  //   firebase
  //     .auth()
  //     .createUserWithEmailAndPassword(newUser.email, newUser.password)
  //     .then(data => {
  //       return res
  //         .status(201)
  //         .json({ message: `user: ${data.user.uid} sign up successfully` });
  //     })
  //     .catch(error => {
  //       console.error(error);
  //       return res.status(500).json({ error: error.code });
  //     });
});

// export api = route/api/...
exports.api = functions.https.onRequest(app);