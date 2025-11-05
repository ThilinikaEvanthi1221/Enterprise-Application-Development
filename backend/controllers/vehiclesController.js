const Vehicle = require("../models/vehicle");

exports.listVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("owner", "name email");
    return res.json(vehicles);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "owner",
      "name email"
    );
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    return res.json(vehicle);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    return res.status(201).json(vehicle);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    return res.json(vehicle);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    return res.json({ msg: "Vehicle deleted" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// GET /api/vehicles/owner/:userId
exports.getVehiclesByOwner = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ msg: "userId required" });
    const vehicles = await Vehicle.find({ owner: userId }).lean();
    return res.json({ vehicles });
  } catch (err) {
    console.error("getVehiclesByOwner error:", err);
    return res.status(500).json({ msg: "server error" });
  }
};
