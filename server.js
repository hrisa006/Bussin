require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const sequelize = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const transportRoutes = require("./src/routes/transportRoutes");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/transport", transportRoutes);

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
