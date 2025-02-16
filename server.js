require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const sequelize = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const transportRoutes = require("./src/routes/transportRoutes");
const authenticateToken = require("./src/middlewares/authToken");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "src/public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use("/auth", authRoutes);
app.use("/transport", transportRoutes);

app.get("/", (req, res) => {
  res.render("layout", { title: "Home", user: req.user, page: "login" });
});

app.get("/map", authenticateToken, (req, res) => {
  res.render("layout", { title: "Map", user: req.user, page: "map" });
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
