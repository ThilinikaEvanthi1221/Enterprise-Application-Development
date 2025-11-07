import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";

// Public Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Unauthorized from "./pages/Unauthorized";

// Common Dashboards
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

// Management Pages
import AddEmployee from "./pages/AddEmployee";
import Users from "./pages/Users";
import Appointments from "./pages/Appointments";
import Services from "./pages/Services";
import Vehicles from "./pages/Vehicles";
import TimeLogs from "./pages/TimeLogs";
import ChatBot from "./pages/ChatBot";
import Bookings from "./pages/Bookings";
import Customers from "./pages/Customers";
import Staff from "./pages/Staff";

// Service Request Components
import CustomerServiceRequests from "./pages/CustomerServiceRequests";
import EmployeeServiceManagement from "./pages/EmployeeServiceManagement";
import AdminServiceManagement from "./pages/AdminServiceManagement";

// Modification Management
import RequestModificationPage from "./modification-management/pages/RequestModificationPage";
import ModificationUpdatesPage from "./modification-management/pages/ModificationUpdatesPage";
import ModificationDashboardPage from "./modification-management/pages/ModificationDashboardPage";
import AdminModificationPanel from "./modification-management/pages/AdminModificationPanel";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 🔒 Protected Dashboard Redirect */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* 🧭 Admin Routes */}
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
          path="/staff"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Staff />
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

        {/* ✅ Fixed Admin Modifications Route */}
        <Route
          path="/admin/modifications"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminModificationPanel />
            </PrivateRoute>
          }
        />

        {/* 👷 Employee Routes */}
        <Route
          path="/employee/*"
          element={
            <PrivateRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
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

        {/* 👤 Customer Routes */}
        <Route
          path="/customer/*"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/service-requests"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <CustomerServiceRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/modification/dashboard"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <ModificationDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/modification-updates"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <ModificationUpdatesPage />
            </PrivateRoute>
          }
        />

        {/* 🧩 Shared Routes */}
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

        {/* 🚫 404 Fallback */}
        <Route
          path="*"
          element={
            <h1 className="text-center mt-10 text-red-600">
              404 - Page Not Found
            </h1>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
