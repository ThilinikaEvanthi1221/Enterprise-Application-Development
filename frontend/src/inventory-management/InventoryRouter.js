import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InventoryManagerLayout from './pages/InventoryManagerLayout';

// Component to check user role and redirect accordingly
const InventoryRouteGuard = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode JWT to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;
    
    // Check if user has inventory access
    const hasInventoryAccess = ['admin', 'inventory_manager', 'service_manager', 'mechanic', 'employee'].includes(userRole);
    
    if (!hasInventoryAccess) {
      return (
        <div className="access-denied-page">
          <h1>Access Denied</h1>
          <p>You don't have permission to access the inventory management system.</p>
          <button onClick={() => window.location.href = '/'}>Go Back</button>
        </div>
      );
    }

    return <InventoryManagerLayout />;
  } catch (error) {
    console.error('Error decoding token:', error);
    return <Navigate to="/login" replace />;
  }
};

const InventoryRouter = () => {
  return (
    <Routes>
      <Route path="/*" element={<InventoryRouteGuard />} />
    </Routes>
  );
};

export default InventoryRouter;