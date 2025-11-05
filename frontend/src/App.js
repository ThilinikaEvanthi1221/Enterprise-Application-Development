import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Customers from "./pages/Customers";
import Staff from "./pages/Staff";

import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Unauthorized from "./pages/Unauthorized";
import AddEmployee from "./pages/AddEmployee";

import Users from "./pages/Users";
import Appointments from "./pages/Appointments";
import Services from "./pages/Services";
import Vehicles from "./pages/Vehicles";
import TimeLogs from "./pages/TimeLogs";
import ChatBot from "./pages/ChatBot";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Dashboard - Redirects to role-specific dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-employee"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AddEmployee />
            </PrivateRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/*"
          element={
            <PrivateRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer/*"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/services"
          element={
            <PrivateRoute>
              <Services />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <PrivateRoute>
              <Vehicles />
            </PrivateRoute>
          }
        />
        <Route
          path="/time-logs"
          element={
            <PrivateRoute>
              <TimeLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <PrivateRoute>
              <ChatBot />
            </PrivateRoute>
          }
        />
        
        {/* Additional routes from Employee-dashboard branch */}
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Staff />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
