import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, googleLogin } from "../services/api";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect users based on their role
  const redirectToDashboard = (role) => {
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
        navigate("/");
    }
  };

  // Handle manual login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log('Attempting login with:', form);

    try {
      const res = await login(form);
      console.log('Login response:', res.data);
      
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        console.log('Login successful, redirecting to:', res.data.user.role);
        redirectToDashboard(res.data.user.role);
      } else {
        console.error('Invalid response format:', res.data);
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin({ credential: credentialResponse.credential });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      redirectToDashboard(res.data.user.role);
    } catch (error) {
      setError("Google login failed: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  // Inline styles matching the blue color palette
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
    rememberRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "14px",
      marginBottom: "16px",
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    checkbox: {
      width: "16px",
      height: "16px",
      color: "#2563eb",
      borderColor: "#d1d5db",
      borderRadius: "4px",
      cursor: "pointer",
    },
    checkboxText: {
      marginLeft: "8px",
      color: "#4b5563",
    },
    forgotLink: {
      color: "#2563eb",
      textDecoration: "none",
      fontWeight: "500",
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
    dividerContainer: {
      position: "relative",
      margin: "24px 0",
    },
    dividerLine: {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
    },
    dividerBorder: {
      width: "100%",
      borderTop: "1px solid #e5e7eb",
    },
    dividerTextContainer: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      fontSize: "14px",
    },
    dividerText: {
      padding: "0 16px",
      background: "white",
      color: "#6b7280",
    },
    googleButtonContainer: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "24px",
    },
    footer: {
      textAlign: "center",
      marginTop: "24px",
    },
    footerText: {
      color: "#4b5563",
      fontSize: "14px",
    },
    signupLink: {
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
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Login to your account</h2>

            {error && <div style={styles.errorText}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{ ...styles.input, paddingRight: "48px" }}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={styles.rememberRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>Remember me</span>
                </label>
                <Link to="/forgot-password" style={styles.forgotLink}>
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                style={styles.button}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in with email"}
              </button>
            </form>

            <div style={styles.dividerContainer}>
              <div style={styles.dividerLine}>
                <div style={styles.dividerBorder}></div>
              </div>
              <div style={styles.dividerTextContainer}>
                <span style={styles.dividerText}>Or Login With</span>
              </div>
            </div>

            <div style={styles.googleButtonContainer}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
              />
            </div>

            <div style={styles.footer}>
              <span style={styles.footerText}>
                Don't have an account?{" "}
                <a href="/signup" style={styles.signupLink}>
                  Sign up
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
