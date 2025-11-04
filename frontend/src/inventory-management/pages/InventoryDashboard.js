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
      setError(`Failed to fetch dashboard data: ${err.message || 'Unknown error'}`);
      setDashboardData(null);
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
        <div className="error">{error}</div>
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
              onClick={() => window.location.href = '/inventory/parts'}
            >
              <span className="action-icon">🔧</span>
              <span className="action-text">Manage Parts</span>
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => window.location.href = '/inventory/stock-adjustment'}
            >
              <span className="action-icon">📦</span>
              <span className="action-text">Adjust Stock</span>
            </button>
            <button 
              className="action-btn info"
              onClick={() => window.location.href = '/inventory/reports'}
            >
              <span className="action-icon">📈</span>
              <span className="action-text">View Reports</span>
            </button>
            <button 
              className="action-btn warning"
              onClick={() => window.location.href = '/inventory/settings'}
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