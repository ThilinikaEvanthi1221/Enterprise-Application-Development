const express = require("express");
const { addVehicle, getVehiclesByUser } = require("../controllers/vehicleController");

const router = express.Router();

router.post("/", addVehicle);
router.get("/user/:id", getVehiclesByUser);

module.exports = router;
