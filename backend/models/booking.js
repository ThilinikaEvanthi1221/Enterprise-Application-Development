const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicleInfo: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    licensePlate: { type: String }
  },
  serviceType: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"], 
    default: "pending" 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bookingDate: { type: Date, required: true },
  serviceDate: { type: Date, required: true },
  estimatedPrice: { type: Number },
  actualPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

