import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentForm from "../components/appointments/AppointmentForm";
import AppointmentStore from "../utils/AppointmentStore";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    fetchAppointments();
    fetchActiveServices();
  }, []);

  const fetchAppointments = () => {
    try {
      console.log("Fetching appointments from store...");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.id) {
        setError("Please log in to view appointments");
        setLoading(false);
        return;
      }

      // Get all appointments from store
      const allAppointments = AppointmentStore.getAppointments();

      // Filter appointments for current user
      const userAppointments = allAppointments.filter(
        (apt) => apt.customerId === user.id
      );

      // Calculate stats from appointments array
      const calculatedStats = userAppointments.reduce(
        (acc, apt) => {
          switch (apt.status) {
            case "in-progress":
              acc.active++;
              break;
            case "pending":
              acc.pending++;
              break;
            case "completed":
              acc.completed++;
              break;
          }
          acc.total++;
          return acc;
        },
        { active: 0, pending: 0, completed: 0, total: 0 }
      );

      setAppointments(userAppointments);
      setStats(calculatedStats);
    } catch (err) {
      setError("Failed to fetch appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/services/my-services?status=approved,ongoing",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    },
    header: {
      background: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      padding: "16px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#1e3a8a",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    badge: {
      background: "#7c3aed",
      color: "white",
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
    },
    logoutBtn: {
      background: "#2563eb",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
    },
    content: {
      padding: "32px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "16px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    statCard: {
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      borderLeft: "4px solid #7c3aed",
    },
    statLabel: {
      color: "#6b7280",
      fontSize: "14px",
      marginBottom: "8px",
    },
    statValue: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#1f2937",
    },
    menuList: {
      listStyle: "none",
      padding: 0,
    },
    menuItem: {
      padding: "12px 16px",
      marginBottom: "8px",
      background: "#f3f4f6",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
  };

  const menuItems = [
    {
      name: "📅 Book an Appointment",
      path: "/customer-service-requests",
      icon: "📅",
    },
    { name: "🔧 My Services", path: "/customer/my-services", icon: "🔧" },
    { name: "🚗 My Vehicles", path: "/customer/vehicles", icon: "🚗" },
    { name: "📋 Service History", path: "/customer/history", icon: "📋" },
    { name: "👤 My Profile", path: "/customer/profile", icon: "👤" },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Customer Dashboard</h1>
        <div style={styles.userInfo}>
          <span style={styles.badge}>CUSTOMER</span>
          <span>{user.name}</span>
          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.target.style.background = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.background = "#2563eb")}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Appointments</div>
            <div style={styles.statValue}>
              {loading
                ? "--"
                : appointments.filter((a) => a.status === "confirmed").length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Pending Appointments</div>
            <div style={styles.statValue}>
              {loading
                ? "--"
                : appointments.filter((a) => a.status === "pending").length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Completed Services</div>
            <div style={styles.statValue}>
              {loading
                ? "--"
                : appointments.filter((a) => a.status === "completed").length}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Appointments</div>
            <div style={styles.statValue}>
              {loading ? "--" : appointments.length}
            </div>
          </div>
        </div>

        {/* Active Services Section */}
        {services.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🔧 Active Services</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {services.map((service) => (
                <div
                  key={service._id}
                  style={{
                    padding: "16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${
                      service.status === "ongoing" ? "#7c3aed" : "#10b981"
                    }`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => navigate("/customer-service-requests")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: 0,
                      }}
                    >
                      {service.name}
                    </h3>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background:
                          service.status === "ongoing" ? "#ddd6fe" : "#d1fae5",
                        color:
                          service.status === "ongoing" ? "#6b21a8" : "#065f46",
                      }}
                    >
                      {service.status === "ongoing"
                        ? "⚙️ In Progress"
                        : "✅ Approved"}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    {service.serviceType} • {service.vehicle?.make}{" "}
                    {service.vehicle?.model}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "#e5e7eb",
                        borderRadius: "9999px",
                        height: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: `${service.progress || 0}%`,
                          background:
                            "linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)",
                          height: "100%",
                          borderRadius: "9999px",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#6b7280",
                        minWidth: "45px",
                      }}
                    >
                      {service.progress || 0}%
                    </span>
                  </div>
                  {service.assignedTo && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        marginTop: "8px",
                      }}
                    >
                      👤 Assigned to: {service.assignedTo.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/customer/my-services")}
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                background: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                width: "100%",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#6d28d9")}
              onMouseLeave={(e) => (e.target.style.background = "#7c3aed")}
            >
              View All Services →
            </button>
          </div>
        )}

        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={styles.cardTitle}>
              {activeTab === "book" ? "Book Appointment" : "Quick Actions"}
            </h2>
            {activeTab !== "book" && (
              <button
                onClick={() => setActiveTab("book")}
                style={{
                  ...styles.logoutBtn,
                  background: "#10b981",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#059669")}
                onMouseLeave={(e) => (e.target.style.background = "#10b981")}
              >
                Book New Appointment
              </button>
            )}
          </div>

          {activeTab === "book" ? (
            <>
              <AppointmentForm />
              <button
                onClick={() => setActiveTab("dashboard")}
                style={{
                  ...styles.logoutBtn,
                  background: "#6b7280",
                  marginTop: "20px",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#4b5563")}
                onMouseLeave={(e) => (e.target.style.background = "#6b7280")}
              >
                Back to Dashboard
              </button>
            </>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    padding: "12px",
                    marginBottom: "20px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </div>
              )}
              <ul style={styles.menuList}>
                {menuItems.map((item, index) => (
                  <li
                    key={index}
                    style={styles.menuItem}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#7c3aed";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#f3f4f6";
                      e.target.style.color = "black";
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
