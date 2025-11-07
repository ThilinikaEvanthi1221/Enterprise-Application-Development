import React, { useState } from "react";
import { signup } from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(form);
      alert(res.data.msg);
    } catch (error) {
      alert(error.response?.data?.msg || "Signup failed");
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
        <input
          style={styles.input}
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
        <select
          style={styles.select}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          value={form.role}
        >
          <option value="admin">Admin</option>
        </select>
        <button
          style={styles.button}
          onMouseOver={(e) => (e.target.style.background = "#0056b3")}
          onMouseOut={(e) => (e.target.style.background = "#007bff")}
          type="submit"
        >
          Signup
        </button>
      </form>
    </div>
  );
}
