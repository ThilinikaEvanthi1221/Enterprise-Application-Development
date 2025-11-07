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

  useEffect(() => {
    fetchAppointments();
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

  const statusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
    "in-progress": { bg: "bg-purple-100", text: "text-purple-800" },
    completed: { bg: "bg-green-100", text: "text-green-800" },
    cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };

  const totalItems = appointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = appointments.slice(startIndex, endIndex);

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
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td className="px-6 py-4" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td className="px-6 py-4 text-red-600" colSpan={6}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && appointments.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-4 text-gray-500 text-center"
                      colSpan={6}
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

                    const serviceName =
                      appointment.service?.name || "N/A";

                    const appointmentDate = appointment.date || appointment.scheduledAt;
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {price}
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
      </div>
    </Layout>
  );
};

export default Appointments;
