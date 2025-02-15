const express = require("express");
const {
  addBusRoute,
  getRoutesByStop,
  getRouteSchedule,
} = require("../controllers/transportController");
const authToken = require("../middlewares/authToken");

const router = express.Router();

router.post("/routes", authToken, addBusRoute);
router.get("/routes", authToken, getRoutesByStop);
router.get("/routes/:busRouteNum/schedule", authToken, getRouteSchedule);

module.exports = router;
