import React, { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route } from "react-router-dom";
import { getDashboardStats } from "../services/api";
import Bookings from "./Bookings";
import Customers from "./Customers";
import Staff from "./Staff";
import InventoryDashboard from "../inventory-management/pages/InventoryDashboard";
import Reports from "../inventory-management/pages/Reports";
import PartsManagement from "../inventory-management/pages/PartsManagement";
import StockAdjustment from "../inventory-management/pages/StockAdjustment";
import "./Dashboard.css";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    ongoingServices: 0,
    completedTasks: 0,
    recentBookings: [],
    changes: { projects: 0, services: 0, completed: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Decode token to get user info (simple decode, not verifying)
    try {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser({
        ...userData,
        role: payload.role || userData.role || "employee",
      });
    } catch (e) {
      console.error("Error decoding token:", e);
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "#f59e0b",
      confirmed: "#10b981",
      "in-progress": "#3b82f6",
      completed: "#10b981",
      cancelled: "#ef4444",
    };
    return statusMap[status] || "#6b7280";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Removed global loading check - render UI immediately
  // Only show loading in specific content areas

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">MMM</div>
            <span className="logo-text">AutoServicePro</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Dashboard
          </a>
          <a
            onClick={() => navigate("/employee-services")}
            className="nav-item"
            style={{ cursor: "pointer" }}
          >
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            My Service Tasks
          </a>
          <a onClick={() => navigate("/employee/bookings")} className="nav-item" style={{ cursor: "pointer" }}>
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Bookings
          </a>
          <a onClick={() => navigate("/employee/customers")} className="nav-item" style={{ cursor: "pointer" }}>
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Customers
          </a>
          <a onClick={() => navigate("/employee/inventory")} className="nav-item" style={{ cursor: "pointer" }}>
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Inventory
          </a>
          <a onClick={() => navigate("/employee/staff")} className="nav-item" style={{ cursor: "pointer" }}>
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Staff Management
          </a>
          <a onClick={() => navigate("/employee/notifications")} className="nav-item" style={{ cursor: "pointer" }}>
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            Notifications
          </a>
          <a onClick={() => navigate("/employee/reports")} className="nav-item" style={{ cursor: "pointer" }}>
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Reports
          </a>
          <a onClick={() => navigate("/employee/ratings")} className="nav-item" style={{ cursor: "pointer" }}>
            <svg
              className="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            Service Ratings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">Employee Dashboard</h1>
            <div className="greeting">
              <h2>Hi, {user?.name || "Employee"}</h2>
              <p>Let's check your Garage today</p>
            </div>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <input type="text" placeholder="Q Search..." />
              <span className="shortcut">⌘ K</span>
            </div>
            <div className="header-icons">
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div className="notification-icon">
                <svg
                  className="icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="notification-dot"></span>
              </div>
            </div>
            <div className="user-profile">
              <div className="avatar">{user?.name?.charAt(0) || "E"}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || "Employee"}</span>
                <span className="user-role">Employee</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        {/* Nested Routes Content */}
        <Routes>
          <Route path="/" element={<DashboardHome stats={stats} formatDate={formatDate} getStatusColor={getStatusColor} />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/parts" element={<PartsManagement />} />
          <Route path="/stock-adjustment" element={<StockAdjustment />} />
        </Routes>
      </main>
    </div>
  );
}

// Dashboard Home Component (the main dashboard view)
function DashboardHome({ stats, formatDate, getStatusColor }) {
  // Simple loading state - stats will be empty on first render
  const isLoading = stats.recentBookings === undefined || stats.totalProjects === undefined;
  
  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '18px' }}>Loading dashboard data...</div>
      </div>
    );
  }
  
  return (
    <>
      {/* Dashboard Stats */}
      <div className="dashboard-stats">
          {/* Total Projects Assigned */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Project Assigned</h3>
                <p className="stat-value">{stats.totalProjects}</p>
                <p
                  className={`stat-change ${
                    stats.changes.projects < 0 ? "negative" : "positive"
                  }`}
                >
                  {stats.changes.projects < 0 ? "▼" : "▲"}{" "}
                  {Math.abs(stats.changes.projects).toFixed(1)}% from last week
                </p>
              </div>
            </div>
            <div className="stat-chart">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: "60%" }}></div>
                <div className="chart-bar" style={{ height: "80%" }}></div>
                <div className="chart-bar" style={{ height: "70%" }}></div>
                <div className="chart-bar" style={{ height: "100%" }}></div>
              </div>
            </div>
          </div>

          {/* Ongoing Services */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Ongoing Services</h3>
                <p className="stat-value">{stats.ongoingServices}</p>
                <p
                  className={`stat-change ${
                    stats.changes.services < 0 ? "negative" : "positive"
                  }`}
                >
                  {stats.changes.services < 0 ? "▼" : "▲"}{" "}
                  {Math.abs(stats.changes.services).toFixed(1)}% from last week
                </p>
              </div>
            </div>
            <div className="stat-chart">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: "60%" }}></div>
                <div className="chart-bar" style={{ height: "80%" }}></div>
                <div className="chart-bar" style={{ height: "70%" }}></div>
                <div className="chart-bar" style={{ height: "100%" }}></div>
              </div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Completed Tasks</h3>
                <p className="stat-value">{stats.completedTasks}</p>
                <p
                  className={`stat-change ${
                    stats.changes.completed < 0 ? "negative" : "positive"
                  }`}
                >
                  {stats.changes.completed < 0 ? "▼" : "▲"}{" "}
                  {Math.abs(stats.changes.completed).toFixed(1)}% from last week
                </p>
              </div>
            </div>
            <div className="stat-chart">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: "60%" }}></div>
                <div className="chart-bar" style={{ height: "80%" }}></div>
                <div className="chart-bar" style={{ height: "70%" }}></div>
                <div className="chart-bar" style={{ height: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="recent-bookings">
          <div className="bookings-header">
            <h2>Recent Bookings</h2>
          </div>
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((booking, index) => (
                    <tr key={booking._id}>
                      <td>{(index + 1).toString().padStart(2, "0")}</td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {booking.customer?.name?.charAt(0) || "C"}
                          </div>
                          <span>{booking.customer?.name || "Customer"}</span>
                        </div>
                      </td>
                      <td>
                        {booking.vehicleInfo?.make} {booking.vehicleInfo?.model}
                      </td>
                      <td>{booking.serviceType}</td>
                      <td>{formatDate(booking.bookingDate)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(booking.status),
                          }}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        £{booking.estimatedPrice || booking.actualPrice || "0"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No recent bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
}
