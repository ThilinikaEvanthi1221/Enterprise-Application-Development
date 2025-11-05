import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    
    if (!userStr) {
      // No user found, redirect to login
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const role = user.role;

      // Redirect based on role
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "employee":
          navigate("/employee");
          break;
        case "customer":
          navigate("/customer");
          break;
        default:
          navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
    }}>
      <div style={{
        background: "white",
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        textAlign: "center"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          margin: "0 auto 16px",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Redirecting to your dashboard...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
