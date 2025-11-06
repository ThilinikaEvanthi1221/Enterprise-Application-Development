import React, { useState, useEffect } from 'react';
import inventoryApi from '../services/inventoryApi';
import './InventoryManagerDashboard.css';

const InventoryManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalParts: 0,
    lowStockParts: 0,
    outOfStockParts: 0,
    totalValue: 0,
    recentTransactions: [],
    alerts: [],
    topCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // For now, use mock data until backend is connected
      const partsResponse = { success: true, data: [] };
      const alertsResponse = { success: true, data: [] };
      const transactionsResponse = { success: true, data: [] };
      
      // Uncomment below when backend is ready
      // const [partsResponse, alertsResponse, transactionsResponse] = await Promise.all([
      //   inventoryApi.getAllParts(),
      //   inventoryApi.getReorderAlerts(),
      //   inventoryApi.getTransactionReport({ limit: 5 })
      // ]);

      if (partsResponse.success && alertsResponse.success) {
        const parts = partsResponse.data;
        const alerts = alertsResponse.data;
        
        // Calculate dashboard metrics
        const totalParts = parts.length;
        const lowStockParts = parts.filter(part => 
          part.currentStock <= part.minStockLevel && part.currentStock > 0
        ).length;
        const outOfStockParts = parts.filter(part => part.currentStock === 0).length;
        const totalValue = parts.reduce((sum, part) => 
          sum + (part.currentStock * part.unitPrice), 0
        );

        // Group parts by category
        const categoryCount = parts.reduce((acc, part) => {
          acc[part.category] = (acc[part.category] || 0) + 1;
          return acc;
        }, {});

        const topCategories = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setDashboardData({
          totalParts,
          lowStockParts,
          outOfStockParts,
          totalValue,
          recentTransactions: transactionsResponse.success ? transactionsResponse.data : [],
          alerts: alerts.filter(alert => !alert.acknowledged),
          topCategories
        });
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      const response = await inventoryApi.acknowledgeAlert(alertId);
      if (response.success) {
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAlertSeverity = (part) => {
    if (part.currentStock === 0) return 'critical';
    if (part.currentStock <= part.minStockLevel) return 'warning';
    return 'info';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading inventory dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="inventory-manager-dashboard">
      <div className="dashboard-header">
        <h1>Inventory Manager Dashboard</h1>
        <p className="dashboard-subtitle">Manage your inventory operations efficiently</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card total-parts">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>{dashboardData.totalParts}</h3>
            <p>Total Parts</p>
          </div>
        </div>

        <div className="metric-card low-stock">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <h3>{dashboardData.lowStockParts}</h3>
            <p>Low Stock</p>
          </div>
        </div>

        <div className="metric-card out-of-stock">
          <div className="metric-icon">🚫</div>
          <div className="metric-content">
            <h3>{dashboardData.outOfStockParts}</h3>
            <p>Out of Stock</p>
          </div>
        </div>

        <div className="metric-card total-value">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>{formatCurrency(dashboardData.totalValue)}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => window.location.href = '/inventory/parts/new'}>
            <span className="btn-icon">➕</span>
            Add New Part
          </button>
          <button className="action-btn secondary" onClick={() => window.location.href = '/inventory/stock-adjustment'}>
            <span className="btn-icon">📊</span>
            Adjust Stock
          </button>
          <button className="action-btn secondary" onClick={() => window.location.href = '/inventory/reports'}>
            <span className="btn-icon">📈</span>
            View Reports
          </button>
          <button className="action-btn secondary" onClick={() => window.location.href = '/inventory/users'}>
            <span className="btn-icon">👥</span>
            Manage Users
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Active Alerts */}
        <div className="dashboard-section alerts-section">
          <div className="section-header">
            <h2>Active Alerts ({dashboardData.alerts.length})</h2>
            <button className="view-all-btn" onClick={() => window.location.href = '/inventory/alerts'}>
              View All
            </button>
          </div>
          <div className="alerts-list">
            {dashboardData.alerts.length === 0 ? (
              <div className="no-alerts">
                <p>✅ No active alerts - All stock levels are good!</p>
              </div>
            ) : (
              dashboardData.alerts.slice(0, 5).map(alert => (
                <div key={alert._id} className={`alert-item ${getAlertSeverity(alert.part)}`}>
                  <div className="alert-content">
                    <div className="alert-info">
                      <h4>{alert.part.name}</h4>
                      <p>Part #: {alert.part.partNumber}</p>
                      <p>Current Stock: {alert.part.currentStock} / Min: {alert.part.minStockLevel}</p>
                    </div>
                    <div className="alert-actions">
                      <button 
                        className="acknowledge-btn"
                        onClick={() => handleAcknowledgeAlert(alert._id)}
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-section transactions-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="view-all-btn" onClick={() => window.location.href = '/inventory/transactions'}>
              View All
            </button>
          </div>
          <div className="transactions-list">
            {dashboardData.recentTransactions.length === 0 ? (
              <p className="no-data">No recent transactions</p>
            ) : (
              dashboardData.recentTransactions.map(transaction => (
                <div key={transaction._id} className="transaction-item">
                  <div className="transaction-info">
                    <h4>{transaction.part?.name || 'Unknown Part'}</h4>
                    <p>Type: {transaction.type} | Quantity: {transaction.quantity}</p>
                    <p className="transaction-date">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`transaction-type ${transaction.type.toLowerCase()}`}>
                    {transaction.type}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="dashboard-section categories-section">
          <div className="section-header">
            <h2>Top Categories</h2>
          </div>
          <div className="categories-chart">
            {dashboardData.topCategories.map(category => (
              <div key={category.category} className="category-item">
                <div className="category-name">{category.category}</div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${(category.count / dashboardData.totalParts) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="category-count">{category.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagerDashboard;