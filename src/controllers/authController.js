const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const register = async (req, res) => {
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
    res.redirect("/map");
  } catch {
    res.status(500).send("Internal server error");
  }
};

const login = async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.username } });

  if (!user) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const payload = { id: user.id, username: user.username };
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

      res.cookie("auth_cookie", accessToken, {
        maxAge: 3600000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.redirect("/map");
    } else {
      res.status(403).send("Not allowed");
    }
  } catch {
    res.status(500).send("Internal server error");
  }
};

const logout = (req, res) => {
  res.clearCookie("auth_cookie");
  res.redirect("/");
};

module.exports = {
  login,
  register,
  logout,
};
