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
    const [
      usersCount,
      vehiclesCount,
      servicesCount,
      appointmentsCount,
      timeLogsCount,
    ] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      Service.countDocuments(),
      Appointment.countDocuments(),
      TimeLog.countDocuments(),
    ]);

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("vehicle", "plateNumber")
      .populate("service", "name");

    return res.json({
      totals: {
        users: usersCount,
        vehicles: vehiclesCount,
        services: servicesCount,
        appointments: appointmentsCount,
        timeLogs: timeLogsCount,
      },
      recentAppointments,
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
    const totalProjects = await Project.countDocuments({
      assignedTo: employeeId,
    });

    // Ongoing Services (including appointments)
    const ongoingServicesOld = await Service.countDocuments({
      assignedTo: employeeId,
      status: "ongoing",
    });

    const ongoingAppointments = await Appointment.countDocuments({
      assignedTo: employeeId,
      status: { $in: ["confirmed", "in-progress"] },
    });

    const ongoingServices = ongoingServicesOld + ongoingAppointments;

    // Completed Tasks (projects + services + appointments)
    const completedProjects = await Project.countDocuments({
      assignedTo: employeeId,
      status: "completed",
    });
    const completedServicesOld = await Service.countDocuments({
      assignedTo: employeeId,
      status: "completed",
    });
    const completedAppointments = await Appointment.countDocuments({
      assignedTo: employeeId,
      status: "completed",
    });
    const completedServices = completedServicesOld + completedAppointments;
    const completedTasks = completedProjects + completedServices;

    // Recent Bookings/Appointments assigned to this employee
    const recentBookings = await Appointment.find({
      assignedTo: employeeId,
    })
      .populate("customer", "name email")
      .populate("vehicle", "make model plateNumber")
      .populate("service", "name serviceType")
      .sort({ date: -1 })
      .limit(10)
      .select("-__v");

    // Format the bookings to match the expected structure
    const formattedBookings = recentBookings.map((booking) => ({
      _id: booking._id,
      customer: booking.customer,
      vehicleInfo: booking.vehicle,
      serviceType:
        booking.service?.serviceType || booking.service?.name || "Service",
      bookingDate: booking.date,
      status: booking.status,
      estimatedPrice: booking.price,
      actualPrice: booking.price,
    }));

    // Calculate percentage changes (simplified - comparing last week to this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const lastWeekProjects = await Project.countDocuments({
      assignedTo: employeeId,
      createdAt: { $lt: oneWeekAgo },
    });
    const projectChange =
      lastWeekProjects > 0
        ? (
            ((totalProjects - lastWeekProjects) / lastWeekProjects) *
            100
          ).toFixed(1)
        : 0;

    const lastWeekServices = await Service.countDocuments({
      assignedTo: employeeId,
      status: "ongoing",
      createdAt: { $lt: oneWeekAgo },
    });
    const serviceChange =
      lastWeekServices > 0
        ? (
            ((ongoingServices - lastWeekServices) / lastWeekServices) *
            100
          ).toFixed(1)
        : 0;

    const lastWeekCompleted =
      (await Project.countDocuments({
        assignedTo: employeeId,
        status: "completed",
        updatedAt: { $lt: oneWeekAgo },
      })) +
      (await Service.countDocuments({
        assignedTo: employeeId,
        status: "completed",
        updatedAt: { $lt: oneWeekAgo },
      }));
    const completedChange =
      lastWeekCompleted > 0
        ? (
            ((completedTasks - lastWeekCompleted) / lastWeekCompleted) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      totalProjects,
      ongoingServices,
      completedTasks,
      recentBookings: formattedBookings,
      changes: {
        projects: parseFloat(projectChange),
        services: parseFloat(serviceChange),
        completed: parseFloat(completedChange),
      },
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ msg: error.message });
  }
};
