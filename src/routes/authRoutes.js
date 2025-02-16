const express = require("express");
const { register, login, logout } = require("../controllers/authController");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("layout", {
    title: "Login",
    user: null,
    page: "login",
    error: null,
  });
});

router.get("/register", (req, res) => {
  res.render("layout", {
    title: "Register",
    user: null,
    page: "registration",
    error: null,
  });
});

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
