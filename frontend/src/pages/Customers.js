import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomers } from "../services/api";
import "./Dashboard.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState("all"); // all | withOrders | noOrders
  // Using static profile display in header to match Bookings page

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

  const filteredByQuery = customers.filter((c) => {
    const hay = `${c.name || ""} ${c.email || ""} ${c.vehicleNumber || ""} ${c.location || ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  const filtered = filteredByQuery.filter((c) => {
    if (showFilter === "withOrders") return (c.orders ?? 0) > 0;
    if (showFilter === "noOrders") return (c.orders ?? 0) === 0;
    return true;
  });

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  // No logout button on this page (to match Bookings page)

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">MMM</div>
            <span className="logo-text">AutoServicePro</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
          <Link to="/bookings" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Bookings
          </Link>
          <Link to="/customers" className="nav-item active">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Customers
          </Link>
          <a href="#inventory" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventory
          </a>
          <Link to="/staff" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Staff Management
          </Link>
          <a href="#notifications" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </a>
          <a href="#ratings" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Service Ratings
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="bookings-header">
          <div className="header-left">
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">Let's check your Garage today</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search..." />
              <span className="shortcut">⌘ K</span>
            </div>
            <div className="header-icons">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="notification-icon">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="notification-dot"></span>
              </div>
            </div>
            <div className="user-profile">
              <div className="avatar">JM</div>
              <div className="user-info">
                <span className="user-name">Jason Miller</span>
                <span className="user-role">Employee</span>
              </div>
            </div>
          </div>
        </header>

        {/* Filters Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ color: "#6b7280", fontSize: 13 }}>Show:</label>
            <select
              value={showFilter}
              onChange={(e)=>setShowFilter(e.target.value)}
              style={{ border: "1px solid #e5e7eb", background: "#fff", color: "#374151", borderRadius: 8, padding: "6px 10px", fontSize: 14 }}
            >
              <option value="all">All Customers</option>
              <option value="withOrders">With Orders</option>
              <option value="noOrders">No Orders</option>
            </select>
          </div>
        </div>

        {/* Full-width search with Filters button */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search by name, email, or others..."
                style={{ width: "100%", padding: "12px 14px 12px 38px", border: "1px solid #e5e7eb", borderRadius: 10 }}
              />
              <span style={{ position: "absolute", left: 12, top: 10, color: "#9ca3af" }}>🔍</span>
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", background: "#fff", padding: "10px 14px", borderRadius: 8, cursor: "pointer" }}>
              <span style={{ color: "#6b7280" }}>⚙</span>
              Filters
            </button>
          </div>
        </div>

        <div className="recent-bookings">
          <div className="bookings-header">
            <h2>Customer List</h2>
          </div>
          <div className="bookings-table-container">
          <table className="bookings-table">
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
        </div>
      </main>
    </div>
  );
}


