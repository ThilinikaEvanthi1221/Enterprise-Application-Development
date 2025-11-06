const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["PROGRESS_UPDATE", "STATUS_CHANGE", "SERVICE_COMPLETE", "NEW_BOOKING", "BOOKING_REMINDER", "SYSTEM_RISK", "FAILED_LOGIN", "UNUSUAL_ACTIVITY"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedTo: {
      type: {
        model: {
          type: String,
          enum: ["Service", "Vehicle", "ProgressLog"],
          required: true,
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ "relatedTo.model": 1, "relatedTo.id": 1 });

module.exports = mongoose.model("Notification", notificationSchema);
