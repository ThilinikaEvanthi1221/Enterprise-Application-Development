const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // Project basic info (Modification Request)
    title: { type: String, required: true },
    description: { type: String, required: true },
    modificationType: {
      type: String,
      required: true,
      enum: [
        "Performance Upgrade",
        "Aesthetic Modification",
        "Custom Paint Job",
        "Interior Modification",
        "Audio System",
        "Suspension Upgrade",
        "Engine Tuning",
        "Body Kit Installation",
        "Other",
      ],
    },

    // Customer and Vehicle info
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    // Assignment and Status
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Employee assigned
    status: {
      type: String,
      enum: [
        "requested",
        "pending",
        "approved",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },

    // Cost Information
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number },
    laborHours: { type: Number, default: 0 },
    partsRequired: [
      {
        name: String,
        quantity: Number,
        cost: Number,
        supplier: String,
      },
    ],

    // Dates
    requestedDate: { type: Date, default: Date.now },
    startDate: { type: Date },
    estimatedCompletionDate: { type: Date },
    completionDate: { type: Date },

    // Progress tracking
    progress: { type: Number, default: 0, min: 0, max: 100 }, // 0-100%
    milestones: [
      {
        title: String,
        description: String,
        completed: { type: Boolean, default: false },
        completedDate: Date,
      },
    ],

    // Notes and Documentation
    notes: { type: String },
    customerNotes: { type: String },
    images: [{ type: String }], // URLs to images

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
projectSchema.index({ customer: 1, status: 1 });
projectSchema.index({ assignedTo: 1, status: 1 });
projectSchema.index({ vehicle: 1 });
projectSchema.index({ status: 1, priority: -1 });

module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);
