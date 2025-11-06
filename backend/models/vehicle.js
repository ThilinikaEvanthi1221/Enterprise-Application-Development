const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vehicleType: { type: String, required: true },
  makeModel: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  year: Number,
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;
