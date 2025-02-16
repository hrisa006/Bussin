const express = require("express");
const {
  addBusRoute,
  getRoutesByStop,
  getRouteSchedule,
  getStops,
  getRouteCoordinates,
} = require("../controllers/transportController");
const authToken = require("../middlewares/authToken");

const router = express.Router();

router.post("/routes", authToken, addBusRoute);
router.get("/routes", authToken, getRoutesByStop);
router.get("/routes/:busRouteNum/schedule", authToken, getRouteSchedule);
router.get("/stops", authToken, getStops);
router.get("/routes/:busRouteNum/coordinates", authToken, getRouteCoordinates);

module.exports = router;
