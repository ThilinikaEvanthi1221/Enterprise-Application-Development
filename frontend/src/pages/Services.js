import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import { getServices } from "../services/api";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await getServices();
        if (isMounted) setServices(data || []);
      } catch (e) {
        if (isMounted) setError("Failed to load services");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Calculate pagination
  const totalItems = services.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Services</h1>
          <p className="text-gray-600">Manage vehicle services and track progress</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr><td className="px-6 py-4" colSpan={5}>Loading...</td></tr>
                )}
                {error && !loading && (
                  <tr><td className="px-6 py-4 text-red-600" colSpan={5}>{error}</td></tr>
                )}
                {!loading && !error && services.length === 0 && (
                  <tr><td className="px-6 py-4 text-gray-500 text-center" colSpan={5}>No services found</td></tr>
                )}
                {!loading && !error && currentServices.map((service) => {
                  const id = service._id || service.id || service.serviceID;
                  
                  // Format price
                  const price = service.price ? `$${parseFloat(service.price).toFixed(2)}` : "$0.00";
                  
                  // Format created date
                  let createdDate = "N/A";
                  if (service.createdAt) {
                    try {
                      const date = new Date(service.createdAt);
                      createdDate = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      });
                    } catch (e) {
                      createdDate = String(service.createdAt).slice(0, 10);
                    }
                  }
                  
                  // Format updated date
                  let updatedDate = "N/A";
                  if (service.updatedAt) {
                    try {
                      const date = new Date(service.updatedAt);
                      updatedDate = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      });
                    } catch (e) {
                      updatedDate = String(service.updatedAt).slice(0, 10);
                    }
                  }
                  
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{service.description || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{createdDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{updatedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && !error && services.length > 0 && (
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

export default Services;

