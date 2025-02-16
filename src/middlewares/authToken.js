const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_cookie;
  if (!token) {
    return res.redirect("/auth/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.redirect("/auth/login");
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
