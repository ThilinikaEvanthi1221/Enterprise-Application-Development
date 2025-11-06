const Vehicle = require("../models/vehicle");

// ✅ Add a new vehicle
const addVehicle = async (req, res) => {
  try {
    const { ownerId, vehicleType, makeModel, regNo, year } = req.body;
    const newVehicle = new Vehicle({ ownerId, vehicleType, makeModel, regNo, year });
    await newVehicle.save();
    res.status(201).json({ message: "Vehicle added successfully", vehicle: newVehicle });
  } catch (error) {
    res.status(400).json({ message: "Error adding vehicle", error: error.message });
  }
};

// ✅ Get all vehicles of a specific user
const getVehiclesByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicles = await Vehicle.find({ ownerId: id });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicles", error: error.message });
  }
};

module.exports = { addVehicle, getVehiclesByUser };
