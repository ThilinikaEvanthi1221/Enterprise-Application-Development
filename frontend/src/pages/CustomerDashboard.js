import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

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
    { name: "Request a service", path: "/customer-service-requests" },
    { name: "Book Appointment", path: "/customer/book-appointment" },
    { name: "My Appointments", path: "/customer/appointments" },
    { name: "My Vehicles", path: "/customer/vehicles" },
    { name: "Available Services", path: "/customer/services" },
    { name: "Service History", path: "/customer/history" },
    { name: "My Profile", path: "/customer/profile" },
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
            <div style={styles.statValue}>--</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>My Vehicles</div>
            <div style={styles.statValue}>--</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Completed Services</div>
            <div style={styles.statValue}>--</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Upcoming Services</div>
            <div style={styles.statValue}>--</div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Quick Actions</h2>
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
        </div>
      </div>
    </div>
  );
}
