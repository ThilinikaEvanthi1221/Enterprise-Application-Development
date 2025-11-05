const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehiclesController");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/", listVehicles);
router.get("/:id", getVehicle);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;


