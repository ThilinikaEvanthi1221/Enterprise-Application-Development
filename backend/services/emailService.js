const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// HTML email templates
const getAppointmentConfirmationTemplate = (appointment, user, vehicle) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Appointment Confirmation</h2>
    <p>Dear ${user.name},</p>
    <p>Your service appointment has been successfully booked.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #3498db; margin-top: 0;">Appointment Details</h3>
      <p><strong>Date & Time:</strong> ${new Date(appointment.scheduledAt).toLocaleString()}</p>
      <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
      <p><strong>Service Type:</strong> ${appointment.service.name}</p>
      <p><strong>Status:</strong> ${appointment.status}</p>
    </div>
    <p>If you need to make any changes, please contact us or visit our website.</p>
    <p style="color: #7f8c8d; font-size: 0.9em;">Thank you for choosing our service.</p>
  </div>
`;

const getNewAppointmentAlertTemplate = (appointment, customer, vehicle) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">New Appointment Alert</h2>
    <p>A new service appointment has been scheduled.</p>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #3498db; margin-top: 0;">Appointment Details</h3>
      <p><strong>Customer:</strong> ${customer.name}</p>
      <p><strong>Date & Time:</strong> ${new Date(appointment.scheduledAt).toLocaleString()}</p>
      <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model} (${vehicle.year})</p>
      <p><strong>Service Type:</strong> ${appointment.service.name}</p>
    </div>
    <p>Please review and prepare for this appointment.</p>
  </div>
`;

const getPasswordResetTemplate = (resetUrl, userName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Password Reset Request</h2>
    <p>Dear ${userName},</p>
    <p>We received a request to reset your password. Click the button below to reset it:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
    <p style="color: #e74c3c; font-weight: bold;">This link will expire in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px;">Thank you,<br>The Support Team</p>
  </div>
`;

const getPasswordResetConfirmationTemplate = (userName) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #27ae60;">Password Successfully Reset</h2>
    <p>Dear ${userName},</p>
    <p>Your password has been successfully reset.</p>
    <p>You can now log in with your new password.</p>
    <p>If you didn't make this change, please contact support immediately.</p>
    <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px;">Thank you,<br>The Support Team</p>
  </div>
`;

// Email sending functions
const sendAppointmentConfirmation = async (appointment, user, vehicle) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Service Appointment Confirmation',
      html: getAppointmentConfirmationTemplate(appointment, user, vehicle)
    });
    console.log('Confirmation email sent to customer');
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

const sendNewAppointmentAlert = async (appointment, customer, vehicle, staffEmail) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: staffEmail,
      subject: 'New Service Appointment',
      html: getNewAppointmentAlertTemplate(appointment, customer, vehicle)
    });
    console.log('Alert email sent to staff');
    return true;
  } catch (error) {
    console.error('Error sending alert email:', error);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: getPasswordResetTemplate(resetUrl, userName)
    });
    console.log('Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

const sendPasswordResetConfirmation = async (email, userName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Successful',
      html: getPasswordResetConfirmationTemplate(userName)
    });
    console.log('Password reset confirmation email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return false;
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendNewAppointmentAlert,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation
};
