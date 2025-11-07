import React, { useEffect, useState } from "react";
import api from "../services/api"; // use your axios instance if present
import CustomerNavbar from "../components/layout/CustomerNavbar";
import CustomerSidebar from "../components/layout/CustomerSidebar";
import DashboardStats from "../components/layout/DashboardStats";
import QuickActions from "../components/layout/QuickActions";
import UpcomingAppointments from "../components/layout/UpcomingAppointments";
import RecentActivity from "../components/layout/RecentActivity";

export default function CustomerDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // <-- change endpoint to the canonical services route
      const res = await api.get("/services"); // previously "/services/my-services"
      setServices(res.data || []);
      setError("");
    } catch (err) {
      // better error logging: if server returned HTML this shows it
      const msg =
        err.response && err.response.data
          ? JSON.stringify(err.response.data)
          : err.message;
      console.error("Error fetching services:", msg);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Active Appointments", value: services.filter(a => a.status === "approved" || a.status === "ongoing").length, subtext: "Confirmed" },
    { label: "Pending Approval", value: services.filter(a => a.status === "requested" || a.status === "pending").length, subtext: "Awaiting" },
    { label: "In Progress", value: services.filter(a => a.status === "ongoing").length, subtext: "Active now" },
    { label: "Completed Services", value: services.filter(a => a.status === "completed").length, subtext: "All time" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col">
        <CustomerNavbar />
        <main className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
          <DashboardStats stats={stats} />
          <QuickActions />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingAppointments />
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
