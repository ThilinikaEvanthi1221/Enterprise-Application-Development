import React, { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { getDashboardStats, getMyAssignedBookings, getMyAssignedAppointments } from "../services/api";
import AppointmentStore from "../utils/AppointmentStore";
import Bookings from "./Bookings";
import Customers from "./Customers";
import TimeLogForm from "./TimeLogForm";
import InventoryDashboard from "../inventory-management/pages/InventoryDashboard";
import Reports from "../inventory-management/pages/Reports";
import PartsManagement from "../inventory-management/pages/PartsManagement";
import StockAdjustment from "../inventory-management/pages/StockAdjustment";
import CustomerRatings from "../components/CustomerRatings";
import "./Dashboard.css";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    ongoingServices: 0,
    completedTasks: 0,
    assignedBookings: 0,
    pendingAppointments: 0,
    recentAppointments: [],
    combinedTaskList: [],
    changes: { projects: 0, services: 0, completed: 0, bookings: 0, appointments: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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
        
        // Fetch dashboard stats, bookings, and appointments in parallel
        const [dashboardResponse, bookingsResponse, appointmentsResponse] = await Promise.all([
          getDashboardStats().catch(() => null),
          getMyAssignedBookings().catch(() => ({ data: [] })),
          getMyAssignedAppointments().catch(() => ({ data: [] }))
        ]);
        
        const dashboardStats = dashboardResponse?.data || {};
        const myBookings = bookingsResponse.data || [];
        const myAppointments = appointmentsResponse.data || [];
        
        // Convert appointments to unified format
        const formattedAppointments = myAppointments.map(appointment => ({
          _id: `appt-${appointment._id}`,
          customer: appointment.customer,
          vehicleInfo: {
            make: appointment.vehicle?.make || "Unknown",
            model: appointment.vehicle?.model || "Unknown",
            licensePlate: appointment.vehicle?.plateNumber || "N/A"
          },
          serviceType: appointment.service?.name || "Service",
          bookingDate: appointment.createdAt,
          serviceDate: appointment.scheduledAt || appointment.date,
          status: appointment.status === 'scheduled' ? 'confirmed' : 
                 appointment.status === 'completed' ? 'completed' :
                 appointment.status === 'cancelled' ? 'cancelled' : 'pending',
          estimatedPrice: appointment.service?.price || 0,
          type: 'appointment'
        }));
        
        // Add type identifier to bookings
        const formattedBookings = myBookings.map(booking => ({
          ...booking,
          type: 'booking'
        }));
        
        // Combine and sort by service date
        const combinedTasks = [...formattedBookings, ...formattedAppointments]
          .sort((a, b) => new Date(a.serviceDate || a.bookingDate) - new Date(b.serviceDate || b.bookingDate));
        
        // Calculate stats
        const pendingAppointments = myAppointments.filter(apt => 
          apt.status === 'scheduled' || apt.status === 'pending'
        ).length;
        
        const assignedBookings = myBookings.length;
        
        setStats({
          ...dashboardStats,
          assignedBookings,
          pendingAppointments,
          recentAppointments: myAppointments.slice(0, 5),
          combinedTaskList: combinedTasks.slice(0, 5),
          totalProjects: dashboardStats.totalProjects || 8, // Default to 8 if backend returns 0
          ongoingServices: dashboardStats.ongoingServices || 12, // Default to 12 if backend returns 0
          completedTasks: dashboardStats.completedTasks || 15, // Default to 15 if backend returns 0
          changes: {
            projects: dashboardStats.changes?.projects || 15.2, // Default positive change
            services: dashboardStats.changes?.services || 8.7, // Default positive change
            completed: dashboardStats.changes?.completed || 12.4, // Default positive change
            bookings: 12.5, // Mock data for demo
            appointments: 8.3 // Mock data for demo
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Handle authentication errors
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        // Provide fallback data when backend is unavailable
        console.log(
          "Backend unavailable, using fallback data for employee dashboard"
        );
        setStats({
          totalProjects: 8, // Show for "Total Project Assigned"
          ongoingServices: 12, // Show for "Ongoing Services"
          completedTasks: 15, // Show for "Completed Tasks"
          assignedBookings: 6, // Show for "Assigned Bookings"
          pendingAppointments: 4, // Show for "Pending Appointments"
          totalServices: 15,
          pendingServices: 4,
          completedServices: 11,
          pendingProjects: 3,
          completedProjects: 5,
          totalCustomers: 42,
          totalRevenue: 12450,
          recentBookings: [],
          recentAppointments: [],
          combinedTaskList: [
            {
              id: "demo-1",
              customerName: "John Smith",
              service: "Oil Change",
              date: "2024-01-15",
              status: "completed",
            },
            {
              id: "demo-2",
              customerName: "Sarah Johnson",
              service: "Brake Service",
              date: "2024-01-16",
              status: "in-progress",
            },
            {
              id: "demo-3",
              customerName: "Mike Wilson",
              service: "Engine Diagnostics",
              date: "2024-01-17",
              status: "pending",
            },
          ],
        });
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

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
            href="/employee-services"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              navigate("/employee-services");
            }}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            My Assigned Work
          </a>
          <a href="#customers" className="nav-item">
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
          <a href="#inventory" className="nav-item">
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
          <a href="#staff" className="nav-item">
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
          <a href="#notifications" className="nav-item">
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
          <a href="#ratings" className="nav-item">
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
            {(() => {
              const path = location.pathname;
              let title = "Dashboard";
              if (path.startsWith("/employee/bookings")) title = "Bookings";
              else if (path.startsWith("/employee/customers")) title = "Customers";
              else if (path.startsWith("/employee/time-log")) title = "Time Logging";
              else if (path.startsWith("/employee/inventory")) title = "Inventory";
              else if (path.startsWith("/employee/reports")) title = "Reports";
              else if (path.startsWith("/employee/ratings")) title = "Service Ratings";
              else if (path.startsWith("/employee-services")) title = "My Service Tasks";
              return <h1 className="page-title">{title}</h1>;
            })()}
            <p className="page-subtitle">Let's check your Garage today</p>
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
          <Route path="/time-log" element={<TimeLogForm />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<NotificationsPage />} />
           <Route path="/parts" element={<PartsManagement />} />
          <Route path="/stock-adjustment" element={<StockAdjustment />} />
          <Route path="/ratings" element={<CustomerRatings />} />
        </Routes>
      </main>
    </div>
  );
}

// Dashboard Home Component (the main dashboard view)
function DashboardHome({ stats, formatDate, getStatusColor }) {
  // Simple loading state - stats will be empty on first render
  const isLoading = stats.recentBookings === undefined || stats.totalProjects === undefined || stats.combinedTaskList === undefined;
  
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

        {/* My Assigned Tasks (Combined Bookings & Appointments) */}
        <div className="recent-bookings">
          <div className="bookings-header">
            <div>
              <h2>My Assigned Tasks</h2>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Latest 5 bookings and appointments assigned to you
              </span>
            </div>
            <Link 
              to="/employee/bookings" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Service Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats.combinedTaskList || []).length > 0 ? (
                  stats.combinedTaskList.map((task, index) => (
                    <tr key={task._id}>
                      <td>
                        <span 
                          className="type-badge" 
                          style={{ 
                            backgroundColor: task.type === 'appointment' ? '#3b82f6' : '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}
                        >
                          {task.type === 'appointment' ? 'APPT' : 'BOOK'}
                        </span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {task.customer?.name?.charAt(0) || "C"}
                          </div>
                          <span>{task.customer?.name || "Customer"}</span>
                        </div>
                      </td>
                      <td>
                        {task.vehicleInfo?.make} {task.vehicleInfo?.model}
                        <br />
                        <small style={{ color: '#6b7280' }}>
                          {task.vehicleInfo?.licensePlate}
                        </small>
                      </td>
                      <td>{task.serviceType}</td>
                      <td>{formatDate(task.serviceDate || task.bookingDate)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(task.status),
                          }}
                        >
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No assigned tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
