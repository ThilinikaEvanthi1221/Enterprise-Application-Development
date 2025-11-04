const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { getMetrics } = require("../controllers/dashboardController");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/metrics", getMetrics);

module.exports = router;


