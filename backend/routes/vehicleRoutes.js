const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  listVehicles,
  getMyVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByOwner,
  lookupByPlate,
} = require("../controllers/vehiclesController");

const router = express.Router();

// specific routes first
router.get("/lookup", verifyToken, lookupByPlate);
router.get("/my-vehicles", verifyToken, getMyVehicles);
router.get("/owner/:userId", verifyToken, getVehiclesByOwner);

// collection and mutations
router.get("/", verifyToken, requireAdmin, listVehicles);
router.post("/", verifyToken, createVehicle);
router.put("/:id", verifyToken, updateVehicle);
router.delete("/:id", verifyToken, deleteVehicle);

// id route last
router.get("/:id", verifyToken, getVehicle);

module.exports = router;
