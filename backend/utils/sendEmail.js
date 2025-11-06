import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendConfirmationEmail = async (appointment) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject =
    appointment.status === "confirmed"
      ? "Your appointment is confirmed!"
      : "Your service is completed!";

  const message =
    appointment.status === "confirmed"
      ? `Dear ${appointment.customerName},\n\nYour appointment for ${appointment.serviceType} on ${new Date(
          appointment.date
        ).toDateString()} at ${appointment.timeSlot} has been confirmed.\n\nThank you for choosing AutoCare Service Center.`
      : `Dear ${appointment.customerName},\n\nYour vehicle service (${appointment.serviceType}) is now completed.\n\nThank you for trusting AutoCare Service Center.`;

  await transporter.sendMail({
    from: `"AutoCare Service Center" <${process.env.EMAIL_USER}>`,
    to: appointment.email,
    subject,
    text: message,
  });
};
