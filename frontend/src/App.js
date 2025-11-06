import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/login";
import Signup from "./pages/signup";

// Components
import AppointmentBooking from "./components/AppointmentBooking";
import AppointmentList from "./components/AppointmentList";
import HeaderBar from "./components/HeaderBar";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Appointment Routes */}
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/appointments" element={<AppointmentList />} />
        
        {/* Header Route (for testing) */}
        <Route path="/header" element={<HeaderBar />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
