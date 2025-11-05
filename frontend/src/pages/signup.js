import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const res = await signup(form);
      setSuccess(res.data.msg || "Signup successful!");
      
      // If employee, redirect to dashboard after 1.5 seconds
      // If customer, redirect to login
      setTimeout(() => {
        if (form.role === "employee") {
          // After signup, employee should login to get token
          navigate("/login");
        } else {
          navigate("/login");
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    }
  };

  // Shared styles
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f4f6f9",
    },
    form: {
      background: "white",
      padding: "30px 40px",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      width: "320px",
    },
    heading: {
      textAlign: "center",
      marginBottom: "10px",
      color: "#333",
    },
    input: {
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "15px",
    },
    select: {
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "15px",
      background: "white",
    },
    button: {
      padding: "12px",
      background: "#007bff",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background 0.3s ease",
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.heading}>Signup</h2>
        {error && <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "10px" }}>{error}</div>}
        {success && <div style={{ color: "#10b981", fontSize: "14px", marginBottom: "10px" }}>{success}</div>}
        <input
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          style={styles.select}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="customer">Customer</option>
          <option value="employee">Employee</option>
        </select>
        <button
          style={styles.button}
          onMouseOver={(e) => (e.target.style.background = "#0056b3")}
          onMouseOut={(e) => (e.target.style.background = "#007bff")}
          type="submit"
        >
          Signup
        </button>
        <div style={{ textAlign: "center", marginTop: "10px", fontSize: "14px", color: "#6b7280" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#007bff", textDecoration: "none", fontWeight: "500" }}>
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
}
