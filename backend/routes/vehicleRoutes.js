const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  listVehicles,
  getMyVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehiclesController");

const router = express.Router();

// Customer route - must come BEFORE admin middleware
router.get("/my-vehicles", verifyToken, getMyVehicles);

// Admin routes
router.use(verifyToken, requireAdmin);

router.get("/", listVehicles);
router.get("/:id", getVehicle);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
