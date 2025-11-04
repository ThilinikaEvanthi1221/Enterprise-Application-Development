import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InventoryNavigation from '../components/InventoryNavigation';
import InventoryDashboard from './InventoryDashboard';
import PartsManagement from './PartsManagement';
import StockAdjustment from './StockAdjustment';
import Reports from './Reports';
import Settings from './Settings';
import './InventoryManagerLayout.css';

// Placeholder components for routes that will be implemented later
const PlaceholderComponent = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>This feature will be implemented soon!</p>
    <button onClick={() => window.history.back()}>Go Back</button>
  </div>
);

const InventoryManagerLayout = () => {
  const [userRole, setUserRole] = useState('inventory_manager');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Get user info from localStorage or API
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT to get user info (basic implementation)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        setUserRole(payload.role || 'inventory_manager');
      } catch (error) {
        console.error('Error decoding token:', error);
        // Redirect to login if token is invalid
        window.location.href = '/login';
      }
    } else {
      // Redirect to login if no token
      window.location.href = '/login';
    }
    setLoading(false);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner"></div>
        <p>Loading inventory system...</p>
      </div>
    );
  }

  // Check if user has inventory access
  const hasInventoryAccess = ['admin', 'inventory_manager', 'service_manager', 'mechanic', 'employee'].includes(userRole);
  
  if (!hasInventoryAccess) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access the inventory management system.</p>
          <button onClick={() => window.location.href = '/'} className="back-btn">
            Go Back to Main Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-manager-layout">
      <InventoryNavigation 
        userRole={userRole} 
        onToggle={handleSidebarToggle}
      />
      
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-header">
          <div className="breadcrumb">
            <span className="breadcrumb-home">🏠</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Inventory Management</span>
          </div>
          
          <div className="user-info-header">
            <div className="user-welcome">
              Welcome, <strong>{user?.name || 'Inventory Manager'}</strong>
            </div>
            <div className="current-time">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="page-content">
          <Routes>
            {/* Dashboard - Default route */}
            <Route path="/" element={<Navigate to="/inventory/dashboard" replace />} />
            <Route path="/dashboard" element={<InventoryDashboard />} />
            
            {/* Parts Management */}
            <Route path="/parts" element={<PartsManagement />} />
            <Route path="/parts/new" element={<PartsManagement />} />
            <Route path="/parts/:id/edit" element={<PartsManagement />} />
            
            {/* Stock Management */}
            <Route path="/stock-adjustment" element={<StockAdjustment />} />
            
            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
            
            {/* Settings - Admin/Manager only */}
            {(['admin', 'inventory_manager'].includes(userRole)) && (
              <Route path="/settings" element={<Settings />} />
            )}
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/inventory/dashboard" replace />} />
          </Routes>
        </div>
      </div>

      {/* Mobile overlay for sidebar */}
      <div 
        className={`mobile-overlay ${sidebarCollapsed ? '' : 'active'}`}
        onClick={() => setSidebarCollapsed(true)}
      ></div>
    </div>
  );
};

export default InventoryManagerLayout;