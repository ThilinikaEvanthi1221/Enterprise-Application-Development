import React, { useEffect, useState } from "react";
import "../styles/AdminAppointmentManagement.css";

console.log("✅ Appointment Management loaded");

export default function AdminAppointmentManagement({ filter }) {
  const [appointments, setAppointments] = useState([]);

  // Fetch all appointments from backend
  useEffect(() => {
    fetchAppointments();
  }, []);

const fetchAppointments = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/appointments");
    const data = await res.json();
    setAppointments(data.appointments || []); // ✅ safe access
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};

  // Filter appointments based on tab
  const filteredAppointments = appointments.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  // Update appointment status (confirm, reject, complete, etc.)
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
        );
        alert(`✅ Appointment ${newStatus} successfully!`);
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  return (
    <div className="admin-appointment-list">
      {filteredAppointments.length === 0 ? (
        <p className="no-data">No appointments found for this category.</p>
      ) : (
        filteredAppointments.map((apt) => (
          <div key={apt._id} className="appointment-card">
            <div className="card-header">
              <h3>{apt.serviceType}</h3>
              <span className={`status ${apt.status}`}>{apt.status}</span>
            </div>

            <div className="card-body">
              <p><strong>Customer:</strong> {apt.customerName}</p>
              <p><strong>Email:</strong> {apt.email}</p>
              <p><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {apt.timeSlot}</p>
              <p><strong>Vehicle:</strong> {apt.vehicleMake} {apt.vehicleModel}</p>
            </div>

            <div className="card-actions">
              {apt.status === "pending" && (
                <>
                  <button
                    className="confirm-btn"
                    onClick={() => updateStatus(apt._id, "confirmed")}
                  >
                    Confirm
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => updateStatus(apt._id, "rejected")}
                  >
                    Reject
                  </button>
                </>
              )}
              {apt.status === "confirmed" && (
                <button
                  className="progress-btn"
                  onClick={() => updateStatus(apt._id, "in-progress")}
                >
                  Mark In Progress
                </button>
              )}
              {apt.status === "in-progress" && (
                <button
                  className="complete-btn"
                  onClick={() => updateStatus(apt._id, "completed")}
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
