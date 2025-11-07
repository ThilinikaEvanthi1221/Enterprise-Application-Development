import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

function ModificationCalendar() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fetch modification appointments from backend
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/modifications");
      const formatted = res.data.map((mod) => ({
        id: mod._id,
        title: `${mod.fullName} - ${mod.modificationType}`,
        start: mod.startDate,
        end: mod.endDate,
        backgroundColor:
          mod.status === "Confirmed"
            ? "#3B82F6" // Blue
            : mod.status === "Rejected"
            ? "#EF4444" // Red
            : mod.status === "In Progress"
            ? "#F59E0B" // Amber
            : "#9CA3AF", // Gray for Pending
        borderColor: "#2563EB",
        extendedProps: {
          ...mod,
        },
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("Error fetching modification appointments:", err);
    }
  };

  const handleEventClick = (info) => {
    setSelected(info.event.extendedProps);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/modifications/${selected._id}`,
        { status: newStatus }
      );
      alert(`Modification ${newStatus.toLowerCase()} successfully!`);
      setSelected(null);
      fetchAppointments();
    } catch (err) {
      console.error("Error updating modification status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-[#1e3a8a] mb-6 text-center">
          📅 Modification Appointments Calendar
        </h1>

        <div className="custom-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={handleEventClick}
            height="75vh"
            eventTextColor="#ffffff"
            themeSystem="standard"
            // Custom styling
            contentHeight="auto"
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              day: 'Day'
            }}
          />
          
          {/* Custom CSS for calendar */}
          <style>
            {`
              .fc {
                background: white;
                border-radius: 0.5rem;
                padding: 1rem;
                font-family: inherit;
              }
              .fc-toolbar-title {
                color: #1e3a8a !important;
                font-size: 1.25rem !important;
                font-weight: 600;
              }
              .fc-button-primary {
                background-color: #1e3a8a !important;
                border-color: #1e3a8a !important;
              }
              .fc-button-primary:hover {
                background-color: #1e40af !important;
                border-color: #1e40af !important;
              }
              .fc-button-active {
                background-color: #2563eb !important;
                border-color: #2563eb !important;
              }
              .fc-daygrid-day {
                background: #f8fafc;
              }
              .fc-day-today {
                background-color: #dbeafe !important;
              }
              .fc-event {
                border-radius: 4px;
                border: none;
              }
              .fc-header-toolbar {
                margin-bottom: 1.5rem !important;
              }
              .fc th {
                padding: 0.75rem 0;
                font-weight: 600;
                color: #1e3a8a;
              }
            `}
          </style>
        </div>

        {/* Modal for Viewing Appointment Details */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Appointment Details
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Customer:</span>{" "}
                  {selected.fullName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {selected.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {selected.phone}
                </p>
                <p>
                  <span className="font-medium">Vehicle:</span>{" "}
                  {selected.vehicleMake} {selected.vehicleModel}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {selected.modificationType}
                </p>
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {new Date(selected.startDate).toLocaleDateString()} →{" "}
                  {new Date(selected.endDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`${
                      selected.status === "Confirmed"
                        ? "text-blue-600"
                        : selected.status === "Rejected"
                        ? "text-red-600"
                        : selected.status === "In Progress"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    } font-semibold`}
                  >
                    {selected.status || "Pending"}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange("Confirmed")}
                    className="px-4 py-2 bg-[#1e3a8a] text-white rounded-md hover:bg-[#1e40af]"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange("Rejected")}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModificationCalendar;
