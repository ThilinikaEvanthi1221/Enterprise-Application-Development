import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppointmentDetailsDialog from "./AppointmentDetailsDialog";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/AppointmentList.css";

const MOCK_APPOINTMENTS = [
  {
    id: "APT-01",
    serviceType: "Oil Change",
    bookingId: "APT-1730450123",
    date: "2025-11-05",
    timeSlot: "09:00 AM",
    duration: 30,
    vehicle: "2022 Toyota Camry",
    licensePlate: "ABC-1234",
    price: 50,
    status: "confirmed",
  },
  {
    id: "APT-02",
    serviceType: "Brake Service",
    bookingId: "APT-1730450456",
    date: "2025-11-03",
    timeSlot: "02:00 PM",
    duration: 60,
    vehicle: "2021 Honda Accord",
    licensePlate: "XYZ-5678",
    price: 120,
    status: "in-progress",
  },
  {
    id: "APT-03",
    serviceType: "Full Service",
    bookingId: "APT-1730450789",
    date: "2025-10-25",
    timeSlot: "10:00 AM",
    duration: 120,
    vehicle: "2023 BMW X5",
    licensePlate: "BMW-2024",
    price: 250,
    status: "completed",
  },
  {
    id: "APT-04",
    serviceType: "Tire Rotation",
    bookingId: "APT-1730451000",
    date: "2025-10-20",
    timeSlot: "11:30 AM",
    duration: 45,
    vehicle: "2020 Ford F-150",
    licensePlate: "FRD-9876",
    price: 40,
    status: "cancelled",
  },
];

export default function AppointmentList() {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const location = useLocation();

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

  const confirmCancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
    setShowConfirm(false);
    setAppointmentToCancel(null);
    alert("✅ Appointment cancelled successfully!");
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

  const handleViewDetails = (apt) => {
    setSelectedAppointment(apt);
    setShowDialog(true);
  };

  const filtered = filterAppointments(activeTab);

  return (
    <div className="appointment-page-container">
      {/* Top navigation tabs */}
      <div className="page-tabs">
        <Link
          to="/book-appointment"
          className={`tab-btn ${
            location.pathname === "/book-appointment" ? "active" : ""
          }`}
        >
          📅 Book Appointment
        </Link>
        <Link
          to="/appointments"
          className={`tab-btn ${
            location.pathname === "/appointments" ? "active" : ""
          }`}
        >
          ⏱️ My Appointments
        </Link>
      </div>

      {/* Main container */}
      <div className="appointment-container">
        <h2>My Appointments</h2>
        <p className="subtitle">View and manage your service appointments</p>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={activeTab === "upcoming" ? "active" : ""}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({filterAppointments("upcoming").length})
          </button>
          <button
            className={activeTab === "past" ? "active" : ""}
            onClick={() => setActiveTab("past")}
          >
            Past ({filterAppointments("past").length})
          </button>
          <button
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            All ({appointments.length})
          </button>
        </div>

        {/* Appointment list */}
        <div className="appointment-list">
          {filtered.length === 0 ? (
            <p className="no-appointments">No appointments available.</p>
          ) : (
            filtered.map((apt) => (
              <div key={apt.id} className="appointment-card">
                <div className="card-header">
                  <h3>{apt.serviceType}</h3>
                  <span className={getStatusClass(apt.status)}>
                    {apt.status}
                  </span>
                </div>

                <div className="card-content">
                  <p>
                    <strong>Booking ID:</strong> {apt.bookingId}
                  </p>
                  <p>
                    <strong>Date:</strong> {apt.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {apt.timeSlot} ({apt.duration} min)
                  </p>
                  <p>
                    <strong>Vehicle:</strong> {apt.vehicle}
                  </p>
                  <p>
                    <strong>Plate:</strong> {apt.licensePlate}
                  </p>
                  <p>
                    <strong>Total:</strong> ${apt.price}
                  </p>
                </div>

                <div className="card-actions">
                  {apt.status === "confirmed" && (
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setAppointmentToCancel(apt);
                        setShowConfirm(true);
                      }}
                    >
                      Cancel Appointment
                    </button>
                  )}
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetails(apt)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment Details Dialog */}
      {showDialog && selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          onClose={() => setShowDialog(false)}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirm && appointmentToCancel && (
        <ConfirmDialog
          open={showConfirm}
          message={`Are you sure you want to cancel the appointment for "${appointmentToCancel.serviceType}" on ${appointmentToCancel.date}?`}
          onConfirm={() => confirmCancelAppointment(appointmentToCancel.id)}
          onCancel={() => {
            setShowConfirm(false);
            setAppointmentToCancel(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="appointment-footer">
        © 2025 AutoCare Service Center. All rights reserved.
      </footer>
    </div>
  );
}
