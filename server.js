require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

const User = require("./src/models/userModel");
const { where } = require("sequelize");
const sequelize = require("./src/config/database");

function authenticateToken(req, res, next) {
  const token = req.cookies.auth_cookie;
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.username));
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
    });
    const payload = { id: user.id, username: user.username };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
    res.cookie("auth_cookie", accessToken, {
      maxAge: 3600000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(201).send("kghjk");
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ where: { username } });
  const payload = { id: user.id, username: user.username };
  if (user == null) {
    return res.status(400).json({ error: "Cannot find user" });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
      res.cookie("auth_cookie", accessToken, {
        maxAge: 3600000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.json({ accessToken: accessToken });
    } else {
      res.status(403).send("Not allowed");
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("auth_cookie");
  res.status(200).send("Logged out");
});

sequelize
  .sync()
  .then(() => {
    console.log("Database is synchronized");
    app.listen(PORT, () => {
      console.log(`Server is listening on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
