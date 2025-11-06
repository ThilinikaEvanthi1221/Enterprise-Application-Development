import express from "express";
import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = express.Router();

// 🧩 Customer creates a new appointment (email will be sent after confirmation)
router.post("/", createAppointment);

// 🧩 Admin fetches all appointments
router.get("/", getAllAppointments);

// 🧩 Admin updates appointment status (confirmation/completion email sent here)
router.put("/:id/status", updateAppointmentStatus);

export default router;

