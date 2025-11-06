const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByOwner,
  lookupByPlate,
} = require("../controllers/vehiclesController");

const router = express.Router();

// Always put static/specific routes before dynamic ones!

// Lookup by plate number (require auth so ownership can be checked)
router.get("/lookup", verifyToken, lookupByPlate);

// Vehicles by owner id
router.get("/owner/:userId", verifyToken, getVehiclesByOwner);

// List all (admin only)
router.get("/", verifyToken, requireAdmin, listVehicles);

// Create new
router.post("/", verifyToken, createVehicle);

// Update and delete by id
router.put("/:id", verifyToken, updateVehicle);
router.delete("/:id", verifyToken, deleteVehicle);

// Get by id (must be last!)
router.get("/:id", verifyToken, getVehicle);

module.exports = router;
