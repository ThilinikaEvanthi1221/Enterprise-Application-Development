const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    hours: { type: Number, required: true, min: 0 },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeLog", timeLogSchema);


