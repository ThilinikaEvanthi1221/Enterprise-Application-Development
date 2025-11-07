const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    projectType: {
      type: String,
      enum: ["service", "project"],
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    hoursWorked: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "on-hold", "completed", "delayed"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeLog", timeLogSchema);
