const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require("../controllers/notificationController");

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);

// Get user's notifications
router.get("/", getUserNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllAsRead);

module.exports = router;
