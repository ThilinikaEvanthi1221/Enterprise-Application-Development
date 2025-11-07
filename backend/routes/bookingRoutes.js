const express = require("express");
const router = express.Router();
const { getAllBookings, getMyAssignedBookings } = require("../controllers/bookingController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Employee routes - get their assigned bookings
router.get("/my-assigned", verifyToken, getMyAssignedBookings);

// Admin routes - get all bookings
router.get("/", verifyToken, requireAdmin, getAllBookings);

module.exports = router;

