import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setSuccess(res.data.msg);
      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(error.response?.data?.msg || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    },
    wrapper: {
      width: "100%",
      maxWidth: "448px",
    },
    card: {
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      padding: "32px",
    },
    heading: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "8px",
      textAlign: "center",
    },
    subheading: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "24px",
      textAlign: "center",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      color: "#4b5563",
      marginBottom: "6px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.15s",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "12px 16px",
      background: "#2563eb",
      color: "white",
      fontSize: "16px",
      fontWeight: "600",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    footer: {
      textAlign: "center",
      marginTop: "24px",
    },
    footerText: {
      color: "#4b5563",
      fontSize: "14px",
    },
    link: {
      color: "#2563eb",
      textDecoration: "none",
      fontWeight: "600",
    },
    errorText: {
      color: "#dc2626",
      fontSize: "14px",
      marginBottom: "16px",
      padding: "12px",
      background: "#fee2e2",
      borderRadius: "8px",
      textAlign: "center",
    },
    successText: {
      color: "#059669",
      fontSize: "14px",
      marginBottom: "16px",
      padding: "12px",
      background: "#d1fae5",
      borderRadius: "8px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Forgot Password?</h1>
          <p style={styles.subheading}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && <div style={styles.errorText}>{error}</div>}
          {success && <div style={styles.successText}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={styles.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) =>
                !loading && (e.target.style.background = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                !loading && (e.target.style.background = "#2563eb")
              }
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div style={styles.footer}>
            <span style={styles.footerText}>
              Remember your password?{" "}
              <Link to="/login" style={styles.link}>
                Back to Login
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
