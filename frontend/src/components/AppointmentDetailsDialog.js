import React from "react";
import "../styles/AppointmentDetailsDialog.css";

export default function AppointmentDetailsDialog({ appointment, onClose }) {
  if (!appointment) return null;

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProgress = () => {
    switch (appointment.status) {
      case "confirmed":
        return { progress: 10, stage: "Waiting for service date", eta: "Scheduled" };
      case "in-progress":
        return { progress: 60, stage: "Technician working on vehicle", eta: "30 min remaining" };
      case "completed":
        return { progress: 100, stage: "Service completed", eta: "Ready for pickup" };
      case "cancelled":
        return { progress: 0, stage: "Cancelled", eta: "N/A" };
      default:
        return { progress: 0, stage: "Unknown", eta: "N/A" };
    }
  };

  const progress = getProgress();

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <div className="dialog-header">
          <h2>{appointment.serviceType}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <p className="dialog-subtitle">
          Booking ID: <strong>{appointment.bookingId}</strong> &nbsp;|&nbsp;
          Status: <span className={`status-badge ${appointment.status}`}>{appointment.status}</span>
        </p>

        <hr />

        {/* --- Overview --- */}
        <div className="dialog-section">
          <h3>Overview</h3>
          <div className="info-grid">
            <div><strong>Date:</strong> {formatDate(appointment.date)}</div>
            <div><strong>Time:</strong> {appointment.timeSlot} ({appointment.duration} min)</div>
            <div><strong>Vehicle:</strong> {appointment.vehicle}</div>
            <div><strong>License Plate:</strong> {appointment.licensePlate}</div>
          </div>
        </div>

        {/* --- Customer Info --- */}
        <div className="dialog-section">
          <h3>Customer Information</h3>
          <div className="info-grid">
            <div><strong>Name:</strong> {appointment.customerName || "John Doe"}</div>
            <div><strong>Email:</strong> {appointment.email || "john@example.com"}</div>
            <div><strong>Phone:</strong> {appointment.phone || "(555) 123-4567"}</div>
          </div>
        </div>

        {/* --- Progress --- */}
        <div className="dialog-section">
          <h3>Service Progress</h3>
          <p><strong>Stage:</strong> {progress.stage}</p>
          <p><strong>ETA:</strong> {progress.eta}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.progress}%` }}></div>
          </div>
        </div>

        {/* --- Invoice --- */}
        <div className="dialog-section">
          <h3>Invoice</h3>
          <div className="invoice-box">
            <div className="invoice-row">
              <span>{appointment.serviceType}</span>
              <span>${appointment.price.toFixed(2)}</span>
            </div>
            <div className="invoice-row">
              <span>Labor</span>
              <span>$0.00</span>
            </div>
            <div className="invoice-row total">
              <span>Total</span>
              <span>${appointment.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* --- Footer Buttons --- */}
        <div className="dialog-actions">
          <button className="secondary-btn" onClick={onClose}>Close</button>
          <button className="primary-btn" onClick={() => window.print()}>Print</button>
        </div>
      </div>
    </div>
  );
}
