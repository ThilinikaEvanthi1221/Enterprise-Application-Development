import React, { useEffect, useState } from "react";
import { getStaff } from "../services/api";
import Layout from "../components/Layout";
import "./Dashboard.css";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState("all"); // all | last30 | thisYear
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getStaff();
        setStaff(res.data || []);
      } catch (e) {
        console.error("Failed to load staff", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredByQuery = staff.filter((s) => {
    const hay = `${s._id || ""} ${s.name || ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  const filtered = filteredByQuery.filter((s) => {
    const jd = new Date(s.joinedDate || s._id);
    if (showFilter === "last30") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return jd >= cutoff;
    }
    if (showFilter === "thisYear") {
      const start = new Date(new Date().getFullYear(), 0, 1);
      return jd >= start;
    }
    return true;
  });

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Remove full-page loading - render UI immediately
  return (
    <Layout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage and view employee information</p>
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ color: "#6b7280", fontSize: 13 }}>Show:</label>
            <select
              value={showFilter}
              onChange={(e)=>setShowFilter(e.target.value)}
              style={{ border: "1px solid #e5e7eb", background: "#fff", color: "#374151", borderRadius: 8, padding: "6px 10px", fontSize: 14 }}
            >
              <option value="all">All Employees</option>
              <option value="last30">Joined last 30 days</option>
              <option value="thisYear">Joined this year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Loading staff...
          </div>
        ) : (
        <div className="recent-bookings">
            <div className="bookings-header">
              <h2>Employee List</h2>
            </div>
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((s) => (
                      <tr key={s._id}>
                        <td>#{s._id.toString().slice(-8).toUpperCase()}</td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">{(s.name || "?").charAt(0)}</div>
                            <span>{s.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td>{formatDate(s.joinedDate || s._id)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "2rem" }}>No staff found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
    );
  }
