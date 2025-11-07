import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const verifyToken = async () => {
    try {
      const res = await API.get(`/auth/verify-reset-token/${token}`);
      if (res.data.valid) {
        setTokenValid(true);
      } else {
        setError(res.data.msg || "Invalid or expired reset link");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      setError(error.response?.data?.msg || "Invalid or expired reset link");
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setSuccess(res.data.msg);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error.response?.data?.msg || "Failed to reset password. Please try again.");
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
    passwordContainer: {
      position: "relative",
    },
    eyeButton: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#9ca3af",
      padding: "4px",
      display: "flex",
      alignItems: "center",
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
    spinner: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7280",
    },
  };

  if (validating) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.spinner}>Verifying reset link...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <h1 style={styles.heading}>Invalid Reset Link</h1>
            <div style={styles.errorText}>{error}</div>
            <div style={styles.footer}>
              <Link to="/forgot-password" style={styles.link}>
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Reset Password</h1>
          <p style={styles.subheading}>Enter your new password below.</p>

          {error && <div style={styles.errorText}>{error}</div>}
          {success && <div style={styles.successText}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={styles.input}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  style={styles.input}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              style={{
                ...styles.button,
                opacity: loading || success ? 0.7 : 1,
                cursor: loading || success ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) =>
                !loading && !success && (e.target.style.background = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                !loading && !success && (e.target.style.background = "#2563eb")
              }
            >
              {loading ? "Resetting..." : success ? "Success! Redirecting..." : "Reset Password"}
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
