const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const appointmentsController = require("../controllers/appointmentsController");

const router = express.Router();

// Public routes (no auth required)
router.post('/check-availability', appointmentsController.checkAvailability);

// Protected routes (require authentication)
router.use(verifyToken);

// Customer routes
router.get('/my', appointmentsController.myAppointments); // Customer's own appointments
router.post('/', appointmentsController.createAppointment); // Create new appointment
router.post('/confirm', appointmentsController.confirmAppointment); // Confirm appointment

// Admin routes
router.use(requireAdmin);
router.get("/", listAppointments); // All appointments (admin only)
router.get("/:id", getAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;


