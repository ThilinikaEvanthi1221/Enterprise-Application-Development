import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";

export default function AddEmployee() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const API = axios.create({ 
        baseURL: "http://localhost:5000/api",
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create employee with role "employee"
      const employeeData = { ...form, role: "employee" };
      await API.post("/auth/signup", employeeData);
      
      setSuccess(`Employee created successfully! Email: ${form.email}, Password: ${form.password}`);
      // Navigate to employee list after successful creation
      navigate('/employees');
      setForm({ name: "", email: "", password: "" });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create employee");
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password });
  };

  const styles = {
    container: {
      padding: "24px",
      maxWidth: "600px",
      margin: "0 auto"
    },
    card: {
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      padding: "32px"
    },
    heading: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "24px"
    },
    formGroup: {
      marginBottom: "20px"
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "8px"
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
      display: "flex",
      gap: "8px"
    },
    button: {
      padding: "12px 24px",
      background: "#2563eb",
      color: "white",
      fontSize: "16px",
      fontWeight: "600",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
      width: "100%"
    },
    secondaryButton: {
      padding: "12px 24px",
      background: "#6b7280",
      color: "white",
      fontSize: "14px",
      fontWeight: "600",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap"
    },
    errorText: {
      color: "#dc2626",
      fontSize: "14px",
      marginBottom: "16px",
      padding: "12px",
      background: "#fee2e2",
      borderRadius: "8px"
    },
    successText: {
      color: "#16a34a",
      fontSize: "14px",
      marginBottom: "16px",
      padding: "12px",
      background: "#dcfce7",
      borderRadius: "8px",
      whiteSpace: "pre-wrap"
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.heading}>Add New Employee</h1>

          {error && <div style={styles.errorText}>{error}</div>}
          {success && <div style={styles.successText}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter employee's full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                placeholder="Enter employee's email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type="text"
                  style={{...styles.input, flex: 1}}
                  placeholder="Enter password or generate one"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => e.target.style.background = "#4b5563"}
                  onMouseLeave={(e) => e.target.style.background = "#6b7280"}
                >
                  Generate
                </button>
              </div>
              <small style={{color: "#6b7280", fontSize: "12px"}}>
                Save this password - it won't be shown again
              </small>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.target.style.background = "#1d4ed8")}
              onMouseLeave={(e) => !loading && (e.target.style.background = "#2563eb")}
            >
              {loading ? "Creating Employee..." : "Create Employee"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
