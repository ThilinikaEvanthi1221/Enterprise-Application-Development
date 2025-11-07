import React, { useState } from "react";
import RequestModificationPage from "./RequestModificationPage";
import ModificationUpdatesPage from "./ModificationUpdatesPage";

function ModificationDashboardPage() {
  const [activeTab, setActiveTab] = useState("appointment");

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Vehicle Modifications
          </h1>

          {/* Tab Buttons */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("appointment")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "appointment"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Modification Appointment
            </button>
            <button
              onClick={() => setActiveTab("myModifications")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "myModifications"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              My Modifications
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "appointment" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                🧾 Request a Vehicle Modification
              </h2>
              <div className="border-t pt-6">
                <RequestModificationPage />
              </div>
            </div>
          )}

          {activeTab === "myModifications" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                🔧 My Modifications
              </h2>
              <div className="border-t pt-6">
                <ModificationUpdatesPage />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModificationDashboardPage;
