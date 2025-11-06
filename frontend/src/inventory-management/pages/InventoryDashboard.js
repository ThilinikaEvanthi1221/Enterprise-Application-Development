import React, { useState, useEffect } from 'react';
import inventoryApi from '../services/inventoryApi';
import '../styles/InventoryDashboard.css';

const InventoryDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await inventoryApi.getDashboardData();
      console.log('Dashboard API response:', response);
      
      // Check if response has the expected structure
      if (response && response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Dashboard API error:', err);
      
      // If backend routes don't exist yet, use mock data
      if (err.response?.status === 404 || err.message?.includes('404')) {
        console.log('Using mock data - backend routes not yet implemented');
        setDashboardData({
          summary: {
            totalParts: 0,
            lowStockParts: 0,
            outOfStockParts: 0,
            inventoryValue: 0
          },
          recentTransactions: [],
          stockByCategory: []
        });
        setError('Backend inventory routes not yet implemented. Showing mock data.');
      } else {
        setError(`Failed to fetch dashboard data: ${err.message || 'Unknown error'}`);
        setDashboardData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inventory-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-dashboard">
        <div className="dashboard-header">
          <h1>Inventory Dashboard</h1>
        </div>
        <div className="info-banner" style={{ 
          background: '#fef3c7', 
          border: '1px solid #fbbf24', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0',
          color: '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Backend Inventory API Not Yet Implemented</h3>
              <p style={{ margin: '0 0 12px 0' }}>
                The inventory management backend routes (e.g., <code>/api/inventory/*</code>) need to be created in the backend server.
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                To fix this: Create inventory routes in <code>backend/routes/inventoryRoutes.js</code> and add them to <code>backend/server.js</code>
              </p>
            </div>
          </div>
        </div>
        {dashboardData && (
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h3>Total Parts</h3>
                <p className="card-number">{dashboardData.summary?.totalParts || 0}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
            <div className="summary-card low-stock">
              <div className="card-icon">⚠️</div>
              <div className="card-content">
                <h3>Low Stock</h3>
                <p className="card-number">{dashboardData.summary?.lowStockParts || 0}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
            <div className="summary-card out-of-stock">
              <div className="card-icon">🚫</div>
              <div className="card-content">
                <h3>Out of Stock</h3>
                <p className="card-number">{dashboardData.summary?.outOfStockParts || 0}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
            <div className="summary-card inventory-value">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Inventory Value</h3>
                <p className="card-number">${(dashboardData.summary?.inventoryValue || 0).toFixed(2)}</p>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>(Mock Data)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const { summary, recentTransactions, stockByCategory } = dashboardData || {};

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Inventory Dashboard</h1>
        <button onClick={fetchDashboardData} className="refresh-btn">
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Parts</h3>
            <p className="card-number">{summary?.totalParts || 0}</p>
          </div>
        </div>
        
        <div className="summary-card low-stock">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Low Stock</h3>
            <p className="card-number">{summary?.lowStockParts || 0}</p>
          </div>
        </div>
        
        <div className="summary-card out-of-stock">
          <div className="card-icon">🚫</div>
          <div className="card-content">
            <h3>Out of Stock</h3>
            <p className="card-number">{summary?.outOfStockParts || 0}</p>
          </div>
        </div>
        
        <div className="summary-card inventory-value">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Inventory Value</h3>
            <p className="card-number">${(summary?.inventoryValue || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-btn primary"
              onClick={() => window.location.href = '/employee/parts'}
            >
              <span className="action-icon">🔧</span>
              <span className="action-text">Manage Parts</span>
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => window.location.href = '/employee/stock-adjustment'}
            >
              <span className="action-icon">📦</span>
              <span className="action-text">Adjust Stock</span>
            </button>
            <button 
              className="action-btn info"
              onClick={() => window.location.href = '/employee/reports'}
            >
              <span className="action-icon">📈</span>
              <span className="action-text">View Reports</span>
            </button>
            <button 
              className="action-btn warning"
              onClick={() => window.location.href = '/employee/settings'}
            >
              <span className="action-icon">⚙️</span>
              <span className="action-text">Settings</span>
            </button>
          </div>
        </div>

        {/* Stock by Category */}
        <div className="dashboard-section">
          <h2>Stock by Category</h2>
          <div className="category-grid">
            {stockByCategory && stockByCategory.length > 0 ? (
              stockByCategory.map((category) => (
                <div key={category._id} className="category-card">
                  <h3>{category._id}</h3>
                  <div className="category-stats">
                    <div className="stat">
                      <span className="stat-label">Total Parts:</span>
                      <span className="stat-value">{category.totalParts}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Value:</span>
                      <span className="stat-value">
                        ${category.totalValue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Low Stock:</span>
                      <span className={`stat-value ${category.lowStockCount > 0 ? 'warning' : ''}`}>
                        {category.lowStockCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No category data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;