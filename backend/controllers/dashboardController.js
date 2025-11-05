const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const TimeLog = require("../models/timeLog");
const Project = require("../models/project");
const Booking = require("../models/booking");

// Admin dashboard metrics
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

// Get dashboard statistics for an employee
exports.getDashboardStats = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Total Projects Assigned
    const totalProjects = await Project.countDocuments({ assignedTo: employeeId });

    // Ongoing Services
    const ongoingServices = await Service.countDocuments({ 
      assignedTo: employeeId,
      status: "ongoing"
    });

    // Completed Tasks (projects + services)
    const completedProjects = await Project.countDocuments({ 
      assignedTo: employeeId,
      status: "completed"
    });
    const completedServices = await Service.countDocuments({ 
      assignedTo: employeeId,
      status: "completed"
    });
    const completedTasks = completedProjects + completedServices;

    // Recent Bookings (last 10 bookings assigned to this employee or recent bookings)
    const recentBookings = await Booking.find({
      $or: [
        { assignedTo: employeeId },
        { status: { $in: ["pending", "confirmed", "in-progress"] } }
      ]
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-__v");

    // Calculate percentage changes (simplified - comparing last week to this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const lastWeekProjects = await Project.countDocuments({
      assignedTo: employeeId,
      createdAt: { $lt: oneWeekAgo }
    });
    const projectChange = lastWeekProjects > 0 
      ? ((totalProjects - lastWeekProjects) / lastWeekProjects * 100).toFixed(1)
      : 0;

    const lastWeekServices = await Service.countDocuments({
      assignedTo: employeeId,
      status: "ongoing",
      createdAt: { $lt: oneWeekAgo }
    });
    const serviceChange = lastWeekServices > 0
      ? ((ongoingServices - lastWeekServices) / lastWeekServices * 100).toFixed(1)
      : 0;

    const lastWeekCompleted = await Project.countDocuments({
      assignedTo: employeeId,
      status: "completed",
      updatedAt: { $lt: oneWeekAgo }
    }) + await Service.countDocuments({
      assignedTo: employeeId,
      status: "completed",
      updatedAt: { $lt: oneWeekAgo }
    });
    const completedChange = lastWeekCompleted > 0
      ? ((completedTasks - lastWeekCompleted) / lastWeekCompleted * 100).toFixed(1)
      : 0;

    res.json({
      totalProjects,
      ongoingServices,
      completedTasks,
      recentBookings,
      changes: {
        projects: parseFloat(projectChange),
        services: parseFloat(serviceChange),
        completed: parseFloat(completedChange)
      }
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

