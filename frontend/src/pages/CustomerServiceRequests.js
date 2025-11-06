import React, { useState, useEffect } from "react";
import { getMyVehicles } from "../services/api";

const CustomerServiceRequests = () => {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [formData, setFormData] = useState({
    serviceType: "Oil Change",
    name: "",
    description: "",
    vehicleId: "",
    laborHours: 1,
    partsRequired: [],
    customerNotes: "",
  });

  const serviceTypes = [
    "Oil Change",
    "Tire Replacement",
    "Brake Service",
    "Engine Repair",
    "Transmission Service",
    "AC Service",
    "Battery Replacement",
    "General Inspection",
    "Other",
  ];

  useEffect(() => {
    fetchMyServices();
    fetchMyVehicles();
  }, []);

  const fetchMyServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/services/my-services",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  const fetchMyVehicles = async () => {
    try {
      const response = await getMyVehicles();
      console.log("My vehicles from API:", response.data);
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  const handleRequestService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/services/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Service request submitted successfully!");
        setShowRequestModal(false);
        setFormData({
          serviceType: "Oil Change",
          name: "",
          description: "",
          vehicleId: "",
          laborHours: 1,
          partsRequired: [],
          customerNotes: "",
        });
        fetchMyServices();
      } else {
        alert(data.msg || "Failed to submit service request");
      }
    } catch (error) {
      console.error("Error requesting service:", error);
      alert("Error submitting request");
    }
  };

  const handleCancelService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to cancel this service?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/services/${serviceId}/cancel`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Service cancelled successfully");
        fetchMyServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to cancel service");
      }
    } catch (error) {
      console.error("Error cancelling service:", error);
      alert("Error cancelling service");
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            My Service Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage your vehicle service requests
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
        >
          + Request New Service
        </button>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
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
            No service requests yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by requesting your first service
          </p>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Request Service
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
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
                  <p className="text-sm text-gray-600 mb-3">
                    {service.description || "No description provided"}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Service Type:</span>
                      <p className="font-medium text-gray-900">
                        {service.serviceType}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Vehicle:</span>
                      <p className="font-medium text-gray-900">
                        {service.vehicle?.make} {service.vehicle?.model} (
                        {service.vehicle?.plateNumber})
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estimated Cost:</span>
                      <p className="font-semibold text-green-600">
                        ${service.estimatedCost?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Progress:</span>
                      <div className="flex items-center gap-2">
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

                  {service.assignedTo && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Assigned to:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {service.assignedTo.name}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex gap-4 text-sm text-gray-600">
                    <span>Requested: {formatDate(service.requestedDate)}</span>
                    {service.startDate && (
                      <span>Started: {formatDate(service.startDate)}</span>
                    )}
                    {service.completionDate && (
                      <span>
                        Completed: {formatDate(service.completionDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 text-sm font-medium"
                  >
                    View Details
                  </button>
                  {["requested", "pending", "approved"].includes(
                    service.status
                  ) && (
                    <button
                      onClick={() => handleCancelService(service._id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {service.customerNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700">
                    <strong>Your Notes:</strong> {service.customerNotes}
                  </p>
                </div>
              )}

              {service.notes && (
                <div className="mt-2 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-700">
                    <strong>Employee Notes:</strong> {service.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Service Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Request New Service
              </h2>
              <p className="text-gray-600 mt-1">
                Fill in the details for your service request
              </p>
            </div>

            <form onSubmit={handleRequestService} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Regular Oil Change"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle *
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model} {vehicle.year} -{" "}
                      {vehicle.plateNumber}
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    You need to add a vehicle first
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the issue or service needed..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Labor Hours
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.laborHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      laborHours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.customerNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, customerNotes: e.target.value })
                  }
                  placeholder="Any special requirements or notes..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedService.name}
                  </h2>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      selectedService.status
                    )}`}
                  >
                    {selectedService.status?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Service Type
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedService.serviceType}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Vehicle
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedService.vehicle?.make}{" "}
                    {selectedService.vehicle?.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedService.vehicle?.plateNumber}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Estimated Cost
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedService.estimatedCost?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Actual Cost
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedService.actualCost
                      ? `$${selectedService.actualCost.toFixed(2)}`
                      : "TBD"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Progress
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all"
                      style={{ width: `${selectedService.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedService.progress || 0}%
                  </span>
                </div>
              </div>

              {selectedService.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </h4>
                  <p className="text-gray-700">{selectedService.description}</p>
                </div>
              )}

              {selectedService.assignedTo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Assigned Employee
                  </h4>
                  <p className="text-gray-900">
                    {selectedService.assignedTo.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedService.assignedTo.email}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Requested
                  </h4>
                  <p className="text-gray-900">
                    {formatDate(selectedService.requestedDate)}
                  </p>
                </div>
                {selectedService.startDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Started
                    </h4>
                    <p className="text-gray-900">
                      {formatDate(selectedService.startDate)}
                    </p>
                  </div>
                )}
                {selectedService.completionDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Completed
                    </h4>
                    <p className="text-gray-900">
                      {formatDate(selectedService.completionDate)}
                    </p>
                  </div>
                )}
              </div>

              {selectedService.partsRequired &&
                selectedService.partsRequired.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Parts Required
                    </h4>
                    <div className="space-y-2">
                      {selectedService.partsRequired.map((part, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-gray-900">{part.name}</span>
                          <span className="text-gray-600">
                            Qty: {part.quantity} - ${part.cost?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectedService(null)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerServiceRequests;
