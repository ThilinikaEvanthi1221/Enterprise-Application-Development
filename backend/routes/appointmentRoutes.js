const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkAvailableSlots,
  listMyAssignments,
  updateMyAssignment,
} = require("../controllers/appointmentsController");

const router = express.Router();

router.use(verifyToken);

// Customer routes (no admin required)
router.post("/", createAppointment);
router.get("/my", listAppointments); // Customer's own appointments
router.get("/my-assignments", listMyAssignments); // Employee's assigned appointments
router.put("/my-assignments/:id", updateMyAssignment); // Employee update their assigned appointment
router.get("/available-slots", checkAvailableSlots); // Check available time slots

// Admin routes (require admin)
router.use(requireAdmin);
router.get("/", listAppointments); // All appointments (admin only)
router.get("/:id", getAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;
