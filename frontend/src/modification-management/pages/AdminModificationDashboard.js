import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminModificationDashboard() {
  const [modifications, setModifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 🔹 Fetch all modification requests
  useEffect(() => {
    fetchModifications();
  }, []);

  const fetchModifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/modifications");
      setModifications(res.data);
    } catch (error) {
      console.error("❌ Error fetching modifications:", error);
    }
  };

  // 🔹 Open modal for status update
  const handleOpenModal = (mod) => {
    setSelected(mod);
    setStatus(mod.status || "pending");
    setNote("");
    setShowModal(true);
  };

  // 🔹 Update modification status
  const handleUpdateStatus = async (id) => {
    try {
      if (!id) {
        alert("Invalid modification ID.");
        return;
      }

      // Send both status + note to backend
      const res = await axios.put(
        `http://localhost:5000/api/modifications/${id}`,
        {
          status,
          notes: note,
        }
      );

      console.log("✅ Update response:", res.data);
      alert("✅ Status updated successfully!");

      // Refresh list + close modal
      fetchModifications();
      setShowModal(false);
    } catch (error) {
      console.error("🔥 Error updating status:", error);
      if (error.response) {
        alert(`❌ ${error.response.data.message || "Bad Request"}`);
      } else {
        alert("❌ Failed to update status. Check backend connection.");
      }
    }
  };

  // 🔹 Status badge colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in-progress":
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🛠 Manage Vehicle Modifications
        </h1>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {modifications.map((mod) => (
                <tr key={mod._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="font-semibold">{mod.fullName}</div>
                    <div className="text-xs text-gray-500">{mod.email}</div>
                  </td>
                  <td className="px-6 py-3">
                    {mod.vehicleMake} {mod.vehicleModel}
                  </td>
                  <td className="px-6 py-3">{mod.modificationType}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                        mod.status
                      )}`}
                    >
                      {mod.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {mod.startDate && mod.endDate
                      ? `${new Date(mod.startDate).toLocaleDateString()} → ${new Date(
                          mod.endDate
                        ).toLocaleDateString()}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleOpenModal(mod)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}

              {modifications.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No modification requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Modal for Updating Status */}
      {showModal && selected && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Update Modification Status
            </h3>

            <p className="text-gray-600 text-sm mb-4">
              Customer:{" "}
              <span className="font-medium">{selected.fullName}</span>
              <br />
              Vehicle: {selected.vehicleMake} {selected.vehicleModel}
            </p>

            <label className="block text-sm text-gray-700 font-medium mb-1">
              Select Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input mb-4 w-full border rounded-md px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <label className="block text-sm text-gray-700 font-medium mb-1">
              Notes:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add progress notes or comments..."
              rows="3"
              className="input mb-4 w-full border rounded-md px-3 py-2"
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selected._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminModificationDashboard;
