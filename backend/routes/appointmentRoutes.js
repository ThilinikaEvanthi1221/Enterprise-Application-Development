const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkAvailability,
  checkAvailableSlots,
  myAppointments,
  confirmAppointment
} = require("../controllers/appointmentsController");

const router = express.Router();

// Public routes
router.post('/check-availability', checkAvailability);

// Protected routes (require authentication)
router.use(verifyToken);

// Customer routes
router.post('/', createAppointment); // Create new appointment
router.get('/my', myAppointments); // Customer's own appointments
router.post('/confirm', confirmAppointment); // Confirm appointment
router.get('/available-slots', checkAvailableSlots);

// Admin routes (require admin)
router.use(requireAdmin);
router.get('/', listAppointments); // All appointments (admin only)
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
