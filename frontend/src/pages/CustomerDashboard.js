import React, { useEffect, useState } from "react";
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
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/services/my-services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to fetch service data");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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
