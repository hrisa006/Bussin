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

const posts = [
  {
    username: "Hrisi",
    password: "Post1",
  },
  {
    username: "Pisi",
    password: "Post2",
  },
];

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.username));
});

app.post("/posts", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword };
    posts.push(user);
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

app.post("/login", async (req, res) => {
  const user = posts.find((user) => user.username === req.body.username);
  if (user == null) {
    return res.status(400).json({ error: "Cannot find user" });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
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

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
});
