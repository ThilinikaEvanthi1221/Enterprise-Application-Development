const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { listTimeLogs, getTimeLog, createTimeLog, updateTimeLog, deleteTimeLog } = require("../controllers/timeLogsController");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/", listTimeLogs);
router.get("/:id", getTimeLog);
router.post("/", createTimeLog);
router.put("/:id", updateTimeLog);
router.delete("/:id", deleteTimeLog);

module.exports = router;


