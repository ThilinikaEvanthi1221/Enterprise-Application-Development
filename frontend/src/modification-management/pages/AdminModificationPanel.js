import React, { useState } from "react";
import AdminModificationDashboard from "./AdminModificationDashboard";
import ModificationCalendar from "../components/ModificationCalendar";

function AdminModificationPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            🛠 Manage Vehicle Modifications
          </h1>

          {/* Tab Buttons */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Dashboard View
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "calendar"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                📋 Modification Dashboard
              </h2>
              <div className="border-t pt-6">
                <AdminModificationDashboard />
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                📅 Modification Calendar
              </h2>
              <div className="border-t pt-6">
                <ModificationCalendar />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminModificationPanel;
