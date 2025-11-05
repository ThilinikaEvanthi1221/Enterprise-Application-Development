import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, googleLogin } from "../services/api";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await signup(form);
      // Signup successful, redirect to login
      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin({ credential: credentialResponse.credential });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // Redirect to customer dashboard
      navigate("/dashboard");
    } catch (error) {
      setError("Google signup failed: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleGoogleError = () => {
    setError("Google signup failed");
  };

  // Inline styles matching the login page (blue)
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
    },
    wrapper: {
      width: "100%",
      maxWidth: "448px"
    },
    header: {
      textAlign: "center",
      marginBottom: "32px"
    },
    logoContainer: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "80px",
      height: "80px",
      background: "white",
      borderRadius: "16px",
      marginBottom: "12px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    },
    title: {
      color: "white",
      fontSize: "20px",
      fontWeight: "bold",
      letterSpacing: "0.025em"
    },
    subtitle: {
      color: "#bfdbfe",
      fontSize: "14px",
      marginTop: "4px"
    },
    card: {
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      padding: "32px"
    },
    heading: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "24px",
      textAlign: "center"
    },
    formGroup: {
      marginBottom: "16px"
    },
    label: {
      display: "block",
      fontSize: "14px",
      color: "#4b5563",
      marginBottom: "6px"
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.15s",
      boxSizing: "border-box"
    },
    passwordContainer: {
      position: "relative"
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
      alignItems: "center"
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
      marginTop: "8px"
    },
    dividerContainer: {
      position: "relative",
      margin: "24px 0"
    },
    dividerLine: {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center"
    },
    dividerBorder: {
      width: "100%",
      borderTop: "1px solid #e5e7eb"
    },
    dividerTextContainer: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      fontSize: "14px"
    },
    dividerText: {
      padding: "0 16px",
      background: "white",
      color: "#6b7280"
    },
    googleButtonContainer: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "24px"
    },
    footer: {
      textAlign: "center",
      marginTop: "24px"
    },
    footerText: {
      color: "#4b5563",
      fontSize: "14px"
    },
    loginLink: {
      color: "#2563eb",
      textDecoration: "none",
      fontWeight: "600"
    },
    errorText: {
      color: "#dc2626",
      fontSize: "14px",
      marginBottom: "16px",
      padding: "12px",
      background: "#fee2e2",
      borderRadius: "8px",
      textAlign: "center"
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Create your account</h2>
            
            <p style={{textAlign: "center", color: "#6b7280", fontSize: "14px", marginBottom: "20px"}}>
              Join as a customer to book vehicle services
            </p>

            {error && <div style={styles.errorText}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={(e) => {
                    e.target.style.outline = "2px solid #3b82f6";
                    e.target.style.outlineOffset = "0px";
                    e.target.style.borderColor = "transparent";
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = "none";
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={(e) => {
                    e.target.style.outline = "2px solid #3b82f6";
                    e.target.style.outlineOffset = "0px";
                    e.target.style.borderColor = "transparent";
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = "none";
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{...styles.input, paddingRight: "48px"}}
                    placeholder="Create a password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={(e) => {
                      e.target.style.outline = "2px solid #3b82f6";
                      e.target.style.outlineOffset = "0px";
                      e.target.style.borderColor = "transparent";
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.borderColor = "#e5e7eb";
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#4b5563"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={styles.button}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = "#1d4ed8";
                    e.target.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = "#2563eb";
                    e.target.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                  }
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div style={styles.dividerContainer}>
              <div style={styles.dividerLine}>
                <div style={styles.dividerBorder}></div>
              </div>
              <div style={styles.dividerTextContainer}>
                <span style={styles.dividerText}>Or Sign Up With</span>
              </div>
            </div>

            <div style={styles.googleButtonContainer}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="100%"
              />
            </div>

            <div style={styles.footer}>
              <span style={styles.footerText}>
                Already have an account?{" "}
                <a 
                  href="/login" 
                  style={styles.loginLink}
                  onMouseEnter={(e) => e.target.style.color = "#1d4ed8"}
                  onMouseLeave={(e) => e.target.style.color = "#2563eb"}
                >
                  Sign in
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
