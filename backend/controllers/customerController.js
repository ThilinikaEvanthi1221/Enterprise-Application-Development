const User = require("../models/user");
const Booking = require("../models/booking");

// List customers with derived fields
exports.listCustomers = async (req, res) => {
  try {
    const customers = await User.aggregate([
      { $match: { role: "customer" } },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "customer",
          as: "bookings"
        }
      },
      {
        $addFields: {
          orders: { $size: "$bookings" },
          spent: { $sum: "$bookings.actualPrice" },
          latestBooking: { $arrayElemAt: [ { $slice: [ { $reverseArray: "$bookings" }, 1 ] }, 0 ] }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          vehicleNumber: "$latestBooking.vehicleInfo.licensePlate",
          location: { $literal: null },
          orders: 1,
          spent: 1
        }
      }
    ]);

    res.json(customers);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


