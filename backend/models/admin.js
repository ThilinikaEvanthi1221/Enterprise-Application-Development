const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // High-level role marker; keep consistent with users if shared auth is used
    role: { type: String, default: "admin", immutable: true },
    isSuperAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);


