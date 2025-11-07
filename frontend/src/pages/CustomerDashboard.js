import React, { useEffect, useState } from "react";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import CustomerSidebar from "../components/layout/CustomerSidebar";
import DashboardStats from "../components/layout/DashboardStats";
import QuickActions from "../components/layout/QuickActions";
import UpcomingAppointments from "../components/layout/UpcomingAppointments";
import RecentActivity from "../components/layout/RecentActivity";

export default function CustomerDashboard() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/services/my-services",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to fetch service requests");
      }
    };

    fetchServices();
  }, []);

  // Calculate stats based on service status
  const stats = [
    {
      label: "Active Appointments",
      value: services.filter(
        (s) => s.status === "approved" || s.status === "ongoing"
      ).length,
      subtext: "Confirmed",
    },
    {
      label: "Pending Approval",
      value: services.filter(
        (s) => s.status === "requested" || s.status === "pending"
      ).length,
      subtext: "Awaiting",
    },
    {
      label: "In Progress",
      value: services.filter((s) => s.status === "ongoing").length,
      subtext: "Active now",
    },
    {
      label: "Completed Services",
      value: services.filter((s) => s.status === "completed").length,
      subtext: "All time",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col">
        <CustomerNavbar />
        <main className="p-6 overflow-y-auto">
          {/* Dashboard Stats Section */}
          <DashboardStats stats={stats} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Error Message (if any) */}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mt-4">
              {error}
            </div>
          )}

          {/* Upcoming and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <UpcomingAppointments />
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
