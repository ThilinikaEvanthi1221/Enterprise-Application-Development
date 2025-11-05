const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

// Protected routes - require authentication
router.use(authMiddleware);

// Get user's notifications
router.get("/", notificationController.getUserNotifications);

// Mark single notification as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", notificationController.markAllAsRead);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

module.exports = router;
