const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// All dashboard routes require authentication
router.get("/stats", authMiddleware, getDashboardStats);

module.exports = router;

