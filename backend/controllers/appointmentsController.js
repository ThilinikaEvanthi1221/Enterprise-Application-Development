const Appointment = require("../models/appointment");
const Notification = require("../models/notification");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const emailService = require("../services/emailService");

exports.listAppointments = async (req, res) => {
  try {
    const query = req.path === "/my" ? { customer: req.user.id } : {};
    const items = await Appointment.find(query)
      .populate("customer", "name email")
      .populate("vehicle")
      .populate("service")
      .populate("assignedTo", "name email role");
    return res.json(items);
  } catch (err) {
    console.error("Error listing appointments:", err);
    return res.status(500).json({ msg: err.message });
  }
};

exports.listMyAssignments = async (req, res) => {
  try {
    const items = await Appointment.find({ assignedTo: req.user.id })
      .populate("customer", "name email")
      .populate("vehicle")
      .populate("service")
      .populate("assignedTo", "name email role")
      .sort({ date: 1 }); // Sort by date ascending
    return res.json(items);
  } catch (err) {
    console.error("Error listing assigned appointments:", err);
    return res.status(500).json({ msg: err.message });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const item = await Appointment.findById(req.params.id)
      .populate("customer", "name email")
      .populate("vehicle")
      .populate("service")
      .populate("assignedTo", "name email role");
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json(item);
  } catch (err) {
    console.error("Error getting appointment:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Create appointment (DB-backed)
exports.createAppointment = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      customer: req.user.id,
    };

    // Create the appointment
    const appointment = await Appointment.create(payload);

    // Populate the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customer", "name email")
      .populate("vehicle")
      .populate("service");

    return res.status(201).json(populatedAppointment);
  } catch (err) {
    console.error("Error creating appointment:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Update
exports.updateAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json(item);
  } catch (err) {
    console.error("Error updating appointment:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Update assigned appointment (for employees)
exports.updateMyAssignment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    // Check if the appointment is assigned to this employee
    if (
      !appointment.assignedTo ||
      appointment.assignedTo.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ msg: "You can only update appointments assigned to you" });
    }

    // Only allow updating status, notes, and progress
    const allowedUpdates = {
      status: req.body.status,
      notes: req.body.notes,
      progress: req.body.progress,
    };

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true }
    )
      .populate("customer", "name email")
      .populate("vehicle")
      .populate("service")
      .populate("assignedTo", "name email role");

    return res.json(updatedAppointment);
  } catch (err) {
    console.error("Error updating assigned appointment:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Delete
exports.deleteAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json({ msg: "Appointment deleted" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Check available time slots for a specific date
exports.checkAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ msg: "Date is required" });
    }

    // Parse the date and get start/end of day
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all appointments for this date
    const appointments = await Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $nin: ["cancelled", "completed"] }, // Exclude cancelled/completed
    }).select("date");

    // Define all available time slots
    const allSlots = [
      "08:00 AM - 09:00 AM",
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "12:00 PM - 01:00 PM",
      "01:00 PM - 02:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
      "04:00 PM - 05:00 PM",
    ];

    // Extract booked slots from appointments
    const bookedSlots = appointments.map((appointment) => {
      const hour = appointment.date.getHours();
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const startTime = `${displayHour
        .toString()
        .padStart(2, "0")}:00 ${period}`;
      const endHour = hour + 1;
      const endPeriod = endHour >= 12 ? "PM" : "AM";
      const endDisplayHour =
        endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
      const endTime = `${endDisplayHour
        .toString()
        .padStart(2, "0")}:00 ${endPeriod}`;
      return `${startTime} - ${endTime}`;
    });

    // Create availability map
    const availableSlots = allSlots.map((slot) => ({
      slot,
      available: !bookedSlots.includes(slot),
      booked: bookedSlots.includes(slot),
    }));

    return res.json({
      date: selectedDate.toISOString().split("T")[0],
      totalSlots: allSlots.length,
      availableCount: availableSlots.filter((s) => s.available).length,
      bookedCount: bookedSlots.length,
      slots: availableSlots,
    });
  } catch (err) {
    console.error("Error checking available slots:", err);
    return res.status(500).json({ msg: err.message });
  }
};
