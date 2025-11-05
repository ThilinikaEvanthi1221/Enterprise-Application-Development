import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../services/socket';

const ProgressCard = ({ progress }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Parts Ordered': 'bg-purple-100 text-purple-800',
      'Under Repair': 'bg-orange-100 text-orange-800',
      'Quality Check': 'bg-indigo-100 text-indigo-800',
      'Ready for Pickup': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            {progress.serviceId?.name || 'Service'}
          </h3>
          <p className="text-sm text-gray-600">
            {progress.vehicleId?.make} {progress.vehicleId?.model}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(progress.status)}`}>
          {progress.status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">{progress.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {progress.notes && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">{progress.notes}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date(progress.updatedAt).toLocaleString()}
      </div>
    </div>
  );
};

const ProgressDashboard = () => {
  const [progressLogs, setProgressLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEmployee = localStorage.getItem('userRole') === 'employee';

  useEffect(() => {
    fetchProgressLogs();

    // Listen for real-time updates
    socket.on('progressUpdate', (update) => {
      setProgressLogs(prev => 
        prev.map(log => 
          log._id === update.progressLog._id ? update.progressLog : log
        )
      );
    });

    return () => {
      socket.off('progressUpdate');
    };
  }, []);

  const fetchProgressLogs = async () => {
    try {
      const endpoint = isEmployee ? '/api/progress/employee' : '/api/progress/customer';
      const response = await axios.get(endpoint);
      setProgressLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress logs:', error);
      setError('Failed to load progress data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        {isEmployee ? 'Service Progress Overview' : 'Your Service Progress'}
      </h2>
      
      {progressLogs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No active services found
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {progressLogs.map(progress => (
            <ProgressCard key={progress._id} progress={progress} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
