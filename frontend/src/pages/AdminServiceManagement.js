import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const AdminServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [assignedEmployee, setAssignedEmployee] = useState("");

  useEffect(() => {
    fetchServices();
    fetchEmployees();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const employeeList = Array.isArray(data)
        ? data.filter((user) => user.role === "employee")
        : [];
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleApproveService = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const body = assignedEmployee ? { assignedTo: assignedEmployee } : {};

      const response = await fetch(
        `http://localhost:5000/api/services/${selectedService._id}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        alert("Service approved successfully!");
        setShowApproveModal(false);
        setSelectedService(null);
        setAssignedEmployee("");
        fetchServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to approve service");
      }
    } catch (error) {
      console.error("Error approving service:", error);
      alert("Error approving service");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/services/${serviceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Service deleted successfully");
        fetchServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Error deleting service");
    }
  };

  const openApprovalModal = (service) => {
    setSelectedService(service);
    setAssignedEmployee(service.assignedTo?._id || "");
    setShowApproveModal(true);
  };

  const openReassignModal = (service) => {
    setSelectedService(service);
    setAssignedEmployee(service.assignedTo?._id || "");
    setShowReassignModal(true);
  };

  const handleReassignEmployee = async (e) => {
    e.preventDefault();

    if (!assignedEmployee) {
      alert("Please select an employee");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/services/${selectedService._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assignedTo: assignedEmployee }),
        }
      );

      if (response.ok) {
        alert("Employee reassigned successfully!");
        setShowReassignModal(false);
        setSelectedService(null);
        setAssignedEmployee("");
        fetchServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to reassign employee");
      }
    } catch (error) {
      console.error("Error reassigning employee:", error);
      alert("Error reassigning employee");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800 border-yellow-300",
      pending: "bg-blue-100 text-blue-800 border-blue-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      ongoing: "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-gray-100 text-gray-800 border-gray-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredServices = services.filter(
    (service) => filterStatus === "all" || service.status === filterStatus
  );

  const stats = {
    total: services.length,
    requested: services.filter((s) => s.status === "requested").length,
    approved: services.filter((s) => s.status === "approved").length,
    ongoing: services.filter((s) => s.status === "ongoing").length,
    completed: services.filter((s) => s.status === "completed").length,
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Service Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and oversee all service requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Services</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Requested</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.requested}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Ongoing</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.ongoing}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-600">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              "all",
              "requested",
              "approved",
              "ongoing",
              "completed",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Services Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
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
              No services found
            </h3>
            <p className="text-gray-500">
              No services match the selected filter
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.serviceType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {service.customer?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {service.vehicle?.make} {service.vehicle?.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.vehicle?.plateNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-block rounded-full text-xs font-semibold ${getStatusColor(
                            service.status
                          )}`}
                        >
                          {service.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${service.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {service.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {service.assignedTo?.name || (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-green-600">
                          ${service.estimatedCost?.toFixed(2) || "0.00"}
                        </div>
                        {service.actualCost > 0 && (
                          <div className="text-xs text-gray-500">
                            Actual: ${service.actualCost.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(service.requestedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {service.status === "requested" && (
                            <button
                              onClick={() => openApprovalModal(service)}
                              className="text-green-600 hover:text-green-900 font-semibold"
                            >
                              Approve
                            </button>
                          )}
                          {["approved", "ongoing", "completed"].includes(
                            service.status
                          ) && (
                            <button
                              onClick={() => openReassignModal(service)}
                              className="text-purple-600 hover:text-purple-900 font-semibold"
                            >
                              Reassign
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedService(service)}
                            className="text-blue-600 hover:text-blue-900 font-semibold"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Approve Service Request
                </h2>
                <p className="text-gray-600 mt-1">{selectedService.name}</p>
              </div>

              <form onSubmit={handleApproveService} className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">
                      {selectedService.customer?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Type:</span>
                    <span className="font-medium">
                      {selectedService.serviceType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">
                      {selectedService.vehicle?.make}{" "}
                      {selectedService.vehicle?.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Cost:</span>
                    <span className="font-semibold text-green-600">
                      ${selectedService.estimatedCost?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Employee (Optional)
                  </label>
                  <select
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Leave Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.email}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    You can assign an employee now or let them claim it later
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Approve Service
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApproveModal(false);
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

        {/* Reassign Employee Modal */}
        {showReassignModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reassign Employee
                </h2>
                <p className="text-gray-600 mt-1">{selectedService.name}</p>
              </div>

              <form onSubmit={handleReassignEmployee} className="p-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Employee:</span>
                      <p className="font-semibold text-gray-900">
                        {selectedService.assignedTo?.name || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-semibold">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            selectedService.status
                          )}`}
                        >
                          {selectedService.status?.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <p className="font-medium text-gray-900">
                        {selectedService.customer?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Progress:</span>
                      <p className="font-medium text-gray-900">
                        {selectedService.progress || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Employee *
                  </label>
                  <select
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} ({employee.email})
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    The service will be reassigned to the selected employee
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Reassign Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReassignModal(false);
                      setSelectedService(null);
                      setAssignedEmployee("");
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

        {/* Service Details Modal */}
        {selectedService && !showApproveModal && !showReassignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-start">
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

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Customer Information
                    </h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedService.customer?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedService.customer?.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Vehicle Information
                    </h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedService.vehicle?.make}{" "}
                      {selectedService.vehicle?.model}{" "}
                      {selectedService.vehicle?.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedService.vehicle?.plateNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Estimated Cost
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedService.estimatedCost?.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Actual Cost
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedService.actualCost
                        ? `$${selectedService.actualCost.toFixed(2)}`
                        : "TBD"}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Progress
                    </h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedService.progress || 0}%
                    </p>
                  </div>
                </div>

                {selectedService.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedService.description}
                    </p>
                  </div>
                )}

                {selectedService.assignedTo && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
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
                            className="flex justify-between items-center p-3 bg-gray-50 rounded"
                          >
                            <span className="text-gray-900 font-medium">
                              {part.name}
                            </span>
                            <span className="text-gray-600">
                              Qty: {part.quantity} - ${part.cost?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedService.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Work Notes
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                      {selectedService.notes}
                    </p>
                  </div>
                )}

                {selectedService.customerNotes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Customer Notes
                    </h4>
                    <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg">
                      {selectedService.customerNotes}
                    </p>
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
    </Layout>
  );
};

export default AdminServiceManagement;
