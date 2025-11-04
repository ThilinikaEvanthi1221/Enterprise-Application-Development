import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'inventory_manager': return '📦';
      case 'service_manager': return '🔧';
      case 'mechanic': return '🛠️';
      case 'employee': return '👤';
      case 'customer': return '🏠';
      default: return '👤';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'inventory_manager': return 'Inventory Manager';
      case 'service_manager': return 'Service Manager';
      case 'mechanic': return 'Mechanic';
      case 'employee': return 'Employee';
      case 'customer': return 'Customer';
      default: return role;
    }
  };

  const hasInventoryAccess = (role) => {
    return ['admin', 'inventory_manager', 'service_manager', 'mechanic', 'employee'].includes(role);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Enterprise Application Dashboard</h1>
          <div className="user-info">
            <div className="user-avatar">
              {getRoleIcon(user.role)}
            </div>
            <div className="user-details">
              <span className="user-name">Welcome, {user.name}</span>
              <span className="user-role">{getRoleDisplay(user.role)}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-sections">
          
          {/* Inventory Management Section - Only for authorized roles */}
          {hasInventoryAccess(user.role) && (
            <div className="dashboard-card inventory-card">
              <div className="card-header">
                <div className="card-icon">📦</div>
                <h3>Inventory Management</h3>
              </div>
              <p>
                Manage parts, stock levels, transactions, and inventory operations.
              </p>
              <div className="card-features">
                <div className="feature-item">✅ Parts Management</div>
                <div className="feature-item">✅ Stock Control</div>
                <div className="feature-item">✅ Reorder Alerts</div>
                <div className="feature-item">✅ Reports & Analytics</div>
                {['admin', 'inventory_manager'].includes(user.role) && (
                  <div className="feature-item">✅ User Management</div>
                )}
              </div>
              <button 
                className="card-btn primary"
                onClick={() => navigate('/inventory/dashboard')}
              >
                Access Inventory System
              </button>
            </div>
          )}

          {/* Customer Service Section */}
          <div className="dashboard-card service-card">
            <div className="card-header">
              <div className="card-icon">🛠️</div>
              <h3>Customer Service</h3>
            </div>
            <p>
              Handle customer requests, service appointments, and support tickets.
            </p>
            <div className="card-features">
              <div className="feature-item">📞 Customer Support</div>
              <div className="feature-item">📅 Service Scheduling</div>
              <div className="feature-item">📋 Service History</div>
              <div className="feature-item">📊 Customer Reports</div>
            </div>
            <button className="card-btn secondary" disabled>
              Coming Soon
            </button>
          </div>

          {/* Sales & Orders Section */}
          <div className="dashboard-card sales-card">
            <div className="card-header">
              <div className="card-icon">💰</div>
              <h3>Sales & Orders</h3>
            </div>
            <p>
              Manage sales orders, customer accounts, and business analytics.
            </p>
            <div className="card-features">
              <div className="feature-item">🛒 Order Management</div>
              <div className="feature-item">💳 Payment Processing</div>
              <div className="feature-item">📈 Sales Analytics</div>
              <div className="feature-item">👥 Customer Management</div>
            </div>
            <button className="card-btn secondary" disabled>
              Coming Soon
            </button>
          </div>

          {/* Admin Panel - Only for Admins */}
          {user.role === 'admin' && (
            <div className="dashboard-card admin-card">
              <div className="card-header">
                <div className="card-icon">⚙️</div>
                <h3>System Administration</h3>
              </div>
              <p>
                System configuration, user management, and administrative tools.
              </p>
              <div className="card-features">
                <div className="feature-item">👥 User Management</div>
                <div className="feature-item">🔐 Security Settings</div>
                <div className="feature-item">📊 System Monitoring</div>
                <div className="feature-item">🔧 Configuration</div>
              </div>
              <button className="card-btn secondary" disabled>
                Coming Soon
              </button>
            </div>
          )}

        </div>

        {/* Quick Stats Section */}
        <div className="quick-stats">
          <h3>Quick Information</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <div className="stat-label">Account Status</div>
                <div className="stat-value">Active</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🕒</div>
              <div className="stat-info">
                <div className="stat-label">Last Login</div>
                <div className="stat-value">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🔑</div>
              <div className="stat-info">
                <div className="stat-label">Access Level</div>
                <div className="stat-value">{getRoleDisplay(user.role)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;