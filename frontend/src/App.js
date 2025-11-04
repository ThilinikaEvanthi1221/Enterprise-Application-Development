import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import InventoryRouter from "./inventory-management/InventoryRouter";
import Dashboard from "./pages/Dashboard";

function App() {
  const token = localStorage.getItem('token');
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/inventory/*" element={<InventoryRouter />} />
        
        {/* Default Route */}
        <Route path="/" element={
          token ? <Navigate to="/inventory/dashboard" /> : <Navigate to="/login" />
        } />
        
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
