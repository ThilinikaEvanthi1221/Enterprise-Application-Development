import React, { useState } from "react";
import { login } from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Login form data:', form);
      const res = await login(form);
      console.log('Login response:', res.data);
      localStorage.setItem("token", res.data.token);
      
      // Redirect based on role
      if (res.data.user.role === 'inventory_manager' || res.data.user.role === 'employee') {
        window.location.href = '/inventory/dashboard';
      } else if (res.data.user.role === 'admin') {
        window.location.href = '/inventory/dashboard';
      } else {
        alert("Login successful! Role: " + res.data.user.role);
        window.location.href = '/inventory/dashboard'; // Default to inventory for all users
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      alert('Login failed: ' + (error.response?.data?.msg || error.response?.data?.message || error.message));
    }
  };

  // CSS styles inside JS
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
        <h2 style={styles.heading}>Login</h2>
        <input
          style={styles.input}
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          style={styles.button}
          onMouseOver={(e) => (e.target.style.background = "#0056b3")}
          onMouseOut={(e) => (e.target.style.background = "#007bff")}
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
