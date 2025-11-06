import Appointment from "../models/appointment.js";
import { sendConfirmationEmail } from "../utils/sendEmail.js";

// 🧾 Customer books appointment
export const createAppointment = async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create appointment.",
      error: error.message,
    });
  }
};

// 👀 Admin views all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
      error: error.message,
    });
  }
};

// 🛠 Admin updates appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    appointment.status = status;
    await appointment.save();

    // ✉️ Send email only if confirmed or completed
    if (["confirmed", "completed"].includes(status)) {
      await sendConfirmationEmail(appointment);
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to '${status}'.`,
      appointment,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status.",
      error: error.message,
    });
  }
};
