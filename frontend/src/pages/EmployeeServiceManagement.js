import React, { useState, useEffect } from "react";

const EmployeeServiceManagement = () => {
  const [assignedServices, setAssignedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [activeTab, setActiveTab] = useState("assigned");
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [progressData, setProgressData] = useState({
    status: "",
    progress: 0,
    notes: "",
  });

  useEffect(() => {
    fetchServices();
  }, [activeTab]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        activeTab === "assigned"
          ? "/api/services/assigned"
          : "/api/services/available";

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (activeTab === "assigned") {
        setAssignedServices(Array.isArray(data) ? data : []);
      } else {
        setAvailableServices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimService = async (serviceId) => {
    if (!window.confirm("Claim this service?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/services/${serviceId}/claim`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Service claimed successfully!");
        fetchServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to claim service");
      }
    } catch (error) {
      console.error("Error claiming service:", error);
      alert("Error claiming service");
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/services/${selectedService._id}/progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(progressData),
        }
      );

      if (response.ok) {
        alert("Progress updated successfully!");
        setShowProgressModal(false);
        setSelectedService(null);
        setProgressData({ status: "", progress: 0, notes: "" });
        fetchServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Error updating progress");
    }
  };

  const openProgressModal = (service) => {
    setSelectedService(service);
    setProgressData({
      status: service.status,
      progress: service.progress || 0,
      notes: service.notes || "",
    });
    setShowProgressModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      ongoing: "bg-purple-100 text-purple-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ServiceCard = ({ service, isAvailable = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {service.name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                service.status
              )}`}
            >
              {service.status?.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{service.serviceType}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>
              <p className="font-medium text-gray-900">
                {service.customer?.name || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Vehicle:</span>
              <p className="font-medium text-gray-900">
                {service.vehicle?.make} {service.vehicle?.model}
              </p>
              <p className="text-xs text-gray-500">
                {service.vehicle?.plateNumber}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Est. Cost:</span>
              <p className="font-semibold text-green-600">
                ${service.estimatedCost?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Progress:</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${service.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {service.progress || 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-4 text-sm text-gray-600">
            <span>Requested: {formatDate(service.requestedDate)}</span>
            {service.startDate && (
              <span>Started: {formatDate(service.startDate)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          {isAvailable ? (
            <button
              onClick={() => handleClaimService(service._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
            >
              Claim Service
            </button>
          ) : (
            <button
              onClick={() => openProgressModal(service)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
            >
              Update Progress
            </button>
          )}
        </div>
      </div>

      {service.description && (
        <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
          <p className="text-sm text-gray-700">
            <strong>Description:</strong> {service.description}
          </p>
        </div>
      )}

      {service.customerNotes && (
        <div className="mt-2 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
          <p className="text-sm text-gray-700">
            <strong>Customer Notes:</strong> {service.customerNotes}
          </p>
        </div>
      )}

      {service.notes && (
        <div className="mt-2 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
          <p className="text-sm text-gray-700">
            <strong>Work Notes:</strong> {service.notes}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Service Management</h1>
        <p className="text-gray-600 mt-1">
          Manage and track your assigned services
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`pb-3 px-2 font-semibold transition ${
              activeTab === "assigned"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Assigned Services
            {assignedServices.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {assignedServices.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`pb-3 px-2 font-semibold transition ${
              activeTab === "available"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Available Services
            {availableServices.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {availableServices.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      ) : (
        <>
          {activeTab === "assigned" && (
            <>
              {assignedServices.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No assigned services
                  </h3>
                  <p className="text-gray-500">
                    Check the Available Services tab to claim work
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {assignedServices.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "available" && (
            <>
              {availableServices.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No available services
                  </h3>
                  <p className="text-gray-500">
                    All services are currently assigned
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {availableServices.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      isAvailable
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Update Service Progress
              </h2>
              <p className="text-gray-600 mt-1">{selectedService.name}</p>
            </div>

            <form onSubmit={handleUpdateProgress} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={progressData.status}
                  onChange={(e) =>
                    setProgressData({ ...progressData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    Keep Current Status ({selectedService.status})
                  </option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress: {progressData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressData.progress}
                  onChange={(e) =>
                    setProgressData({
                      ...progressData,
                      progress: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Notes
                </label>
                <textarea
                  value={progressData.notes}
                  onChange={(e) =>
                    setProgressData({ ...progressData, notes: e.target.value })
                  }
                  placeholder="Add notes about the work progress..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Service Details:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <p className="font-medium">
                      {selectedService.customer?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Vehicle:</span>
                    <p className="font-medium">
                      {selectedService.vehicle?.make}{" "}
                      {selectedService.vehicle?.model}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Service Type:</span>
                    <p className="font-medium">{selectedService.serviceType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Est. Cost:</span>
                    <p className="font-medium text-green-600">
                      ${selectedService.estimatedCost?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Update Progress
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProgressModal(false);
                    setSelectedService(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeServiceManagement;
