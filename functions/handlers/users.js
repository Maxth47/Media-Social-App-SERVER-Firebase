const { db } = require("../util/admin");

const firebaseConfig = require("../util/firebaseConfig");
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const { validateSignUpData, validateLogInData } = require("../util/validators");

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email, 
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) {
    return res.status(400).json(errors);
  }

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
};

exports.logIn = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLogInData(user);
  if (!valid) {
    return res.status(400).json(errors); 
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => data.user.getIdToken())
    .then(token => res.json({ token }))
    .catch(err => {
      console.error(err);
      if (err.code === "auth/wrong-password")
        return res
          .status(403)
          .json({ general: "Wrong password, please try again!" });
      else if (err.code === "auth/user-not-found")
        return res
          .status(403)
          .json({ general: "Email not found, please try again!" });
      else return res.status(500).json({ error: err.code });
    });
};
