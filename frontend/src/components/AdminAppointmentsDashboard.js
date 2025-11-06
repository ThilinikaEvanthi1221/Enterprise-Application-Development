import React, { useEffect, useState } from "react";
import "../styles/AdminAppointmentsDashboard.css";
import AdminAppointmentManagement from "./AdminAppointmentManagement";

console.log("✅ Admin Dashboard component loaded");

export default function AdminAppointmentsDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
  });

  // Fetch appointment stats from backend
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/appointments");
      const data = await res.json();

      const statCount = {
        pending: data.filter((a) => a.status === "pending").length,
        confirmed: data.filter((a) => a.status === "confirmed").length,
        inProgress: data.filter((a) => a.status === "in-progress").length,
        completed: data.filter((a) => a.status === "completed").length,
      };

      setStats(statCount);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* ===== HEADER ===== */}
  

      {/* ===== STATISTICS ===== */}
      <section className="stats-container">
        <div className="stat-card orange">
          <div>
            <p>Pending Approval</p>
            <h2>{stats.pending}</h2>
            <span>⚠ Needs attention</span>
          </div>
        </div>

        <div className="stat-card green">
          <div>
            <p>Confirmed</p>
            <h2>{stats.confirmed}</h2>
            <span>✅ Scheduled</span>
          </div>
        </div>

        <div className="stat-card blue">
          <div>
            <p>In Progress</p>
            <h2>{stats.inProgress}</h2>
            <span>🕒 Active Services</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div>
            <p>Completed</p>
            <h2>{stats.completed}</h2>
            <span>💰 Finished Jobs</span>
          </div>
        </div>
      </section>

      {/* ===== APPOINTMENTS SECTION ===== */}
      <section className="appointments-section">
        <div className="section-header">
          <h2>Appointment Management</h2>
          <p>Review and manage customer appointments</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {["pending", "confirmed", "in-progress", "completed", "all"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          <AdminAppointmentManagement filter={activeTab} />
        </div>
      </section>
    </div>
  );
}
