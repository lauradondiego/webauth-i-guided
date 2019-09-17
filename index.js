const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
// this below library has to come AFTER session above
const KnexSessionStore = require("connect-session-knex")(session);
// this is called currying so you require it and pass in the SESSION

const db = require("./database/dbConfig.js");
const Users = require("./users/users-model.js");
const restricted = require("./auth/restricted-middleware.js");
const dbConnection = require("./database/dbConfig");
const server = express();

// day 2 about cookies below
const sessionConfig = {
  name: "chocochip", // would name the cookie sid by default
  // check for this name in insomnia cookies manage cookies
  secret: process.env.SESSION_SECRET || "keep it secret, keep it safe",
  // now encrypt it with a secret. You can put this in another file how we did before
  cookie: {
    maxAge: 1000 * 60 * 60, // how long will this cookie be good for in milliseconds?
    secure: false, // true means only send cookie over https
    httpOnly: true // true means JS has no access to the cookie. this should always be true
  },
  resave: false,
  saveUninitialized: true, // GDPR compliance
  store: new KnexSessionStore({
    // don't forget the (new) keyword
    knex: dbConnection,
    tableName: "knexSessions", // dont need they will default table name
    // sidfieldname: "Sessionid", // dont need they will default sidfieldname
    createtable: true, // if theres no table to store the session info do you want it ot make one for you
    clearInterval: 1000 * 60 * 30 // every 30 mins cleans out old session data or expired data
  })
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.get("/", (req, res) => {
  res.send("It's alive!");
});

server.get("/hash", (req, res) => {
  const name = req.query.name;
  // hash the name
  const hash = bcrypt.hashSync(name, 8); // use bcryptjs to hash the name
  res.send(`the hash for ${name} is ${hash}`);
  // use this to test localhost:5000/hash/?name=laura
});

server.post("/api/register", (req, res) => {
  let { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 8);
  // the 8 is a number and the higher the number the hardesr the password
  // is to hack. the higher the number, the SLOWER it is to generate though
  // 8 means round. it means 2 ^ 8 power.
  // always include in, 14 and up

  Users.add({ username, password: hash })
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
  // use this localhost:5000/api/register and put in username and password and u get back hash
});

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // check password doing the below 49
      // *add to if statement* bcrypt.compareSync(password, user.password)
      // above takes the password and compares the hashes returns true or false
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user; // adding this from day 2 from restriced-middleware file
        // now you can not use headers and json with no body to get users
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get("/api/users", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get("/hash", (req, res) => {
  const name = req.query.name;

  // hash the name
  const hash = bcrypt.hashSync(name, 8); // use bcryptjs to hash the name
  res.send(`the hash for ${name} is ${hash}`);
});

server.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res.status(500).json({
          message: "you can check out anytime you like, but you can never leave"
        });
      } else {
        res.status(200).json({ message: "bye" });
      }
    });
  } else {
    res.status(200).json({ message: "already logged out" });
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
