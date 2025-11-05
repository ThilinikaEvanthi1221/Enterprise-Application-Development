const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password if using Gmail
  }
});

// Email templates
const emailTemplates = {
  bookingConfirmation: (userDetails, bookingDetails) => ({
    subject: 'Booking Confirmation - Auto Service Center',
    html: `
      <h2>Booking Confirmation</h2>
      <p>Dear ${userDetails.name},</p>
      <p>Your vehicle service booking has been confirmed. Here are the details:</p>
      <ul>
        <li><strong>Service Type:</strong> ${bookingDetails.serviceName}</li>
        <li><strong>Vehicle:</strong> ${bookingDetails.vehicleDetails}</li>
        <li><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${bookingDetails.time}</li>
      </ul>
      <p>You can track the progress of your service in real-time through our customer dashboard.</p>
      <p>Thank you for choosing our service!</p>
    `
  }),

  progressUpdate: (userDetails, progressDetails) => ({
    subject: 'Service Progress Update',
    html: `
      <h2>Service Progress Update</h2>
      <p>Dear ${userDetails.name},</p>
      <p>There has been an update to your vehicle service:</p>
      <ul>
        <li><strong>Status:</strong> ${progressDetails.status}</li>
        <li><strong>Progress:</strong> ${progressDetails.progress}%</li>
        <li><strong>Notes:</strong> ${progressDetails.notes || 'No additional notes'}</li>
      </ul>
      <p>You can view more details on your customer dashboard.</p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data.user, data.details);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Auto Service Center" <noreply@autoservice.com>',
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};
