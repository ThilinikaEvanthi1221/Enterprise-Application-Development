const express = require("express");
const router = express.Router();
const { getAllBookings } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

// All booking routes require authentication
router.get("/", authMiddleware, getAllBookings);

module.exports = router;

