import React, { useEffect, useState } from "react";
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

  // Remove full-page loading - render UI immediately
  return (
    <>
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

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Loading customers...
        </div>
      ) : (
        <>
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
        </>
      )}
    </>
  );
}


