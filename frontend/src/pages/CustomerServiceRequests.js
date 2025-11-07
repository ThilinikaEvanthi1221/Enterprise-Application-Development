import React, { useState, useEffect } from "react";
import { getMyVehicles } from "../services/api";
import AppointmentStore from "../utils/AppointmentStore";

const CustomerServiceRequests = () => {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);

  const [formData, setFormData] = useState({
    serviceType: "Oil Change",
    name: "",
    description: "",
    vehicleId: "",
    laborHours: 1,
    partsRequired: [],
    customerNotes: "",
    scheduledDate: "",
    timeSlot: "",
    appointmentNotes: "",
  });

  const serviceTypes = [
    "Oil Change",
    "Tire Replacement",
    "Brake Service",
    "Engine Repair",
    "Transmission Service",
    "AC Service",
    "Battery Replacement",
    "General Inspection",
  ];

  // Available time slots
  const timeSlots = [
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
  ];

  useEffect(() => {
    fetchMyServices();
    fetchMyVehicles();
  }, []);

  const fetchMyServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/services/my-services",
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

  const fetchMyVehicles = async () => {
    try {
      const response = await getMyVehicles();
      console.log("My vehicles from API:", response.data);
      setVehicles(
        Array.isArray(response.data.vehicles) ? response.data.vehicles : []
      );
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  const checkAvailableSlots = async (date) => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    setCheckingSlots(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/appointments/available-slots?date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data.slots || []);
      } else {
        console.error("Error checking slots:", data.msg);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error checking available slots:", error);
      setAvailableSlots([]);
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, scheduledDate: date, timeSlot: "" });
    checkAvailableSlots(date);
  };

  const handleRequestService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const response = await fetch(
        "http://localhost:5000/api/services/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const appointmentDate = new Date(data.appointment.date);
        
        // Create notification for staff using AppointmentStore
        AppointmentStore.addNotification({
          id: Date.now().toString(),
          type: 'NEW_APPOINTMENT',
          title: 'New Appointment Request',
          message: `New appointment request from ${user.name} for ${formData.serviceType} on ${appointmentDate.toLocaleDateString()} at ${formData.timeSlot}`,
          forRole: 'employee',
          appointmentId: data.appointment._id,
          createdAt: new Date().toISOString(),
          read: false
        });
        
        const message = `✓ Service request submitted successfully!\n\nYour appointment is confirmed for:\n${appointmentDate.toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )} at ${formData.timeSlot}\n\nService: ${data.service.name}\nVehicle: ${
          data.service.vehicle.make
        } ${data.service.vehicle.model}\n\nWe'll see you then!`;

        alert(message);
        setShowRequestModal(false);
        setFormData({
          serviceType: "Oil Change",
          name: "",
          description: "",
          vehicleId: "",
          laborHours: 1,
          partsRequired: [],
          customerNotes: "",
          scheduledDate: "",
          timeSlot: "",
          appointmentNotes: "",
        });
        fetchMyServices();
      } else {
        alert(data.msg || "Failed to submit service request");
      }
    } catch (error) {
      console.error("Error requesting service:", error);
      alert("Error submitting request");
    }
  };

  const handleCancelService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to cancel this service?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/services/${serviceId}/cancel`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Service cancelled successfully");
        fetchMyServices();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to cancel service");
      }
    } catch (error) {
      console.error("Error cancelling service:", error);
      alert("Error cancelling service");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      requested: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      ongoing: "bg-purple-100 text-purple-800",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📅</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Book an Appointment
              </h1>
              <p className="text-gray-600 mt-1">
                Schedule your vehicle service appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form - Always Visible */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Service Appointment Form
            </h2>
            <p className="text-blue-100 mt-1 text-sm">
              Select your preferred time slot and service details
            </p>
          </div>

          <form onSubmit={handleRequestService} className="p-6 space-y-6">
            {/* STEP 1: Appointment Scheduling - FIRST */}
            <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Your Appointment Slot
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-2 items-center justify-between">
                    <span>Time Slot *</span>
                    {checkingSlots && (
                      <span className="text-xs text-blue-600 animate-pulse">
                        Checking availability...
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) =>
                      setFormData({ ...formData, timeSlot: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!formData.scheduledDate || checkingSlots}
                  >
                    <option value="">
                      {!formData.scheduledDate
                        ? "Select a date first"
                        : checkingSlots
                        ? "Checking slots..."
                        : "Select a time slot"}
                    </option>
                    {availableSlots.map((slotInfo) => (
                      <option
                        key={slotInfo.slot}
                        value={slotInfo.slot}
                        disabled={!slotInfo.available}
                        className={slotInfo.available ? "" : "text-gray-400"}
                      >
                        {slotInfo.slot} {slotInfo.available ? "✓" : "✗ Booked"}
                      </option>
                    ))}
                  </select>
                  {formData.scheduledDate && availableSlots.length > 0 && (
                    <p className="mt-2 text-xs text-gray-600">
                      {availableSlots.filter((s) => s.available).length} of{" "}
                      {availableSlots.length} slots available
                    </p>
                  )}
                </div>
              </div>

              {formData.scheduledDate && formData.timeSlot && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <span className="text-xl">✓</span>
                    <span>
                      <strong>Slot confirmed:</strong>{" "}
                      {new Date(formData.scheduledDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}{" "}
                      at {formData.timeSlot}
                    </span>
                  </p>
                </div>
              )}

              {/* Slot Availability Visual Grid */}
              {formData.scheduledDate && availableSlots.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Slot Availability Overview
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slotInfo) => (
                      <button
                        key={slotInfo.slot}
                        type="button"
                        onClick={() => {
                          if (slotInfo.available) {
                            setFormData({
                              ...formData,
                              timeSlot: slotInfo.slot,
                            });
                          }
                        }}
                        disabled={!slotInfo.available}
                        className={`p-2 rounded text-xs font-medium transition-all ${
                          formData.timeSlot === slotInfo.slot
                            ? "bg-green-600 text-white ring-2 ring-green-400"
                            : slotInfo.available
                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{slotInfo.slot.split(" - ")[0]}</span>
                          <span className="text-[10px]">
                            {slotInfo.available ? "✓ Available" : "✗ Booked"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                      <span className="text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                      <span className="text-gray-600">Selected</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Service Details - SECOND */}
            <div className="bg-gray-50 border-2 border-gray-200 p-5 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Service Details
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Regular Oil Change"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle *
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.make} {vehicle.model} {vehicle.year} -{" "}
                      {vehicle.plateNumber}
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    You need to add a vehicle first
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the issue or service needed..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Labor Hours
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.laborHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      laborHours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.customerNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerNotes: e.target.value,
                    })
                  }
                  placeholder="Any special requirements or notes..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Instructions (Optional)
                </label>
                <textarea
                  value={formData.appointmentNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentNotes: e.target.value,
                    })
                  }
                  placeholder="Any specific instructions for your appointment (e.g., 'Please call when you arrive')..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <span className="text-xl">✓</span>
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceRequests;
