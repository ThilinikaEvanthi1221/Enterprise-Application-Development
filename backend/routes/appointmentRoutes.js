const express = require("express");
const {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/", createAppointment); // Customer books
router.get("/", getAllAppointments); // Admin views all
router.put("/:id/status", updateAppointmentStatus); // Admin updates status

module.exports = router;
