import express from "express";
import TimeLog from "../models/TimeLogSchema.js";

const router = express.Router();

// POST /api/time-logs (create)
router.post("/", async (req, res) => {
  try {
    const newLog = new TimeLog(req.body);
    await newLog.save();
    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/time-logs (get all or filter)
router.get("/", async (req, res) => {
  try {
    const { projectType, status, startDate, endDate, search } = req.query;

    let query = {};

    if (projectType) query.projectType = projectType;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { projectId: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await TimeLog.find(query).sort({ date: -1 });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
