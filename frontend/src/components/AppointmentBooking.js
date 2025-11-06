import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/AppointmentBooking.css";

const SERVICE_TYPES = [
  { id: "oil-change", name: "Oil Change", duration: 30, price: 50 },
  { id: "brake-service", name: "Brake Service", duration: 60, price: 120 },
  { id: "tire-rotation", name: "Tire Rotation", duration: 45, price: 40 },
  { id: "engine-diagnostic", name: "Engine Diagnostic", duration: 90, price: 150 },
  { id: "ac-service", name: "AC Service", duration: 60, price: 100 },
  { id: "full-service", name: "Full Service", duration: 120, price: 250 },
  { id: "modification", name: "Vehicle Modification", duration: 240, price: 500 },
];

const VEHICLE_MAKES = ["Toyota", "Honda", "Ford", "BMW", "Nissan", "Hyundai", "Other"];

export default function AppointmentBooking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleMake: "",
    vehicleModel: "",
    year: "",
    licensePlate: "",
    serviceType: "",
    notes: "",
  });

  const location = useLocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Updated handleSubmit with price + proper request body
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedService = SERVICE_TYPES.find(
      (s) => s.id === formData.serviceType
    );

    if (!selectedService) {
      alert("⚠ Please select a valid service type.");
      return;
    }

    const appointmentData = {
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      vehicleMake: formData.vehicleMake,
      vehicleModel: formData.vehicleModel,
      vehicleYear: formData.year,
      licensePlate: formData.licensePlate,
      serviceType: selectedService.name, // ✅ readable service name
      price: selectedService.price, // ✅ required for backend
      date: e.target.date.value,
      timeSlot: e.target.time.value,
      notes: formData.notes,
    };

    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Appointment booked successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          vehicleMake: "",
          vehicleModel: "",
          year: "",
          licensePlate: "",
          serviceType: "",
          notes: "",
        });
        e.target.reset();
      } else {
        alert(`⚠ Booking failed: ${data.message || "Unexpected error"}`);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("❌ Failed to connect to server. Please try again later.");
    }
  };

  return (
    <div className="appointment-booking-container">
      {/* Tabs */}
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

      <h2>Book Vehicle Service Appointment</h2>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Customer Information</h3>
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-section">
          <h3>Vehicle Information</h3>
          <label>Make *</label>
          <select
            name="vehicleMake"
            value={formData.vehicleMake}
            onChange={handleInputChange}
            required
          >
            <option value="">Select make</option>
            {VEHICLE_MAKES.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>

          <label>Model *</label>
          <input
            type="text"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleInputChange}
            required
          />

          <label>Year *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            required
          />

          <label>License Plate *</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-section">
          <h3>Service Details</h3>
          <label>Service Type *</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select service</option>
            {SERVICE_TYPES.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price}
              </option>
            ))}
          </select>

          <label>Additional Notes</label>
          <textarea
            name="notes"
            rows="3"
            placeholder="Any specific concerns or requests..."
            value={formData.notes}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="form-section">
          <h3>Schedule Appointment</h3>
          <label>Date *</label>
          <input type="date" name="date" required />
          <label>Time *</label>
          <input type="time" name="time" required />
        </div>

        <button type="submit" className="submit-btn">
          Book Appointment
        </button>
      </form>
    </div>
  );
}
