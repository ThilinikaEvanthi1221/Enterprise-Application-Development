import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppointmentBooking from "./components/AppointmentBooking";
import AppointmentList from "./components/AppointmentList";
import HeaderBar from "./components/HeaderBar";

function App() {
  return (
    <Router>
      <HeaderBar />
      <Routes>
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/appointments" element={<AppointmentList />} />
      </Routes>
    </Router>
  );
}

export default App;
