const mongoose = require("mongoose");
const Vehicle = require("../models/vehicle");

// Get all vehicles (admin/employee use)
exports.listVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("owner", "name email");
    return res.json(vehicles);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getMyVehicles = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: "Not authenticated" });

    const vehicles = await Vehicle.find({ owner: userId })
      .populate("owner", "name email")
      .lean();

    return res.json({ vehicles });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.lookupByPlate = async (req, res) => {
  try {
    const plateNumber = (req.query.plateNumber || "").trim();
    if (!plateNumber)
      return res
        .status(400)
        .json({ msg: "plateNumber query param is required" });

    const normalized = plateNumber.toUpperCase();

    const vehicle = await Vehicle.findOne({ plateNumber: normalized })
      .populate("owner", "name email")
      .lean();

    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    // ownership check
    const requesterId = req.user?.id;
    if (vehicle.owner) {
      const ownerId = vehicle.owner._id
        ? vehicle.owner._id.toString()
        : vehicle.owner.toString();
      if (requesterId && ownerId !== requesterId) {
        return res.status(403).json({
          msg: "Vehicle is registered to another user",
          unauthorized: 1,
        });
      }
    }

    return res.json(vehicle);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid vehicle id" });
    }
    const vehicle = await Vehicle.findById(id).populate("owner", "name email");
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    return res.json(vehicle);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const owner = req.user?.id; // set by verifyToken
    if (!owner) return res.status(401).json({ msg: "Not authenticated" });

    const payload = {
      plateNumber: req.body.plateNumber, // will be uppercased by schema
      make: req.body.make,
      model: req.body.model,
      year: req.body.year,
      owner,
      status: req.body.status,
    };

    const vehicle = await Vehicle.create(payload);
    return res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.plateNumber) {
      return res.status(409).json({ msg: "plateNumber already exists" });
    }
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
    res.json({ msg: "Vehicle deleted" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ msg: "Server error" });
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
