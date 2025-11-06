const express = require("express");
const router = express.Router();

const {
  getMetrics,
  getDashboardStats,
} = require("../controllers/dashboardController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Admin routes
router.get("/metrics", verifyToken, requireAdmin, getMetrics);

// Employee/general dashboard stats
router.get("/stats", verifyToken, getDashboardStats);

module.exports = router;
