const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    // Service basic info
    serviceType: {
      type: String,
      required: true,
      enum: [
        "Oil Change",
        "Tire Replacement",
        "Brake Service",
        "Engine Repair",
        "Transmission Service",
        "AC Service",
        "Battery Replacement",
        "General Inspection",
        "Other",
      ],
    },
    name: { type: String, required: true },
    description: { type: String },

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
      },
    ],

    // Dates
    requestedDate: { type: Date, default: Date.now },
    startDate: { type: Date },
    completionDate: { type: Date },

    // Progress tracking
    progress: { type: Number, default: 0, min: 0, max: 100 }, // 0-100%
    notes: { type: String },
    customerNotes: { type: String },

    // Legacy field for backward compatibility
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
serviceSchema.index({ customer: 1, status: 1 });
serviceSchema.index({ assignedTo: 1, status: 1 });
serviceSchema.index({ vehicle: 1 });

module.exports = mongoose.models.Service || mongoose.model("Service", serviceSchema);
