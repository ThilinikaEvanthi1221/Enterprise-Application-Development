import React, { useState, useEffect } from "react";

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch appointments instead of old service requests
      const response = await fetch(
        "http://localhost:5000/api/appointments/my",
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

  const handleCancelService = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      const token = localStorage.getItem("token");
      // Update appointment status to cancelled
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      if (response.ok) {
        alert("Appointment cancelled successfully");
        fetchMyServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Error cancelling appointment");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      // Old service statuses
      requested: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      ongoing: "bg-purple-100 text-purple-800",
      // Appointment statuses
      pending: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      "in-progress": "bg-purple-100 text-purple-800",
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔧</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Services</h1>
            <p className="text-gray-600 mt-1">
              Track and manage your vehicle service requests
            </p>
          </div>
        </div>
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
            Book your first appointment to get started
          </p>
          <a
            href="/customer-service-requests"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            <span className="text-xl">📅</span>
            Book an Appointment
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {services.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {appointment.service?.name || "Service Appointment"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {appointment.notes || "No notes provided"}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <p className="font-medium text-gray-900">
                        {appointment.service?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Vehicle:</span>
                      <p className="font-medium text-gray-900">
                        {appointment.vehicle?.make} {appointment.vehicle?.model}{" "}
                        ({appointment.vehicle?.plateNumber})
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <p className="font-semibold text-green-600">
                        ${appointment.price?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Progress:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${appointment.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">
                          {appointment.progress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {appointment.assignedTo && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Assigned to:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {appointment.assignedTo.name}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex gap-4 text-sm text-gray-600">
                    <span>📅 Scheduled: {formatDate(appointment.date)}</span>
                    {appointment.estimatedDuration && (
                      <span>
                        ⏱️ Duration: {appointment.estimatedDuration} min
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedService(appointment)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 text-sm font-medium"
                  >
                    View Details
                  </button>
                  {["pending", "confirmed"].includes(appointment.status) && (
                    <button
                      onClick={() => handleCancelService(appointment._id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
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
                    {selectedService.service?.name || "Appointment Details"}
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
                    Service
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedService.service?.name || "N/A"}
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
                    Price
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedService.price?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Scheduled Date
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedService.date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {selectedService.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Notes
                  </h4>
                  <p className="text-gray-900">{selectedService.notes}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Progress
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${selectedService.progress || 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedService.progress || 0}%
                  </span>
                </div>
              </div>

              {selectedService.assignedTo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Assigned To
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {selectedService.assignedTo.name}
                  </p>
                </div>
              )}

              {selectedService.customerNotes && (
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Your Notes
                  </h4>
                  <p className="text-blue-800">
                    {selectedService.customerNotes}
                  </p>
                </div>
              )}

              {selectedService.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    Employee Notes
                  </h4>
                  <p className="text-yellow-800">{selectedService.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Requested
                  </h4>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedService.requestedDate)}
                  </p>
                </div>
                {selectedService.startDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Started
                    </h4>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedService.startDate)}
                    </p>
                  </div>
                )}
                {selectedService.completionDate && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Completed
                    </h4>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedService.completionDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedService(null)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
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

export default MyServices;
