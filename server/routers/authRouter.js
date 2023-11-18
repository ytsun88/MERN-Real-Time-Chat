const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../db");
const validator = require("../validation");
const { rateLimiter } = require("../controllers/rateLimiter");

router.post("/login", rateLimiter(60, 10), async (req, res) => {
  const { error } = validator(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const { username, password } = req.body;
  try {
    const foundUser = await pool.query(
      "SELECT id, username, passhash, userid FROM users u WHERE u.username=$1",
      [username]
    );
    if (!foundUser.rows[0]) {
      return res.status(400).json("No user found");
    }
    const isMatch = await bcrypt.compare(password, foundUser.rows[0].passhash);
    if (!isMatch) {
      return res.status(400).json("Wrong username or password");
    }
    const token = jwt.sign(
      {
        id: foundUser.rows[0].id,
        username: username,
        userid: foundUser.rows[0].userid,
      },
      process.env.TOKEN_SECRET
    );
    req.session.user = {
      username,
      id: foundUser.rows[0].id,
      userid: foundUser.rows[0].userid,
    };
    res.json({
      Success: true,
      token: "JWT " + token,
      user: { id: foundUser.rows[0].id, username: username },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
});

router.post("/register", rateLimiter(30, 4), async (req, res) => {
  const { error } = validator(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const { username, password } = req.body;
  try {
    const user = await pool.query(
      "SELECT username FROM users u WHERE u.username=$1",
      [username]
    );
    if (user.rows[0] && user.rows[0].username) {
      return res.status(400).json("User Taken");
    }
    const passhash = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users(username, passhash, userid) VALUES($1, $2, $3) RETURNING id, username",
      [username, passhash, uuidv4()]
    );
    res.json(newUser.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
});

module.exports = router;
