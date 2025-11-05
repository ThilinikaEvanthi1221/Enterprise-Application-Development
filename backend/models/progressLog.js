const mongoose = require("mongoose");

const progressLogSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Parts Ordered", "Under Repair", "Quality Check", "Ready for Pickup", "Completed"],
      default: "Pending",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
progressLogSchema.index({ serviceId: 1, vehicleId: 1, customerId: 1 });

module.exports = mongoose.model("ProgressLog", progressLogSchema);
