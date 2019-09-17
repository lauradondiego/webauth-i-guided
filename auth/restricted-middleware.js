module.exports = (req, res, next) => {
  // is the user logged in === do we have info about the user in our session

  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "you shall not pass! " });
  }
};

// ** THIS IS HOW WE DID IT ON MONDAY DAY 1 **

// * custom middleware * //
// write a middleware that will check for the username and password
// and let the request continue to /api/users if credentials are good
// return a 401 if the credentials are invalid
// Use the middleware to restrict access to the GET /api/users endpoint

// const bcrypt = require("bcryptjs");

// const Users = require("../users/users-model.js");

//   let { username, password } = req.headers;

//   Users.findBy({ username })
//     .first()
//     .then(user => {
//       if (user && bcrypt.compareSync(password, user.password)) {
//         next();
//       } else {
//         res.status(401).json({ message: "You cannot pass!" });
//       }
//     })
//     .catch(error => {
//       res.status(500).json(error);
//     });
// };

// function fetch() {
//   const reqOptions = {
//     headers: {
//       username: "",
//       password: ""
//     }
//   };

// axios.get(url, reqOptions).the().catch()
// axios.post(url, data, reqOptions).the().catch()
// }
