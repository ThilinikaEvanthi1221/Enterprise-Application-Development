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
    let isMounted = true;
    (async () => {
      try {
        const { data } = await getAppointments();
        if (isMounted) setAppointments(data || []);
      } catch (e) {
        if (isMounted) setError("Failed to load appointments");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const statusColors = {
    scheduled: { bg: "bg-blue-100", text: "text-blue-800" },
    completed: { bg: "bg-green-100", text: "text-green-800" },
    cancelled: { bg: "bg-red-100", text: "text-red-800" },
    // Fallback for capitalized versions
    Scheduled: { bg: "bg-blue-100", text: "text-blue-800" },
    Completed: { bg: "bg-green-100", text: "text-green-800" },
    Cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };

  // Calculate pagination
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointments</h1>
          <p className="text-gray-600">Manage customer appointments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr><td className="px-6 py-4" colSpan={6}>Loading...</td></tr>
                )}
                {error && !loading && (
                  <tr><td className="px-6 py-4 text-red-600" colSpan={6}>{error}</td></tr>
                )}
                {!loading && !error && appointments.length === 0 && (
                  <tr><td className="px-6 py-4 text-gray-500 text-center" colSpan={6}>No appointments found</td></tr>
                )}
                {!loading && !error && currentAppointments.map((apt) => {
                  const id = apt._id || apt.id || apt.appointmentID;
                  const status = (apt.status || "scheduled").toLowerCase();
                  const statusStyle = statusColors[status] || statusColors["scheduled"];
                  
                  // Get customer name from populated user object
                  const customerName = apt.user?.name || apt.customerName || apt.customer || "N/A";
                  
                  // Get vehicle information from populated vehicle object
                  const vehiclePlate = apt.vehicle?.plateNumber || apt.vehicleId || apt.vehicleID || "N/A";
                  const vehicleInfo = apt.vehicle 
                    ? `${apt.vehicle.make || ""} ${apt.vehicle.model || ""}`.trim() || "N/A"
                    : "N/A";
                  
                  // Get service name from populated service object
                  const serviceName = apt.service?.name || apt.serviceName || "N/A";
                  
                  // Format appointment date
                  const appointmentDate = apt.scheduledAt || apt.appointmentDate;
                  let formattedDate = "N/A";
                  if (appointmentDate) {
                    try {
                      const date = new Date(appointmentDate);
                      formattedDate = date.toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });
                    } catch (e) {
                      formattedDate = String(appointmentDate);
                    }
                  }
                  
                  // Capitalize status for display
                  const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
                  
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{vehiclePlate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{vehicleInfo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{serviceName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formattedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusDisplay}
                        </span>
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

