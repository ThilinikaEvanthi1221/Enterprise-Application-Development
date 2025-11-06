import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesResponse, servicesResponse] = await Promise.all([
          axios.get('/api/vehicles/my'),
          axios.get('/api/services')
        ]);
        setVehicles(vehiclesResponse.data);
        setServices(servicesResponse.data);
      } catch (err) {
        setError('Failed to load form data');
        console.error('Error fetching form data:', err);
      }
    };

    fetchData();
  }, []);

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

    // Combine date and time
    const dateTime = new Date(formData.date + 'T' + formData.time);

    try {
      const response = await axios.post('/api/appointments', {
        vehicle: formData.vehicle,
        service: formData.service,
        date: dateTime.toISOString(),
        notes: formData.notes
      });

      setSuccess('Appointment booked successfully!');
      setFormData({
        vehicle: '',
        service: '',
        date: '',
        time: '',
        notes: ''
      });

      // Redirect to appointments list after 2 seconds
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to book appointment');
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
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.make} {vehicle.model} ({vehicle.year})
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
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name} - ${service.price}
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
