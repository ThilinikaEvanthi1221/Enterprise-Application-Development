import express from "express";
import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment); // Customer books
router.get("/", getAllAppointments); // Admin views all
router.put("/:id/status", updateAppointmentStatus); // Admin updates status

export default router;
