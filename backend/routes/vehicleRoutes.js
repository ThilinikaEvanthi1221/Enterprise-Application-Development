const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByOwner,
} = require("../controllers/vehiclesController");

const router = express.Router();

// LIST (admin only)
router.get("/", verifyToken, listVehicles);

// GET by id (any authenticated user)
router.get("/:id", verifyToken, getVehicle);

// CREATE vehicle (authenticated users) - sets owner from req.user in controller
router.post("/", verifyToken, createVehicle);

router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

// vehicles by owner id (current authenticated user)
router.get("/owner/:userId", verifyToken, getVehiclesByOwner);

module.exports = router;
