const TimeLog = require("../models/timeLog");

exports.listTimeLogs = async (req, res) => {
  try {
    const items = await TimeLog.find().populate("employee", "name email");
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getTimeLog = async (req, res) => {
  try {
    const item = await TimeLog.findById(req.params.id).populate("employee", "name email");
    if (!item) return res.status(404).json({ msg: "TimeLog not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createTimeLog = async (req, res) => {
  try {
    const item = await TimeLog.create(req.body);
    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.updateTimeLog = async (req, res) => {
  try {
    const item = await TimeLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ msg: "TimeLog not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.deleteTimeLog = async (req, res) => {
  try {
    const item = await TimeLog.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: "TimeLog not found" });
    return res.json({ msg: "TimeLog deleted" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


