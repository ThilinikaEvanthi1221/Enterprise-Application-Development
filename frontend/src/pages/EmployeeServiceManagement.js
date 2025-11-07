import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";

const EmployeeServiceManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assignedServices, setAssignedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [activeTab, setActiveTab] = useState("assigned");
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [progressData, setProgressData] = useState({
    status: "",
    progress: 0,
    notes: "",
  });

  useEffect(() => {
    // Check if user is logged in and get user info
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userRole = payload.role || userData.role;

      console.log("Token payload:", payload);
      console.log("User role from token:", userRole);

      // Check if user has employee or admin role
      if (userRole !== "employee" && userRole !== "admin") {
        alert(
          `Access denied. This page is for employees only. Your role: ${userRole}`
        );
        navigate("/");
        return;
      }

      setUser({
        ...userData,
        role: userRole,
      });
    } catch (e) {
      console.error("Error decoding token:", e);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchServices();
  }, [activeTab]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (activeTab === "assigned") {
        // Fetch appointments assigned to this employee
        const response = await fetch(
          "http://localhost:5000/api/appointments/my-assignments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error ${response.status}:`, errorData);

          if (response.status === 403) {
            alert(
              `Access forbidden: ${
                errorData.msg ||
                "You do not have permission to access this resource"
              }`
            );
            navigate("/");
            return;
          }
          throw new Error(errorData.msg || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setAssignedServices(Array.isArray(data) ? data : []);
      } else {
        // Fetch available services
        const endpoint = "/api/services/available";
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error ${response.status}:`, errorData);

          if (response.status === 403) {
            alert(
              `Access forbidden: ${
                errorData.msg ||
                "You do not have permission to access this resource"
              }`
            );
            navigate("/");
            return;
          }
          throw new Error(errorData.msg || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setAvailableServices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      alert(`Error loading services: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimService = async (serviceId) => {
    if (!window.confirm("Claim this service?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/services/${serviceId}/claim`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Service claimed successfully!");
        fetchServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to claim service");
      }
    } catch (error) {
      console.error("Error claiming service:", error);
      alert("Error claiming service");
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Check if it's an appointment or service
      // Appointments have 'customer' field (or came from /my-assignments endpoint)
      // Services have 'user' field (legacy)
      const isAppointment =
        selectedService.customer ||
        (selectedService.date && !selectedService.user) ||
        activeTab === "assigned"; // Items in assigned tab are appointments

      console.log(
        "Updating progress for:",
        isAppointment ? "Appointment" : "Service"
      );
      console.log("Progress data:", progressData);
      console.log("Selected service:", selectedService);

      let response;
      if (isAppointment) {
        // Update appointment status and progress using employee endpoint
        response = await fetch(
          `http://localhost:5000/api/appointments/my-assignments/${selectedService._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: progressData.status,
              notes: progressData.notes,
              progress: progressData.progress,
            }),
          }
        );
      } else {
        // Update service progress
        console.log("Sending service update with data:", progressData);
        console.log("Service ID:", selectedService._id);
        console.log(
          "Full URL:",
          `http://localhost:5000/api/services/${selectedService._id}/progress`
        );
        response = await fetch(
          `http://localhost:5000/api/services/${selectedService._id}/progress`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(progressData),
          }
        );
      }

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        alert("Progress updated successfully!");
        setShowProgressModal(false);
        setSelectedService(null);
        setProgressData({ status: "", progress: 0, notes: "" });
        fetchServices();
      } else {
        alert(responseData.msg || "Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Error updating progress");
    }
  };

  const openProgressModal = (service) => {
    console.log("Opening progress modal for service:", service);
    const isAppointment =
      service.customer ||
      (service.date && !service.user) ||
      activeTab === "assigned";
    console.log("Is appointment?", isAppointment);
    console.log("Has customer field?", !!service.customer);
    console.log("Has user field?", !!service.user);
    console.log("Active tab:", activeTab);
    setSelectedService(service);
    setProgressData({
      status: service.status,
      progress: service.progress || 0,
      notes: service.notes || "",
    });
    console.log("Initial progress data:", {
      status: service.status,
      progress: service.progress || 0,
      notes: service.notes || "",
    });
    setShowProgressModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      ongoing: "bg-purple-100 text-purple-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ServiceCard = ({ service, isAvailable = false }) => {
    // Check if it's an appointment or service
    // Appointments have 'customer' field, services have 'user' field
    const isAppointment =
      service.customer ||
      (service.date && !service.user) ||
      activeTab === "assigned";
    const displayName = isAppointment
      ? service.service?.name || "Appointment"
      : service.name;
    const serviceType = isAppointment
      ? service.service?.serviceType || "Service"
      : service.serviceType;
    const estimatedCost = isAppointment ? service.price : service.estimatedCost;
    const appointmentDate = isAppointment
      ? service.date
      : service.requestedDate;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {displayName}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  service.status
                )}`}
              >
                {service.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{serviceType}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Customer:</span>
                <p className="font-medium text-gray-900">
                  {service.customer?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Vehicle:</span>
                <p className="font-medium text-gray-900">
                  {service.vehicle?.make} {service.vehicle?.model}
                </p>
                <p className="text-xs text-gray-500">
                  {service.vehicle?.plateNumber}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Est. Cost:</span>
                <p className="font-semibold text-green-600">
                  ${estimatedCost?.toFixed(2) || "0.00"}
                </p>
              </div>
              {!isAppointment && (
                <div>
                  <span className="text-gray-500">Progress:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${service.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">
                      {service.progress || 0}%
                    </span>
                  </div>
                </div>
              )}
              {isAppointment && (
                <div>
                  <span className="text-gray-500">Scheduled:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(appointmentDate).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-4 text-sm text-gray-600">
              {isAppointment ? (
                <span>Appointment: {formatDate(appointmentDate)}</span>
              ) : (
                <>
                  <span>Requested: {formatDate(service.requestedDate)}</span>
                  {service.startDate && (
                    <span>Started: {formatDate(service.startDate)}</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            {isAvailable ? (
              <button
                onClick={() => handleClaimService(service._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                Claim Service
              </button>
            ) : (
              <button
                onClick={() => openProgressModal(service)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                Update Progress
              </button>
            )}
          </div>
        </div>

        {service.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>Notes:</strong> {service.notes}
            </p>
          </div>
        )}

        {!isAppointment && service.description && (
          <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>Description:</strong> {service.description}
            </p>
          </div>
        )}

        {!isAppointment && service.customerNotes && (
          <div className="mt-2 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
            <p className="text-sm text-gray-700">
              <strong>Customer Notes:</strong> {service.customerNotes}
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
          <button onClick={() => navigate("/employee")} className="nav-item">
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
          </button>
          <button
            onClick={() => navigate("/employee-services")}
            className="nav-item active"
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
          </button>
          <button
            onClick={() => navigate("/employee/bookings")}
            className="nav-item"
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
            Bookings
          </button>
          <button
            onClick={() => navigate("/employee/customers")}
            className="nav-item"
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Customers
          </button>
          <button
            onClick={() => navigate("/employee/inventory")}
            className="nav-item"
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Inventory
          </button>
          <button
            onClick={() => navigate("/employee/staff")}
            className="nav-item"
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Staff Management
          </button>
          <button
            onClick={() => navigate("/employee/notifications")}
            className="nav-item"
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            Notifications
          </button>
          <button
            onClick={() => navigate("/employee/reports")}
            className="nav-item"
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
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Reports
          </button>
          <button
            onClick={() => navigate("/employee/ratings")}
            className="nav-item"
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            Service Ratings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">Service Management</h1>
            <p className="text-gray-600">
              Manage and track your assigned services
            </p>
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

        <div className="p-6">
          {/*
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Service Management</h1>
        <p className="text-gray-600 mt-1">
          Manage and track your assigned services
        </p>
      </div>*/}

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("assigned")}
                className={`pb-3 px-2 font-semibold transition ${
                  activeTab === "assigned"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Assigned Services
                {assignedServices.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {assignedServices.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("available")}
                className={`pb-3 px-2 font-semibold transition ${
                  activeTab === "available"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Available Services
                {availableServices.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {availableServices.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Services List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          ) : (
            <>
              {activeTab === "assigned" && (
                <>
                  {assignedServices.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No assigned services
                      </h3>
                      <p className="text-gray-500">
                        Check the Available Services tab to claim work
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {assignedServices.map((service) => (
                        <ServiceCard key={service._id} service={service} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "available" && (
                <>
                  {availableServices.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No available services
                      </h3>
                      <p className="text-gray-500">
                        All services are currently assigned
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {availableServices.map((service) => (
                        <ServiceCard
                          key={service._id}
                          service={service}
                          isAvailable
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Progress Update Modal */}
          {showProgressModal && selectedService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Update{" "}
                    {selectedService.customer ||
                    (selectedService.date && !selectedService.user) ||
                    activeTab === "assigned"
                      ? "Appointment"
                      : "Service"}{" "}
                    Progress
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedService.service?.name || selectedService.name}
                  </p>
                </div>

                <form onSubmit={handleUpdateProgress} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={progressData.status}
                      onChange={(e) =>
                        setProgressData({
                          ...progressData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Status</option>
                      {selectedService.date && selectedService.service ? (
                        // Appointment status options
                        <>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </>
                      ) : (
                        // Service status options
                        <>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                        </>
                      )}
                    </select>
                  </div>
                  {/* Progress slider - show for both appointments and services */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Progress:{" "}
                      <span className="text-lg font-bold text-blue-600">
                        {progressData.progress || 0}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressData.progress || 0}
                      onChange={(e) => {
                        const newProgress = parseInt(e.target.value);
                        console.log("Progress changed to:", newProgress);
                        setProgressData({
                          ...progressData,
                          progress: newProgress,
                        });
                      }}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        accentColor: "#3b82f6",
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Notes
                    </label>
                    <textarea
                      value={progressData.notes}
                      onChange={(e) =>
                        setProgressData({
                          ...progressData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Add notes about the work progress..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Service Details:
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <p className="font-medium">
                          {selectedService.customer?.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Vehicle:</span>
                        <p className="font-medium">
                          {selectedService.vehicle?.make}{" "}
                          {selectedService.vehicle?.model}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Service Type:</span>
                        <p className="font-medium">
                          {selectedService.serviceType}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Est. Cost:</span>
                        <p className="font-medium text-green-600">
                          ${selectedService.estimatedCost?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                    >
                      Update Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProgressModal(false);
                        setSelectedService(null);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeServiceManagement;
