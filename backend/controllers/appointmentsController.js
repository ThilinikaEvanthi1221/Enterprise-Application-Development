const Appointment = require("../models/appointment");
const Notification = require("../models/notification");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const emailService = require("../services/emailService");


// In-memory storage for appointments and options
const appointments = [];

// Constants for the hardcoded data
const SERVICES = {
  '1': { id: '1', name: 'Oil Change', price: 79.99, duration: 45 },
  '2': { id: '2', name: 'Tire Rotation', price: 49.99, duration: 30 },
  '3': { id: '3', name: 'Brake Service', price: 199.99, duration: 90 },
  '4': { id: '4', name: 'Engine Diagnostic', price: 89.99, duration: 60 },
  '5': { id: '5', name: 'AC Service', price: 129.99, duration: 60 }
};

const VEHICLES = {
  '1': { id: '1', name: 'Toyota Camry (2020) - ABC123' },
  '2': { id: '2', name: 'Honda CR-V (2019) - XYZ789' },
  '3': { id: '3', name: 'Ford F-150 (2021) - DEF456' }
};

exports.createAppointment = async (req, res) => {
  try {
    const { vehicle, service, date, time, notes } = req.body;
    
    // Validate vehicle
    const selectedVehicle = VEHICLES[vehicle];
    if (!selectedVehicle) {
      return res.status(400).json({ message: 'Invalid vehicle selected' });
    }

    // Validate service
    const selectedService = SERVICES[service];
    if (!selectedService) {
      return res.status(400).json({ message: 'Invalid service selected' });
    }

    // Create appointment datetime
    const appointmentDate = new Date(date + 'T' + time);
    
    // Create new appointment
    const newAppointment = {
      id: Date.now().toString(), // Simple ID generation
      customer: req.user.id,
      customerName: req.user.name,
      vehicle: selectedVehicle,
      service: selectedService,
      date: appointmentDate,
      notes,
      status: 'pending',
      createdAt: new Date()
    };

    // Add to in-memory storage
    appointments.push(newAppointment);

    res.status(201).json(newAppointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(400).json({ message: 'Failed to create appointment' });
  }
};

exports.listAppointments = async (req, res) => {
  try {
    // Filter appointments for the current user
    const userAppointments = appointments.filter(apt => apt.customer === req.user.id);
    
    // Group appointments by status
    const stats = {
      active: userAppointments.filter(apt => apt.status === 'in-progress').length,
      pending: userAppointments.filter(apt => apt.status === 'pending').length,
      completed: userAppointments.filter(apt => apt.status === 'completed').length,
      total: userAppointments.length
    };

    res.json({
      appointments: userAppointments,
      stats: stats
    });
  } catch (err) {
    console.error('Error listing appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
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

const { sendAppointmentConfirmation, sendNewAppointmentAlert } = require('../services/emailService');

exports.confirmAppointment = async (req, res) => {
  try {
    const { appointmentId, emailData } = req.body;
    
    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate('customer')
      .populate('vehicle');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Send confirmation email to customer
    await sendAppointmentConfirmation(appointment, appointment.customer, emailData);

    // Send notification email to staff
    const staffEmails = await User.find({ role: 'employee' }).select('email');
    for (const staff of staffEmails) {
      await sendNewAppointmentAlert(appointment, appointment.customer, emailData, staff.email);
    }

    // Create notification for the customer
    await Notification.create({
      user: appointment.customer._id,
      title: 'Appointment Confirmed',
      message: `Your appointment for ${emailData.service} has been confirmed for ${emailData.date} at ${emailData.time}`,
      type: 'APPOINTMENT',
      status: 'unread',
      relatedId: appointmentId
    });

    // Create notifications for staff
    const staffMembers = await User.find({ role: 'employee' });
    await Promise.all(staffMembers.map(staff => 
      Notification.create({
        user: staff._id,
        title: 'New Appointment',
        message: `New appointment scheduled for ${emailData.service} on ${emailData.date} at ${emailData.time}`,
        type: 'APPOINTMENT',
        status: 'unread',
        relatedId: appointmentId
      })
    ));

    res.json({ message: 'Appointment confirmed and notifications sent' });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ message: 'Failed to confirm appointment' });
  }
};

// Check availability for a given service and date
exports.checkAvailability = async (req, res) => {
  try {
    console.log('Received availability check request:', req.body);
    
    const { serviceId, date } = req.body;
    
    if (!date) {
      return res.status(400).json({
        available: false,
        message: 'Date is required'
      });
    }

    // Parse the date string into a Date object
    const appointmentDate = new Date(date);
    
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        available: false,
        message: 'Invalid date format'
      });
    }

    // Check if within business hours (8 AM to 6 PM)
    const hour = appointmentDate.getHours();
    const isWithinBusinessHours = hour >= 8 && (hour < 18 || (hour === 17 && appointmentDate.getMinutes() === 0));

    if (!isWithinBusinessHours) {
      return res.json({
        available: false,
        message: 'Selected time is outside business hours (8 AM - 6 PM)'
      });
    }

    // For now, just return available if within business hours
    res.json({
      available: true,
      message: 'Time slot is available'
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ 
      available: false,
      message: 'Error checking availability: ' + error.message 
    });
  }
};

// Get customer's own appointments
exports.myAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For our hardcoded implementation, filter the in-memory appointments
    const userAppointments = appointments.filter(apt => apt.customer === userId);
    
    // Calculate stats
    const stats = {
      active: userAppointments.filter(apt => apt.status === 'in-progress').length,
      pending: userAppointments.filter(apt => apt.status === 'pending').length,
      completed: userAppointments.filter(apt => apt.status === 'completed').length,
      total: userAppointments.length
    };

    // Send both appointments and stats
    res.json({
      appointments: userAppointments,
      stats: stats
    });
  } catch (err) {
    console.error('Error fetching user appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};


