import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomers } from "../services/api";
import "./Customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getCustomers();
        setCustomers(res.data || []);
      } catch (e) {
        console.error("Failed to load customers", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = customers.filter((c) => {
    const hay = `${c.name || ""} ${c.email || ""} ${c.vehicleNumber || ""} ${c.location || ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div className="customers-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">MMM</div>
            <span className="logo-text">AutoServicePro</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/bookings" className="nav-item">Bookings</Link>
          <Link to="/customers" className="nav-item active">Customers</Link>
        </nav>
      </aside>

      <main className="main-content">
        <header className="customers-header">
          <div className="header-left">
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">Let's check your Garage today</p>
          </div>
          <div className="search-bar">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by name, email, or others..." />
          </div>
        </header>

        <div className="customers-table-section">
          <table className="customers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Vehicle Number</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Spent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c, idx) => (
                  <tr key={c._id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">{(c.name || "?").charAt(0)}</div>
                        <div className="customer-name">{c.name || "Unknown"}</div>
                      </div>
                    </td>
                    <td>{c.email || "-"}</td>
                    <td>{c.vehicleNumber || "-"}</td>
                    <td>{c.location || "-"}</td>
                    <td>{c.orders ?? 0}</td>
                    <td>{c.spent ? `$${c.spent.toFixed(2)}` : "$0.00"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}


