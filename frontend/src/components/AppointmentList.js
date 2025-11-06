import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/AppointmentList.css";

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const location = useLocation();

  useEffect(() => {
    fetchAppointments();
  }, []);

const fetchAppointments = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/appointments");
    const data = await res.json();

    // ✅ Fix: your backend returns { success: true, appointments: [...] }
    if (data.success && Array.isArray(data.appointments)) {
      setAppointments(data.appointments);
    } else if (Array.isArray(data)) {
      setAppointments(data); // fallback if backend returns raw array
    } else {
      console.error("Unexpected response format:", data);
      setAppointments([]); // fallback to avoid crash
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a))
      );
      alert("✅ Appointment cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("⚠ Failed to cancel appointment. Please try again later.");
    }
  };

  const filterAppointments = (status) => {
    const today = new Date();
    if (status === "upcoming")
      return appointments.filter(
        (a) => new Date(a.date) >= today && a.status === "confirmed"
      );
    if (status === "past")
      return appointments.filter(
        (a) =>
          new Date(a.date) < today ||
          ["completed", "cancelled"].includes(a.status)
      );
    return appointments;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status confirmed";
      case "in-progress":
        return "status in-progress";
      case "completed":
        return "status completed";
      case "cancelled":
        return "status cancelled";
      default:
        return "status";
    }
  };

  const filtered = filterAppointments(activeTab);

  return (
    <div className="appointment-page-container">
      <div className="page-tabs">
        <Link
          to="/book-appointment"
          className={`tab-btn ${location.pathname === "/book-appointment" ? "active" : ""}`}
        >
          📅 Book Appointment
        </Link>
        <Link
          to="/appointments"
          className={`tab-btn ${location.pathname === "/appointments" ? "active" : ""}`}
        >
          ⏱️ My Appointments
        </Link>
      </div>

      <div className="appointment-container">
        <h2>My Appointments</h2>
        <p className="subtitle">View, track, and manage your service bookings</p>

        <div className="filter-tabs">
          <button className={activeTab === "upcoming" ? "active" : ""} onClick={() => setActiveTab("upcoming")}>
            Upcoming ({filterAppointments("upcoming").length})
          </button>
          <button className={activeTab === "past" ? "active" : ""} onClick={() => setActiveTab("past")}>
            Past ({filterAppointments("past").length})
          </button>
          <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
            All ({appointments.length})
          </button>
        </div>

        <div className="appointment-list">
          {filtered.length === 0 ? (
            <p className="no-appointments">No appointments found.</p>
          ) : (
            filtered.map((apt) => (
              <div key={apt._id || apt.id} className="appointment-card">
                <div className="card-header">
                  <h3>{apt.serviceType}</h3>
                  <span className={getStatusClass(apt.status)}>{apt.status}</span>
                </div>

                <div className="card-content">
                  <p><strong>Booking ID:</strong> {apt.bookingId}</p>
                  <p><strong>Date:</strong> {apt.date}</p>
                  <p><strong>Time:</strong> {apt.timeSlot} ({apt.duration} min)</p>
                  <p><strong>Vehicle:</strong> {apt.vehicleMake ? `${apt.vehicleYear} ${apt.vehicleMake} ${apt.vehicleModel}` : apt.vehicle}</p>
                  <p><strong>Plate:</strong> {apt.licensePlate || apt.vehiclePlate}</p>
                  <p><strong>Total:</strong> ${apt.price}</p>
                </div>

                <div className="card-actions">
                  {apt.status === "confirmed" && (
                    <button className="cancel-btn" onClick={() => handleCancelAppointment(apt._id || apt.id)}>
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
