import React, { useState, useEffect } from "react";
import axios from "axios";

function ModificationUpdatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modification, setModification] = useState(null);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // ✅ Fetch modification details by registration number
  const fetchModification = async (regNo) => {
    try {
      setError("");
      if (!regNo) return;

      const res = await axios.get(
        `http://localhost:5000/api/modifications/search/${regNo}`
      );

      if (res.data) setModification(res.data);
      else setError("No modification found for this registration number.");
    } catch (err) {
      console.error("Error fetching modification:", err);
      setError("No modification found or server error.");
      setModification(null);
    }
  };

  // ✅ Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    fetchModification(searchTerm);
    setAutoRefresh(true); // Start auto-refresh after first successful search
  };

  // ✅ Auto-refresh modification every 10 seconds
  useEffect(() => {
    if (!autoRefresh || !searchTerm) return;
    const interval = setInterval(() => {
      fetchModification(searchTerm);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          🔧 Track Your Vehicle Modification Progress
        </h2>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-6"
        >
          <input
            type="text"
            placeholder="Enter your registration number (e.g. WP-CAB-5533)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.trim())}
            className="input flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Result Section */}
        {modification && (
          <div className="space-y-6">
            {/* Vehicle Information */}
            <div className="border p-4 rounded-md bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Vehicle Information
              </h3>
              <p>
                <span className="font-semibold">Owner:</span>{" "}
                {modification.fullName}
              </p>
              <p>
                <span className="font-semibold">Vehicle:</span>{" "}
                {modification.vehicleMake} {modification.vehicleModel}
              </p>
              <p>
                <span className="font-semibold">Registration:</span>{" "}
                {modification.registrationNo}
              </p>
              <p>
                <span className="font-semibold">Modification Type:</span>{" "}
                {modification.modificationType}
              </p>
              <p>
                <span className="font-semibold">Date Range:</span>{" "}
                {modification.startDate
                  ? new Date(modification.startDate).toLocaleDateString()
                  : "-"}{" "}
                -{" "}
                {modification.endDate
                  ? new Date(modification.endDate).toLocaleDateString()
                  : "-"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-md ${
                    modification.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : modification.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {modification.status?.toUpperCase()}
                </span>
              </p>
              {modification.notes && (
                <p className="mt-2 text-gray-700">
                  <span className="font-semibold">Admin Notes:</span>{" "}
                  {modification.notes}
                </p>
              )}
            </div>

            {/* Updates Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Modification Progress
              </h3>
              {modification.updates && modification.updates.length > 0 ? (
                <ul className="relative border-l border-blue-300 pl-4">
                  {modification.updates.map((update, index) => (
                    <li key={index} className="mb-6 ml-4">
                      <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.5 border border-white"></div>
                      <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                        <p className="text-blue-700 font-semibold">
                          {update.stage}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {update.notes}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(update.date).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">
                  No updates have been added yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModificationUpdatesPage;
