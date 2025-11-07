import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerFeedback from "../components/CustomerFeedback";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
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
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log("Fetching appointments from API...");
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.id || !token) {
        setError("Please log in to view appointments");
        setLoading(false);
        return;
      }

      // Fetch appointments from API
      const response = await fetch(
        "http://localhost:5000/api/appointments/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const userAppointments = await response.json();

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
      console.error("Error fetching appointments:", err);
      setError("Unable to connect to server. Showing demo data.");
      
      // Fallback demo data when backend is not available
      const demoAppointments = [
        {
          _id: '1',
          service: { name: 'Oil Change' },
          status: 'confirmed',
          date: new Date('2024-12-15T10:00:00Z'),
          progress: 75,
          vehicle: { make: 'Toyota', model: 'Camry' },
          assignedTo: { name: 'John Smith' }
        },
        {
          _id: '2',
          service: { name: 'Brake Service' },
          status: 'pending',
          date: new Date('2024-12-20T14:00:00Z'),
          progress: 0,
          vehicle: { make: 'Honda', model: 'Civic' },
          assignedTo: { name: 'Jane Doe' }
        },
        {
          _id: '3',
          service: { name: 'Engine Diagnostics' },
          status: 'completed',
          date: new Date('2024-11-25T09:00:00Z'),
          progress: 100,
          vehicle: { make: 'Ford', model: 'Focus' },
          assignedTo: { name: 'Mike Johnson' }
        },
        {
          _id: '4',
          service: { name: 'Tire Rotation' },
          status: 'in-progress',
          date: new Date('2024-12-10T11:00:00Z'),
          progress: 50,
          vehicle: { make: 'Nissan', model: 'Sentra' },
          assignedTo: { name: 'Sarah Wilson' }
        }
      ];

      const demoStats = {
        active: demoAppointments.filter(apt => apt.status === 'confirmed').length,
        pending: demoAppointments.filter(apt => apt.status === 'pending').length,
        completed: demoAppointments.filter(apt => apt.status === 'completed').length,
        total: demoAppointments.length
      };

      setAppointments(demoAppointments);
      setStats(demoStats);
    } finally {
      setLoading(false);
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
      background: "#f5f7fa",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      background: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      padding: "16px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 10,
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
    mainContent: {
      display: "flex",
      flex: 1,
      overflow: "hidden",
    },
    sidebar: {
      width: "280px",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
      boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      padding: "24px 16px",
      overflowY: "auto",
    },
    sidebarTitle: {
      color: "white",
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "24px",
      paddingLeft: "12px",
    },
    menuList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    menuItem: {
      padding: "14px 16px",
      marginBottom: "8px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.3s",
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    menuItemActive: {
      background: "white",
      color: "#1e3a8a",
      fontWeight: "600",
    },
    content: {
      flex: 1,
      padding: "32px",
      overflowY: "auto",
      background: "#f5f7fa",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "16px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "20px",
      marginBottom: "24px",
    },
    statCard: {
      background: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
    },
    statCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    statIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
    },
    statLabel: {
      color: "#6b7280",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "8px",
    },
    statValue: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#1f2937",
    },
    chartCard: {
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      marginBottom: "24px",
    },
  };

  const menuItems = [
    {
      name: "Dashboard",
      tab: "dashboard",
      icon: "📊",
    },
    { name: "Book Appointment", path: "/customer-service-requests", icon: "📅" },
    { name: "My Services", path: "/customer/my-services", icon: "🔧" },
    { name: "My Vehicles", path: "/vehicle-register", icon: "🚗" },
    { name: "Service History", path: "/customer/history", icon: "📋" },
    {
      name: "Give Feedback",
      tab: "feedback",
      icon: "💬",
    },
    { name: "My Profile", path: "/profile", icon: "👤" },
  ];

  const statCards = [
    {
      label: "Active Appointments",
      value: loading
        ? "--"
        : appointments.filter((a) => a.status === "confirmed").length,
      icon: "⚡",
      color: "#7c3aed",
      bgColor: "#f3e8ff",
    },
    {
      label: "Pending Appointments",
      value: loading
        ? "--"
        : appointments.filter((a) => a.status === "pending").length,
      icon: "⏳",
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
    {
      label: "Completed Services",
      value: loading
        ? "--"
        : appointments.filter((a) => a.status === "completed").length,
      icon: "✅",
      color: "#10b981",
      bgColor: "#d1fae5",
    },
    {
      label: "Total Appointments",
      value: loading ? "--" : appointments.length,
      icon: "📋",
      color: "#3b82f6",
      bgColor: "#dbeafe",
    },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🚗
          </div>
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1e3a8a",
                margin: 0,
              }}
            >
              AutoService Pro
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: 0,
                fontWeight: "500",
              }}
            >
              Customer Portal
            </p>
          </div>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.badge}>CUSTOMER</span>
          <span style={{ fontWeight: "500" }}>{user.name}</span>
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

      <div style={styles.mainContent}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Navigation</h2>
          <ul style={styles.menuList}>
            {menuItems.map((item, index) => (
              <li
                key={index}
                style={{
                  ...styles.menuItem,
                  ...(activeTab === item.tab ? styles.menuItemActive : {}),
                }}
                onClick={() => {
                  if (item.tab) {
                    setActiveTab(item.tab);
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.tab) {
                    e.target.style.background = "rgba(255, 255, 255, 0.2)";
                    e.target.style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.tab) {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    e.target.style.transform = "translateX(0)";
                  }
                }}
              >
                <span style={{ marginRight: "12px" }}>{item.icon}</span>
                {item.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main style={styles.content}>
          {activeTab === "feedback" && <CustomerFeedback />}
          
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div style={styles.grid}>
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    style={styles.statCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 16px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.08)";
                    }}
                  >
                    <div style={styles.statCardHeader}>
                      <div>
                        <div style={styles.statLabel}>{stat.label}</div>
                        <div style={styles.statValue}>{stat.value}</div>
                      </div>
                      <div
                        style={{
                          ...styles.statIcon,
                          background: stat.bgColor,
                        }}
                      >
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Appointment Status Chart */}
              <div style={styles.chartCard}>
                <h2 style={styles.cardTitle}>📊 Appointment Status Overview</h2>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                  }}
                >
                  <div style={{ flex: "1 1 300px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {[
                        {
                          label: "Confirmed",
                          count: appointments.filter(
                            (a) => a.status === "confirmed"
                          ).length,
                          color: "#7c3aed",
                          total: appointments.length,
                        },
                        {
                          label: "Pending",
                          count: appointments.filter((a) => a.status === "pending")
                            .length,
                          color: "#f59e0b",
                          total: appointments.length,
                        },
                        {
                          label: "In Progress",
                          count: appointments.filter(
                            (a) => a.status === "in-progress"
                          ).length,
                          color: "#3b82f6",
                          total: appointments.length,
                        },
                        {
                          label: "Completed",
                          count: appointments.filter(
                            (a) => a.status === "completed"
                          ).length,
                          color: "#10b981",
                          total: appointments.length,
                        },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span>{item.label}</span>
                            <span style={{ color: item.color }}>
                              {item.count} (
                              {item.total > 0
                                ? Math.round((item.count / item.total) * 100)
                                : 0}
                              %)
                            </span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "12px",
                              background: "#e5e7eb",
                              borderRadius: "6px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${
                                  item.total > 0
                                    ? (item.count / item.total) * 100
                                    : 0
                                }%`,
                                height: "100%",
                                background: item.color,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      flex: "1 1 300px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                        background: `conic-gradient(
                          #7c3aed 0deg ${
                            (appointments.filter((a) => a.status === "confirmed")
                              .length /
                              (appointments.length || 1)) *
                            360
                          }deg,
                          #f59e0b ${
                            (appointments.filter((a) => a.status === "confirmed")
                              .length /
                              (appointments.length || 1)) *
                            360
                          }deg ${
                          ((appointments.filter((a) => a.status === "confirmed")
                            .length +
                            appointments.filter((a) => a.status === "pending")
                              .length) /
                            (appointments.length || 1)) *
                          360
                        }deg,
                          #3b82f6 ${
                            ((appointments.filter((a) => a.status === "confirmed")
                              .length +
                              appointments.filter((a) => a.status === "pending")
                                .length) /
                              (appointments.length || 1)) *
                            360
                          }deg ${
                          ((appointments.filter((a) => a.status === "confirmed")
                            .length +
                            appointments.filter((a) => a.status === "pending")
                              .length +
                            appointments.filter((a) => a.status === "in-progress")
                              .length) /
                            (appointments.length || 1)) *
                          360
                        }deg,
                          #10b981 ${
                            ((appointments.filter((a) => a.status === "confirmed")
                              .length +
                              appointments.filter((a) => a.status === "pending")
                                .length +
                              appointments.filter(
                                (a) => a.status === "in-progress"
                              ).length) /
                              (appointments.length || 1)) *
                            360
                          }deg 360deg
                        )`,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background: "white",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: "#1f2937",
                          }}
                        >
                          {appointments.length}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Total
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Appointments Section */}
              {appointments.length > 0 && (
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>📅 Recent Appointments</h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {appointments.slice(0, 5).map((appointment) => (
                      <div
                        key={appointment._id}
                        style={{
                          padding: "16px",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          borderLeft: `4px solid ${
                            appointment.status === "completed"
                              ? "#10b981"
                              : appointment.status === "in-progress"
                              ? "#7c3aed"
                              : "#3b82f6"
                          }`,
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
                            {appointment.service?.name || "Service"}
                          </h3>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background:
                                appointment.status === "completed"
                                  ? "#d1fae5"
                                  : appointment.status === "in-progress"
                                  ? "#ddd6fe"
                                  : "#dbeafe",
                              color:
                                appointment.status === "completed"
                                  ? "#065f46"
                                  : appointment.status === "in-progress"
                                  ? "#6b21a8"
                                  : "#1e3a8a",
                            }}
                          >
                            {appointment.status === "completed"
                              ? "✅ Completed"
                              : appointment.status === "in-progress"
                              ? "⚙️ In Progress"
                              : appointment.status === "confirmed"
                              ? "✓ Confirmed"
                              : "⏳ Pending"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginBottom: "8px",
                          }}
                        >
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          • {appointment.vehicle?.make}{" "}
                          {appointment.vehicle?.model}
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
                                width: `${appointment.progress || 0}%`,
                                background: "#7c3aed",
                                height: "100%",
                                borderRadius: "9999px",
                                transition: "width 0.3s",
                              }}
                            ></div>
                          </div>
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#7c3aed",
                            }}
                          >
                            {appointment.progress || 0}%
                          </span>
                        </div>
                        {appointment.assignedTo && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#9ca3af",
                              marginTop: "8px",
                            }}
                          >
                            👤 Assigned to: {appointment.assignedTo.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appointments.length === 0 && !loading && (
                <div style={styles.card}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#6b7280",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      📅
                    </div>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      No Appointments Yet
                    </h3>
                    <p style={{ marginBottom: "20px" }}>
                      Book your first appointment to get started!
                    </p>
                    <button
                      onClick={() => navigate("/customer-service-requests")}
                      style={{
                        ...styles.logoutBtn,
                        background: "#10b981",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#059669")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#10b981")
                      }
                    >
                      Book New Appointment
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

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
        </main>
      </div>
    </div>
  );
}
