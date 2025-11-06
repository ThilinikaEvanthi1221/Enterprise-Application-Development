const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment } = require("../controllers/appointmentsController");

const router = express.Router();

router.use(verifyToken);

// Customer routes (no admin required)
router.post("/", createAppointment);
router.get("/my", listAppointments); // Customer's own appointments

// Admin routes
router.use(requireAdmin);
router.get("/", listAppointments); // All appointments (admin only)
router.get("/:id", getAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;


