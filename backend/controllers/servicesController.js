const Service = require("../models/service");

exports.listServices = async (req, res) => {
  try {
    const services = await Service.find();
    return res.json(services);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ msg: "Service not found" });
    return res.json(service);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    return res.status(201).json(service);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ msg: "Service not found" });
    return res.json(service);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ msg: "Service not found" });
    return res.json({ msg: "Service deleted" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


