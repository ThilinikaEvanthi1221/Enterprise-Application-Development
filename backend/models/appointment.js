const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"], 
      default: "pending" 
    },
    notes: { type: String },
    estimatedDuration: { type: Number, required: true }, // in minutes
    actualDuration: { type: Number }, // in minutes, filled when completed
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);


