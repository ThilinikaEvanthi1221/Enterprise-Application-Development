import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendConfirmationEmail = async (appointment) => {
  try {
    // ✅ Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Define subject & message for each status
    let subject = "";
    let message = "";

    switch (appointment.status) {
      case "pending":
        subject = "We’ve received your appointment request!";
        message = `Dear ${appointment.customerName},

Thank you for booking your ${appointment.serviceType} appointment with AutoCare Service Center.

📅 Requested Date: ${new Date(appointment.date).toDateString()}
🕒 Time Slot: ${appointment.timeSlot}

Our team will review your request shortly and confirm your appointment via email.

Best regards,  
AutoCare Service Center Team`;
        break;

      case "confirmed":
        subject = "Your appointment has been confirmed!";
        message = `Dear ${appointment.customerName},

Your appointment for ${appointment.serviceType} on ${new Date(
          appointment.date
        ).toDateString()} at ${appointment.timeSlot} has been confirmed.

We look forward to serving you soon.

Best regards,  
AutoCare Service Center Team`;
        break;

      case "completed":
        subject = "Your vehicle service is now complete!";
        message = `Dear ${appointment.customerName},

We’re happy to inform you that your ${appointment.serviceType} has been successfully completed.

You can now pick up your vehicle at your convenience.

Thank you for trusting AutoCare Service Center.

Warm regards,  
AutoCare Service Center Team`;
        break;

      case "cancelled":
        subject = "Your appointment has been cancelled";
        message = `Dear ${appointment.customerName},

Your appointment for ${appointment.serviceType} scheduled on ${new Date(
          appointment.date
        ).toDateString()} at ${appointment.timeSlot} has been cancelled.

If this was unintentional, please contact us to reschedule.

Best regards,  
AutoCare Service Center Team`;
        break;

      default:
        subject = "Appointment Update";
        message = `Dear ${appointment.customerName},

There’s an update regarding your ${appointment.serviceType} appointment.

Best regards,  
AutoCare Service Center Team`;
        break;
    }

    // ✅ Send email
    const info = await transporter.sendMail({
      from: `"AutoCare Service Center" <${process.env.EMAIL_USER}>`,
      to: appointment.email,
      subject,
      text: message,
    });

    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};
