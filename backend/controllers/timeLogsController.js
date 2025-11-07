const TimeLog = require("../models/timeLog");

exports.listTimeLogs = async (req, res) => {
  try {
    // If user is not admin, filter to show only their own logs
    // Use both employee ObjectId and employeeid string for flexibility
    const filter = req.user.role === 'admin' 
      ? {} 
      : { 
          $or: [
            { employee: req.user.id },
            { employeeid: req.user.id },
            { employeeid: req.user.email }
          ]
        };
    
    const items = await TimeLog.find(filter).sort({ date: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error in listTimeLogs:', err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getTimeLog = async (req, res) => {
  try {
    const item = await TimeLog.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "TimeLog not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createTimeLog = async (req, res) => {
  try {
    const item = await TimeLog.create(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
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


