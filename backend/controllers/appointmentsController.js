const Appointment = require("../models/appointment");

exports.listAppointments = async (req, res) => {
  try {
    const items = await Appointment.find()
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

const { sendEmail } = require('../utils/emailService');

exports.createAppointment = async (req, res) => {
  try {
    const item = await Appointment.create(req.body);
    
    // Populate necessary fields for email
    const populatedAppointment = await Appointment.findById(item._id)
      .populate('user', 'name email')
      .populate('vehicle')
      .populate('service');

    // Send confirmation email
    await sendEmail(
      populatedAppointment.user.email,
      'bookingConfirmation',
      {
        user: {
          name: populatedAppointment.user.name
        },
        details: {
          serviceName: populatedAppointment.service.name,
          vehicleDetails: `${populatedAppointment.vehicle.make} ${populatedAppointment.vehicle.model}`,
          date: populatedAppointment.date,
          time: populatedAppointment.time
        }
      }
    );

    // Create initial progress log
    const ProgressLog = require('../models/progressLog');
    await ProgressLog.create({
      serviceId: populatedAppointment.service._id,
      vehicleId: populatedAppointment.vehicle._id,
      customerId: populatedAppointment.user._id,
      updatedBy: req.user.id,
      status: 'Pending',
      progress: 0,
      notes: 'Appointment scheduled'
    });

    return res.status(201).json(populatedAppointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
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


