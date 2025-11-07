const mongoose = require("mongoose");

const serviceTypeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Maintenance",
      "Repair",
      "Diagnostic",
      "Cosmetic",
      "Other"
    ]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ServiceType", serviceTypeSchema);
