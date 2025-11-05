const express = require("express");
const router = express.Router();
const { getDashboardStats, getMetrics } = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");

// All dashboard routes require authentication
router.get("/stats", verifyToken, getDashboardStats);
router.get("/metrics", verifyToken, getMetrics);

module.exports = router;

