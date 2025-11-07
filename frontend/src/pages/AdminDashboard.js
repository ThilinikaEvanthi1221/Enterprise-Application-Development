import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout";
import MetricCard from "../components/MetricCard";
import AppointmentStore from "../utils/AppointmentStore";

const Dashboard = () => {
  const navigate = useNavigate();

  const [appointmentsData, setAppointmentsData] = useState([]);

  // Time Logs weekly data
  const timeLogsData = [
    { day: "24 Jan", hours: 8.5 },
    { day: "25 Jan", hours: 9.2 },
    { day: "26 Jan", hours: 7.8 },
    { day: "27 Jan", hours: 10.0 },
    { day: "28 Jan", hours: 8.5 },
    { day: "29 Jan", hours: 9.5 },
    { day: "30 Jan", hours: 8.0 },
  ];

  const [totals, setTotals] = useState({
    users: 0,
    vehicles: 0,
    services: 0,
    appointments: 0,
    timeLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get appointments from store
        const appointments = AppointmentStore.getAppointments();

        // Calculate appointment stats
        const appointmentStats = AppointmentStore.getStats();

        // Fetch other data from API
        const token = localStorage.getItem("token");
        const [usersRes, vehiclesRes, servicesRes, timeLogsRes] =
          await Promise.all([
            fetch("http://localhost:5000/api/users", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .catch(() => []),
            fetch("http://localhost:5000/api/vehicles", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .catch(() => ({ vehicles: [] })),
            fetch("http://localhost:5000/api/services", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .catch(() => []),
            fetch("http://localhost:5000/api/time-logs", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .catch(() => []),
          ]);

        console.log("API Responses:", {
          usersRes,
          vehiclesRes,
          servicesRes,
          timeLogsRes,
        });

        const usersCount = Array.isArray(usersRes) ? usersRes.length : 0;
        const vehiclesCount = vehiclesRes?.vehicles
          ? Array.isArray(vehiclesRes.vehicles)
            ? vehiclesRes.vehicles.length
            : 0
          : Array.isArray(vehiclesRes)
          ? vehiclesRes.length
          : 0;
        const servicesCount = Array.isArray(servicesRes)
          ? servicesRes.length
          : 0;
        const appointmentsCount = appointmentStats.total || 0;
        const timeLogsCount = Array.isArray(timeLogsRes)
          ? timeLogsRes.length
          : 0;

        console.log("Counts:", {
          usersCount,
          vehiclesCount,
          servicesCount,
          appointmentsCount,
          timeLogsCount,
        });

        setTotals({
          users: usersCount,
          vehicles: vehiclesCount,
          services: servicesCount,
          appointments: appointmentsCount,
          timeLogs: timeLogsCount,
        });

        // Generate monthly data
        const monthlyData = appointments.reduce((acc, apt) => {
          const date = new Date(apt.dateTime);
          const month = date.toLocaleString("default", { month: "short" });

          if (!acc[month]) {
            acc[month] = { total: 0, completed: 0 };
          }

          acc[month].total++;
          if (apt.status === "completed") {
            acc[month].completed++;
          }

          return acc;
        }, {});

        // Convert to array format for charts
        const chartData = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ...data,
        }));

        setAppointmentsData(chartData);
        setError("");
      } catch (e) {
        setError("Failed to load dashboard metrics: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

  if (error && !error.includes("Unauthorized")) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Quick Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => navigate("/add-employee")}
            style={{
              padding: "12px 24px",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.background = "#2563eb")}
          >
            + Add New Employee
          </button>

          <button
            onClick={() => navigate("/admin-services")}
            style={{
              padding: "12px 24px",
              background: "#7c3aed",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#6d28d9")}
            onMouseLeave={(e) => (e.target.style.background = "#7c3aed")}
          >
            🔧 Manage Service Requests
          </button>
          <button
            onClick={() => navigate("/time-log-reports")}
            style={{
              padding: "12px 24px",
              background: "#059669",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#047857")}
            onMouseLeave={(e) => (e.target.style.background = "#059669")}
          >
            📊 View Time Log Reports
          </button>

        </div>

        {/* Metric Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
          <MetricCard
            title="Total Users"
            value={String(totals.users || 0)}
            change="+5.2%"
            trend="up"
            iconType="👥"
          />
          <MetricCard
            title="Total Vehicles"
            value={String(totals.vehicles || 0)}
            change="+2.1%"
            trend="up"
            iconType="🚗"
          />
          <MetricCard
            title="Total Appointments"
            value={String(totals.appointments || 0)}
            change="+12.5%"
            trend="up"
            iconType="📅"
          />
        </div>

        {/* Metric Cards - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total Services"
            value={String(totals.services || 0)}
            change="+3.0%"
            trend="up"
            iconType="🔧"
          />
          <MetricCard
            title="Hours Logged"
            value={String(totals.timeLogs || 0)}
            change="+8.2%"
            trend="up"
            iconType="⏱️"
          />
          <MetricCard
            title="ChatBot Queries"
            value={"-"}
            change="+15.3%"
            trend="up"
            iconType="💬"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Appointments Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Appointments Overview
                </h3>
                <p className="text-sm text-gray-500">Last 7 months</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-300"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={appointmentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ fill: "#60a5fa", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Time Logs Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Time Logs (Weekly)
              </h3>
              <p className="text-sm text-gray-500">Hours logged per day</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={timeLogsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
