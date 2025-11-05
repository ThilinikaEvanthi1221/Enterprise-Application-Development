const ProgressLog = require("../models/progressLog");
const Notification = require("../models/notification");

// Initialize socket.io (will be imported from socket config)
let io;

exports.setIO = (socketIO) => {
  io = socketIO;
};

// Create a new progress log
exports.createProgressLog = async (req, res) => {
  try {
    const { serviceId, vehicleId, customerId, status, progress, notes } = req.body;
    
    const progressLog = new ProgressLog({
      serviceId,
      vehicleId,
      customerId,
      updatedBy: req.user.id, // From JWT auth middleware
      status,
      progress,
      notes,
    });

    await progressLog.save();

    // Create notification for customer
    const notification = new Notification({
      userId: customerId,
      type: "PROGRESS_UPDATE",
      title: "Service Progress Update",
      message: `Your service is ${progress}% complete. Status: ${status}`,
      relatedTo: {
        model: "ProgressLog",
        id: progressLog._id,
      },
    });

    await notification.save();

    // Emit real-time updates via Socket.IO
    io.to(`user_${customerId}`).emit("progressUpdate", {
      progressLog,
      notification,
    });

    res.status(201).json({ progressLog, notification });
  } catch (error) {
    console.error("Error creating progress log:", error);
    res.status(500).json({ message: "Error creating progress log" });
  }
};

// Update progress log
exports.updateProgressLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, notes } = req.body;

    const progressLog = await ProgressLog.findById(id);
    if (!progressLog) {
      return res.status(404).json({ message: "Progress log not found" });
    }

    progressLog.status = status || progressLog.status;
    progressLog.progress = progress || progressLog.progress;
    progressLog.notes = notes || progressLog.notes;
    progressLog.updatedBy = req.user.id;

    await progressLog.save();

    // Create notification for status/progress change
    const notification = new Notification({
      userId: progressLog.customerId,
      type: "STATUS_CHANGE",
      title: "Service Status Updated",
      message: `Your service status is now: ${status || progressLog.status} (${progress || progressLog.progress}% complete)`,
      relatedTo: {
        model: "ProgressLog",
        id: progressLog._id,
      },
    });

    await notification.save();

    // Emit real-time updates
    io.to(`user_${progressLog.customerId}`).emit("progressUpdate", {
      progressLog,
      notification,
    });

    res.json({ progressLog, notification });
  } catch (error) {
    console.error("Error updating progress log:", error);
    res.status(500).json({ message: "Error updating progress log" });
  }
};

// Get progress logs for a customer
exports.getCustomerProgressLogs = async (req, res) => {
  try {
    const customerId = req.user.id;
    const logs = await ProgressLog.find({ customerId })
      .sort("-createdAt")
      .populate("serviceId", "name")
      .populate("vehicleId", "make model")
      .populate("updatedBy", "name");

    res.json(logs);
  } catch (error) {
    console.error("Error fetching progress logs:", error);
    res.status(500).json({ message: "Error fetching progress logs" });
  }
};

// Get progress logs for employee (assigned services)
exports.getEmployeeProgressLogs = async (req, res) => {
  try {
    // In a real app, you'd filter by services assigned to this employee
    const logs = await ProgressLog.find({})
      .sort("-createdAt")
      .populate("serviceId", "name")
      .populate("vehicleId", "make model")
      .populate("customerId", "name email")
      .populate("updatedBy", "name");

    res.json(logs);
  } catch (error) {
    console.error("Error fetching progress logs:", error);
    res.status(500).json({ message: "Error fetching progress logs" });
  }
};
