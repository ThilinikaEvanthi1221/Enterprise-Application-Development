const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    employeeid: { type: String, required: true },
    projectType: { type: String, enum: ["service", "project"], required: true },
    projectId: { type: String, required: true },
    date: { type: Date, required: true },
    hoursWorked: { type: Number, required: true, min: 0, max: 24 },
    hours: { type: Number, min: 0 }, // Legacy field for backward compatibility
    status: { 
      type: String, 
      enum: ["not-started", "in-progress", "on-hold", "completed", "delayed"], 
      required: true 
    },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.models.TimeLog || mongoose.model("TimeLog", timeLogSchema);


