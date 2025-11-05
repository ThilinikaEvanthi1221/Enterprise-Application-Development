const express = require("express");
const router = express.Router();
const { getAllBookings } = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authMiddleware");

// All booking routes require authentication
router.get("/", verifyToken, getAllBookings);

module.exports = router;
