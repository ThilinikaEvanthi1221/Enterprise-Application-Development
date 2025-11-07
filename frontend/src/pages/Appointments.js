import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import { getAppointments } from "../services/api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    fetchAppointments();
    fetchEmployees();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await getAppointments();
      setAppointments(data || []);
      setError("");
    } catch (e) {
      console.error("Error fetching appointments:", e);
      setError("Failed to load appointments");
    } finally {
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
      // Filter only employees
      const employeeList = data.filter(
        (user) => user.role === "employee" || user.role === "admin"
      );
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        alert(`Appointment status updated to ${newStatus}`);
        fetchAppointments();
        setShowManageModal(false);
        setSelectedAppointment(null);
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error updating appointment");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Appointment deleted successfully");
        fetchAppointments();
        setShowManageModal(false);
        setSelectedAppointment(null);
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Error deleting appointment");
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/appointments/${selectedAppointment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assignedTo: selectedEmployee }),
        }
      );

      if (response.ok) {
        alert("Employee assigned successfully");
        fetchAppointments();
        setShowManageModal(false);
        setSelectedAppointment(null);
        setSelectedEmployee("");
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to assign employee");
      }
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert("Error assigning employee");
    }
  };

  const openManageModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedEmployee(appointment.assignedTo?._id || "");
    setShowManageModal(true);
  };

  const statusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
    "in-progress": { bg: "bg-purple-100", text: "text-purple-800" },
    completed: { bg: "bg-green-100", text: "text-green-800" },
    cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };

  // Filter appointments by status
  const filteredAppointments = appointments.filter((appointment) => {
    if (statusFilter === "all") return true;
    return appointment.status === statusFilter;
  });

  const totalItems = filteredAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Appointments
          </h1>
          <p className="text-gray-600">
            Manage customer appointments and service requests
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter("pending");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Pending ({appointments.filter((a) => a.status === "pending").length}
            )
          </button>
          <button
            onClick={() => {
              setStatusFilter("confirmed");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "confirmed"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Confirmed (
            {appointments.filter((a) => a.status === "confirmed").length})
          </button>
          <button
            onClick={() => {
              setStatusFilter("in-progress");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "in-progress"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            In Progress (
            {appointments.filter((a) => a.status === "in-progress").length})
          </button>
          <button
            onClick={() => {
              setStatusFilter("completed");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Completed (
            {appointments.filter((a) => a.status === "completed").length})
          </button>
          <button
            onClick={() => {
              setStatusFilter("cancelled");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Cancelled (
            {appointments.filter((a) => a.status === "cancelled").length})
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td className="px-6 py-4" colSpan={8}>
                      Loading...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td className="px-6 py-4 text-red-600" colSpan={8}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredAppointments.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-4 text-gray-500 text-center"
                      colSpan={8}
                    >
                      No appointments found
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  currentAppointments.map((appointment) => {
                    const id = appointment._id || appointment.id;
                    const status = (
                      appointment.status || "pending"
                    ).toLowerCase();
                    const statusStyle =
                      statusColors[status] || statusColors["pending"];

                    const customerName =
                      appointment.customer?.name ||
                      appointment.user?.name ||
                      "N/A";

                    const vehicleInfo = appointment.vehicle
                      ? `${appointment.vehicle.make || ""} ${
                          appointment.vehicle.model || ""
                        } (${appointment.vehicle.plateNumber || ""})`
                      : "N/A";

                    const serviceName = appointment.service?.name || "N/A";

                    const appointmentDate =
                      appointment.date || appointment.scheduledAt;
                    let formattedDate = "N/A";
                    if (appointmentDate) {
                      try {
                        const date = new Date(appointmentDate);
                        formattedDate = date.toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      } catch (e) {
                        formattedDate = String(appointmentDate);
                      }
                    }

                    const price = appointment.price
                      ? `$${appointment.price.toFixed(2)}`
                      : "N/A";

                    const statusDisplay =
                      status.charAt(0).toUpperCase() + status.slice(1);

                    return (
                      <tr key={id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicleInfo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {serviceName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {statusDisplay}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div
                              className="w-full bg-gray-200 rounded-full h-2.5 mr-2"
                              style={{ minWidth: "80px" }}
                            >
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{
                                  width: `${appointment.progress || 0}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-700 font-medium">
                              {appointment.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openManageModal(appointment)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!loading && !error && appointments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>

        {/* Manage Appointment Modal */}
        {showManageModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Manage Appointment
                  </h2>
                  <button
                    onClick={() => {
                      setShowManageModal(false);
                      setSelectedAppointment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Appointment Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium">
                          {selectedAppointment.customer?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium">
                          {selectedAppointment.customer?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Vehicle</p>
                        <p className="font-medium">
                          {selectedAppointment.vehicle?.make}{" "}
                          {selectedAppointment.vehicle?.model} (
                          {selectedAppointment.vehicle?.plateNumber})
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Service</p>
                        <p className="font-medium">
                          {selectedAppointment.service?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date & Time</p>
                        <p className="font-medium">
                          {new Date(selectedAppointment.date).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-medium text-green-600">
                          ${selectedAppointment.price?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Progress</p>
                        <div className="flex items-center mt-1">
                          <div
                            className="w-full bg-gray-200 rounded-full h-2.5 mr-2"
                            style={{ maxWidth: "100px" }}
                          >
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${selectedAppointment.progress || 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-medium text-blue-600">
                            {selectedAppointment.progress || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Notes</p>
                        <p className="font-medium">
                          {selectedAppointment.notes || "No notes"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Update Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedAppointment._id, "confirmed")
                      }
                      disabled={selectedAppointment.status === "confirmed"}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedAppointment.status === "confirmed"
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      ✓ Confirm
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedAppointment._id,
                          "in-progress"
                        )
                      }
                      disabled={selectedAppointment.status === "in-progress"}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedAppointment.status === "in-progress"
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-purple-500 text-white hover:bg-purple-600"
                      }`}
                    >
                      🔧 Start Work
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedAppointment._id, "completed")
                      }
                      disabled={selectedAppointment.status === "completed"}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedAppointment.status === "completed"
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      ✓ Complete
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedAppointment._id, "cancelled")
                      }
                      disabled={selectedAppointment.status === "cancelled"}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedAppointment.status === "cancelled"
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      ✗ Cancel
                    </button>
                  </div>
                </div>

                {/* Assign Employee */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Assign Employee
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedAppointment.assignedTo && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Currently Assigned:
                        </p>
                        <p className="font-medium text-blue-800">
                          {selectedAppointment.assignedTo.name || "N/A"} (
                          {selectedAppointment.assignedTo.email || "N/A"})
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an employee...</option>
                        {employees.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name} - {employee.email} ({employee.role})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignEmployee}
                        disabled={!selectedEmployee}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          selectedEmployee
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Assign
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Select an employee to assign this appointment for tracking
                      and updates
                    </p>
                  </div>
                </div>

                {/* Delete Appointment */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      handleDeleteAppointment(selectedAppointment._id)
                    }
                    className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                  >
                    🗑️ Delete Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;
