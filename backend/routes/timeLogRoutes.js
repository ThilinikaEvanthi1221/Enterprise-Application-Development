const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { listTimeLogs, getTimeLog, createTimeLog, updateTimeLog, deleteTimeLog } = require("../controllers/timeLogsController");

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Employees can create and view their own time logs
router.get("/", listTimeLogs);  // Controller will filter by employee if not admin
router.post("/", createTimeLog);  // Employees can create their own logs

// Admin-only routes for management operations
router.get("/:id", requireAdmin, getTimeLog);
router.put("/:id", requireAdmin, updateTimeLog);
router.delete("/:id", requireAdmin, deleteTimeLog);

module.exports = router;


