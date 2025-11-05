import React, { useState } from "react";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";

const ChatBot = () => {
  const chatBotQueries = [
    { queryID: "QB001", customerNo: "CUST001", queryText: "What are available time slots for next week?", responseTime: "0.5s", timeStamp: "2024-01-14 10:30 AM" },
    { queryID: "QB002", customerNo: "CUST002", queryText: "How long does engine repair take?", responseTime: "0.3s", timeStamp: "2024-01-14 02:15 PM" },
    { queryID: "QB003", customerNo: "CUST001", queryText: "What services do you offer?", responseTime: "0.4s", timeStamp: "2024-01-15 09:45 AM" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalItems = chatBotQueries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQueries = chatBotQueries.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ChatBot Queries</h1>
          <p className="text-gray-600">View customer chatbot interactions</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query Text</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Stamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentQueries.map((query) => (
                  <tr key={query.queryID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{query.queryID}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{query.customerNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md">{query.queryText}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{query.responseTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{query.timeStamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {chatBotQueries.length > 0 && (
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

export default ChatBot;

