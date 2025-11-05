const Booking = require("../models/booking");

// Get all bookings
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

