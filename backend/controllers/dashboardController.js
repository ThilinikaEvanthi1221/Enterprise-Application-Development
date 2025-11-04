const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const TimeLog = require("../models/timeLog");

exports.getMetrics = async (req, res) => {
  try {
    const [usersCount, vehiclesCount, servicesCount, appointmentsCount, timeLogsCount] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      Service.countDocuments(),
      Appointment.countDocuments(),
      TimeLog.countDocuments()
    ]);

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("vehicle", "plateNumber")
      .populate("service", "name");

    return res.json({
      totals: { users: usersCount, vehicles: vehiclesCount, services: servicesCount, appointments: appointmentsCount, timeLogs: timeLogsCount },
      recentAppointments
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


