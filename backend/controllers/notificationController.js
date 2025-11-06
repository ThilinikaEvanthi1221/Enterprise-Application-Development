const Notification = require("../models/notification");

let io;

exports.setIO = (socketIO) => {
  io = socketIO;
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
      .sort("-createdAt")
      .limit(50); // Limit to recent 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Security check - users can only mark their own notifications as read
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.read = true;
    await notification.save();

    // Emit real-time update
    io.to(`user_${req.user.id}`).emit("notificationRead", {
      notificationId: id,
    });

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    // Emit real-time update
    io.to(`user_${userId}`).emit("allNotificationsRead");

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error marking all notifications as read" });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ userId, read: false });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};
