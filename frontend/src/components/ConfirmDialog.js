import React from "react";
import "../styles/ConfirmDialog.css";

export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <h3>Confirm Action</h3>
        <p>{message}</p>

        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>
            No, Go Back
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            Yes, Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
