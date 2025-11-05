import React from "react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
      padding: "16px"
    },
    card: {
      background: "white",
      borderRadius: "16px",
      padding: "48px",
      textAlign: "center",
      maxWidth: "500px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    },
    icon: {
      fontSize: "72px",
      marginBottom: "24px"
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#dc2626",
      marginBottom: "16px"
    },
    message: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "32px",
      lineHeight: "1.5"
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      justifyContent: "center"
    },
    button: {
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s"
    },
    primaryButton: {
      background: "#2563eb",
      color: "white"
    },
    secondaryButton: {
      background: "#f3f4f6",
      color: "#1f2937"
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          You don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>
        <div style={styles.buttonContainer}>
          <button
            style={{...styles.button, ...styles.secondaryButton}}
            onClick={handleGoBack}
            onMouseEnter={(e) => e.target.style.background = "#e5e7eb"}
            onMouseLeave={(e) => e.target.style.background = "#f3f4f6"}
          >
            Go Back
          </button>
          <button
            style={{...styles.button, ...styles.primaryButton}}
            onClick={handleGoHome}
            onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
            onMouseLeave={(e) => e.target.style.background = "#2563eb"}
          >
            Go Home
          </button>
          <button
            style={{...styles.button, ...styles.secondaryButton}}
            onClick={handleLogout}
            onMouseEnter={(e) => e.target.style.background = "#e5e7eb"}
            onMouseLeave={(e) => e.target.style.background = "#f3f4f6"}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
