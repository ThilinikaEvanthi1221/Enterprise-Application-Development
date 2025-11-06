const Appointment = require("../models/appointment");
const Notification = require("../models/notification");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const emailService = require("../services/emailService");

exports.listAppointments = async (req, res) => {
  try {
    const query = req.path === '/my' ? { user: req.user.id } : {};
    const items = await Appointment.find(query)
      .populate("user", "name email")
      .populate("vehicle")
      .populate("service");
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const item = await Appointment.findById(req.params.id)
      .populate("user", "name email")
      .populate("vehicle")
      .populate("service");
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    // Add the user ID from the token to the appointment
    const appointment = await Appointment.create({
      ...req.body,
      user: req.user.id
    });

    // Create notification for customer
    await Notification.create({
      user: req.user.id,
      type: 'appointment',
      title: 'Appointment Booked',
      message: `Your appointment has been scheduled for ${new Date(appointment.date).toLocaleString()}`,
      relatedTo: appointment._id,
      onModel: 'Appointment'
    });

    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map(admin => 
      Notification.create({
        user: admin._id,
        type: 'appointment',
        title: 'New Appointment Request',
        message: `New appointment request from ${req.user.name} for ${new Date(appointment.date).toLocaleString()}`,
        relatedTo: appointment._id,
        onModel: 'Appointment'
      })
    ));

    // Send confirmation email
    try {
      await emailService.sendAppointmentConfirmation(req.user.email, appointment);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
    }

    // Populate the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("user", "name email")
      .populate("vehicle")
      .populate("service");

    return res.status(201).json(populatedAppointment);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: "Appointment not found" });
    return res.json({ msg: "Appointment deleted" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


