const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const progressController = require("../controllers/progressController");

// Protected routes - require authentication
router.use(authMiddleware);

// Create new progress log (Employee only)
router.post(
  "/",
  (req, res, next) => {
    if (!["admin", "employee"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  },
  progressController.createProgressLog
);

// Update progress log (Employee only)
router.put(
  "/:id",
  (req, res, next) => {
    if (!["admin", "employee"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  },
  progressController.updateProgressLog
);

// Get customer's progress logs (Customer view)
router.get("/customer", progressController.getCustomerProgressLogs);

// Get employee's progress logs (Employee view)
router.get(
  "/employee",
  (req, res, next) => {
    if (!["admin", "employee"].includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  },
  progressController.getEmployeeProgressLogs
);

module.exports = router;
