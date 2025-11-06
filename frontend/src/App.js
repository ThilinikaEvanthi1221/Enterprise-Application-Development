import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Customer pages
import AppointmentBooking from "./components/AppointmentBooking";
import AppointmentList from "./components/AppointmentList";

// Admin page
import AdminAppointmentsDashboard from "./components/AdminAppointmentsDashboard";

// Shared header
import HeaderBar from "./components/HeaderBar";

// Styles
import "./App.css";

function App() {
  return (
    <Router>
      {/* ====== Header Bar ====== */}
      <HeaderBar />

 
      
      {/* ====== Routes ====== */}
      <Routes>
        {/* Customer Routes */}
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/appointments" element={<AppointmentList />} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminAppointmentsDashboard />} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/book-appointment" />} />
      </Routes>
    </Router>
  );
}

export default App;
