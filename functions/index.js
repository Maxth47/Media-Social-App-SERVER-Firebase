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

const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

// Signup route
app.post("/signUp", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let errors = {};

  //validate the registered email
  if (isEmpty(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address ";
  }

  //validate the registered password
  if (isEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.password = "Passwords must match";

  //validate the registered user
  if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

  // if valadation error, return the error.
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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

});

// export api = route/api/...
exports.api = functions.https.onRequest(app);
