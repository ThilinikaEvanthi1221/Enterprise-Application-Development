const Booking = require("../models/booking");

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get bookings assigned to current employee
exports.getMyAssignedBookings = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const bookings = await Booking.find({ assignedTo: employeeId })
      .populate("customer", "name email")
      .populate("assignedTo", "name")
      .sort({ serviceDate: 1 }) // Sort by service date for better scheduling
      .select("-__v");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

