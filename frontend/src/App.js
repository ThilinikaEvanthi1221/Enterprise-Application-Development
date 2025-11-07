import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Customers from "./pages/Customers";
import Staff from "./pages/Staff";
import VehicleRegister from "./pages/VehicleRegister";

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
import TimeLogReport from "./pages/TimeLogReport";
import Profile from "./pages/Profile";


// Service Request Components
import CustomerServiceRequests from "./pages/CustomerServiceRequests";
import MyServices from "./pages/MyServices";
import EmployeeServiceManagement from "./pages/EmployeeServiceManagement";
import AdminServiceManagement from "./pages/AdminServiceManagement";



function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
        <Route
          path="/time-log-reports"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <TimeLogReport />
            </PrivateRoute>
          }
        />

        <Route path="/vehicle-register" element={<VehicleRegister />} />

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

        {/* Service Request Routes */}
        <Route
          path="/customer-service-requests"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <CustomerServiceRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/my-services"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <MyServices />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee-services"
          element={
            <PrivateRoute allowedRoles={["employee"]}>
              <EmployeeServiceManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-services"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminServiceManagement />
            </PrivateRoute>
          }
        />

        {/* Legacy Routes */}
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
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
