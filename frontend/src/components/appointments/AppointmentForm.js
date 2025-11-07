import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentStore from '../../utils/AppointmentStore';

// Hardcoded vehicle options
const vehicleOptions = [
  { id: '1', name: 'Toyota Camry (2020) - ABC123' },
  { id: '2', name: 'Honda CR-V (2019) - XYZ789' },
  { id: '3', name: 'Ford F-150 (2021) - DEF456' }
];

// Hardcoded service options
const serviceOptions = [
  { id: '1', name: 'Oil Change', price: 79.99, duration: 45 },
  { id: '2', name: 'Tire Rotation', price: 49.99, duration: 30 },
  { id: '3', name: 'Brake Service', price: 199.99, duration: 90 },
  { id: '4', name: 'Engine Diagnostic', price: 89.99, duration: 60 },
  { id: '5', name: 'AC Service', price: 129.99, duration: 60 }
];

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate all required fields
      if (!formData.vehicle || !formData.service || !formData.date || !formData.time) {
        throw new Error('Please fill in all required fields');
      }

      // Get selected vehicle and service details
      const vehicle = vehicleOptions.find(v => v.id === formData.vehicle);
      const service = serviceOptions.find(s => s.id === formData.service);
      
      // Create appointment datetime
      const dateTime = new Date(formData.date + 'T' + formData.time);

      // Get user info
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Check if time is within business hours (8 AM to 6 PM)
      const hour = dateTime.getHours();
      if (hour < 8 || hour >= 18) {
        throw new Error('Please select a time between 8 AM and 6 PM');
      }

      // Create new appointment
      const newAppointment = {
        id: Date.now().toString(), // Simple unique ID
        customerId: user.id,
        customerName: user.name,
        vehicle: vehicle,
        service: service,
        dateTime: dateTime.toISOString(),
        notes: formData.notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save appointment to local storage
      const savedAppointment = AppointmentStore.addAppointment(newAppointment);

      // Create notification for staff
      const notif = AppointmentStore.addNotification({
        id: Date.now().toString(),
        type: 'NEW_APPOINTMENT',
        title: 'New Appointment Request',
        message: `New appointment request from ${user.name} for ${service.name} on ${dateTime.toLocaleDateString()} at ${dateTime.toLocaleTimeString()}`,
        forRole: 'employee',
        appointmentId: savedAppointment.id,
        createdAt: new Date().toISOString(),
        read: false
      });

      console.log('Saved appointment:', savedAppointment);
      console.log('Created notification:', notif);

      // Show confirmation message
      setSuccess(
        `Appointment request submitted successfully!\n
        Vehicle: ${vehicle.name}\n
        Service: ${service.name}\n
        Date: ${dateTime.toLocaleDateString()}\n
        Time: ${dateTime.toLocaleTimeString()}\n
        Estimated Duration: ${service.duration} minutes\n
        Price: $${service.price.toFixed(2)}`
      );

      // Clear form
      setFormData({
        vehicle: '',
        service: '',
        date: '',
        time: '',
        notes: ''
      });

      // Do not redirect automatically during testing — stay on this page so user can see confirmation
      // (If you want to go to another page after a delay, uncomment the navigate call below.)
      // setTimeout(() => navigate('/appointments'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Please try again.');
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Vehicle</label>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select a vehicle</option>
            {vehicleOptions.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Service</label>
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select a service</option>
            {serviceOptions.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price.toFixed(2)} ({service.duration} mins)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={today}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Any special requests or additional information..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 text-white rounded ${
            loading 
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
