const Appointment = require("../models/appointment");
const Notification = require("../models/notification");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const emailService = require("../services/emailService");

// Create appointment (DB-backed)
exports.createAppointment = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      customer: req.user.id || req.user._id,
    };

    const appointment = await Appointment.create(payload);

    // Create notification for customer
    try {
      await Notification.create({
        user: req.user.id,
        type: "appointment",
        title: "Appointment Booked",
        message: `Your appointment has been scheduled for ${new Date(appointment.date || appointment.scheduledAt).toLocaleString()}`,
        relatedTo: appointment._id,
        onModel: "Appointment",
      });
    } catch (e) {
      console.warn('Failed to create customer notification:', e);
    }

    // Notify admins
    try {
      const admins = await User.find({ role: 'admin' }).select('_id email name');
      await Promise.all(admins.map(admin => 
        Notification.create({
          user: admin._id,
          type: 'appointment',
          title: 'New Appointment Request',
          message: `New appointment request from ${req.user.name || req.user.email} for ${new Date(appointment.date || appointment.scheduledAt).toLocaleString()}`,
          relatedTo: appointment._id,
          onModel: 'Appointment'
        })
      ));
    } catch (e) {
      console.warn('Failed to create admin notifications:', e);
    }

    // Send confirmation email (best effort)
    try {
      await emailService.sendAppointmentConfirmation(req.user.email, appointment);
    } catch (e) {
      console.warn('Failed to send confirmation email:', e);
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('customer', 'name email')
      .populate('vehicle')
      .populate('service');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating appointment:', err);
    return res.status(500).json({ message: err.message || 'Failed to create appointment' });
  }
};

// List all appointments (admin)
exports.listAppointments = async (req, res) => {
  try {
    const items = await Appointment.find()
      .populate('customer', 'name email')
      .populate('vehicle')
      .populate('service')
      .sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error('Error listing appointments:', err);
    return res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
  try {
    const item = await Appointment.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('vehicle')
      .populate('service');
    if (!item) return res.status(404).json({ msg: 'Appointment not found' });
    return res.json(item);
  } catch (err) {
    console.error('Error getting appointment:', err);
    return res.status(500).json({ msg: err.message });
  }
};

// Update
exports.updateAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ msg: 'Appointment not found' });
    return res.json(item);
  } catch (err) {
    console.error('Error updating appointment:', err);
    return res.status(500).json({ msg: err.message });
  }
};

// Delete
exports.deleteAppointment = async (req, res) => {
  try {
    const item = await Appointment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Appointment not found' });
    return res.json({ msg: 'Appointment deleted' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    return res.status(500).json({ msg: err.message });
  }
};

// Confirm appointment (send emails/notifications)
exports.confirmAppointment = async (req, res) => {
  try {
    const { appointmentId, emailData } = req.body;
    const appointment = await Appointment.findById(appointmentId)
      .populate('customer')
      .populate('vehicle')
      .populate('service');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    try {
      await emailService.sendAppointmentConfirmation(appointment.customer.email, appointment);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
    }

    // Notify staff
    try {
      const staffMembers = await User.find({ role: 'employee' });
      await Promise.all(staffMembers.map(staff =>
        Notification.create({
          user: staff._id,
          title: 'New Appointment',
          message: `New appointment scheduled for ${appointment.service?.name} on ${emailData?.date} at ${emailData?.time}`,
          type: 'APPOINTMENT',
          status: 'unread',
          relatedId: appointmentId
        })
      ));
    } catch (e) {
      console.warn('Failed to notify staff:', e);
    }

    // Notify customer
    try {
      await Notification.create({
        user: appointment.customer._id,
        title: 'Appointment Confirmed',
        message: `Your appointment for ${appointment.service?.name} has been confirmed for ${emailData?.date} at ${emailData?.time}`,
        type: 'APPOINTMENT',
        status: 'unread',
        relatedId: appointmentId
      });
    } catch (e) {
      console.warn('Failed to create customer confirmation notification:', e);
    }

    return res.json({ message: 'Appointment confirmed and notifications sent' });
  } catch (err) {
    console.error('Error confirming appointment:', err);
    return res.status(500).json({ message: 'Failed to confirm appointment' });
  }
};

// Check availability simple
exports.checkAvailability = async (req, res) => {
  try {
    const { serviceId, date } = req.body || req.query || {};
    if (!date) return res.status(400).json({ available: false, message: 'Date is required' });
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) return res.status(400).json({ available: false, message: 'Invalid date format' });
    const hour = appointmentDate.getHours();
    const isWithinBusinessHours = hour >= 8 && hour < 18;
    if (!isWithinBusinessHours) return res.json({ available: false, message: 'Selected time is outside business hours (8 AM - 6 PM)' });
    return res.json({ available: true, message: 'Time slot is available' });
  } catch (err) {
    console.error('Error checking availability:', err);
    return res.status(500).json({ available: false, message: 'Error checking availability' });
  }
};

// Check available slots for date
exports.checkAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ msg: 'Date is required' });
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23,59,59,999);

    const items = await Appointment.find({ date: { $gte: startOfDay, $lte: endOfDay }, status: { $nin: ['cancelled','completed'] } }).select('date');

    const allSlots = [
      '08:00', '09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'
    ];

    const booked = items.map(a => new Date(a.date).getHours().toString().padStart(2,'0') + ':00');
    const slots = allSlots.map(s => ({ slot: s, available: !booked.includes(s), booked: booked.includes(s) }));

    return res.json({ date: selectedDate.toISOString().split('T')[0], totalSlots: allSlots.length, availableCount: slots.filter(s=>s.available).length, bookedCount: booked.length, slots });
  } catch (err) {
    console.error('Error checking available slots:', err);
    return res.status(500).json({ msg: err.message });
  }
};
