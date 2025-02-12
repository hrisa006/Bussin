const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();


const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

const posts = [
  {
    username: "Hrisi",
    title: "Post 1",
  },
  {
    username: "Pisi",
    title: "Post 2",
  },
];

app.get("/posts", (req, res) => {
  res.json(posts);
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

app.post("/posts/login", async (req, res) => {
  const user = posts.find((user) => user.username === req.body.username);
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("Success");
    } else {
      res.send("Not allowed");
    }
  } catch {
    res.status(500).send();
  }
});

app.listen(PORT);
