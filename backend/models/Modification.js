const mongoose = require("mongoose");

const modificationSchema = new mongoose.Schema(
  {
    // 🧍 Customer details
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },

    // 🚗 Vehicle details
    vehicleMake: { type: String },
    vehicleModel: { type: String },
    registrationNo: { type: String },
    color: { type: String },
    mileage: { type: String },

    // ⚙️ Modification details
    modificationType: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    budgetRange: { type: String },
    notes: { type: String },

    // 📸 Image reference
    imagePath: { type: String },

    // 🧾 Status (matches your ALLOWED_STATUSES)
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "confirmed",
        "rejected",
        "in-progress",
        "completed",
      ],
      default: "pending",
    },

    // 👤 Optional user reference (if logged-in customers)
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true } // ✅ adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Modification", modificationSchema);
