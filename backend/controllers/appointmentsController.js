const Appointment = require("../models/appointment");

exports.listAppointments = async (req, res) => {
  try {
    const items = await Appointment.find()
      .populate("user", "name email")
      .populate("vehicle")
      .populate("service");
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const item = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate("vehicle")
      .populate("service");
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const item = await Appointment.create(req.body);
    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json({ msg: "Appointment deleted" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


