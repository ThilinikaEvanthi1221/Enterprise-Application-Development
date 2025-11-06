import React, { useState, useEffect, useCallback } from 'react';
import inventoryApi from '../services/inventoryApi';
import '../styles/Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeReport, setActiveReport] = useState('summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    { id: 'summary', name: 'Inventory Summary', icon: '📊' },
    { id: 'lowStock', name: 'Low Stock Report', icon: '⚠️' },
    { id: 'transactions', name: 'Transaction History', icon: '📋' },
    { id: 'categoryWise', name: 'Category Analysis', icon: '📦' },
    { id: 'valueReport', name: 'Inventory Value', icon: '💰' }
  ];

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      switch (activeReport) {
        case 'summary':
          response = await inventoryApi.getInventorySummary();
          break;
        case 'lowStock':
          response = await inventoryApi.getLowStockReport();
          break;
        case 'transactions':
          response = await inventoryApi.getTransactionHistory({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
          break;
        case 'categoryWise':
          response = await inventoryApi.getCategoryAnalysis();
          break;
        case 'valueReport':
          response = await inventoryApi.getInventoryValue();
          break;
        default:
          response = await inventoryApi.getInventorySummary();
      }
      
      setReportData(response.data || response);
      setError('');
    } catch (err) {
      console.error('Report fetch error:', err);
      
      // If backend routes don't exist yet, use mock data
      if (err.response?.status === 404 || err.message?.includes('404')) {
        console.log('Using mock data - backend routes not yet implemented');
        const mockData = {
          totalParts: 0,
          lowStockParts: 0,
          outOfStockParts: 0,
          inventoryValue: 0,
          parts: [],
          transactions: [],
          categories: []
        };
        setReportData(mockData);
        setError('Backend inventory routes not yet implemented. Showing mock data.');
      } else {
        setError('Failed to fetch report data');
        setReportData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [activeReport, dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = (format) => {
    if (!reportData) return;
    
    // Simple CSV export for now
    if (format === 'csv') {
      let csvContent = '';
      
      if (activeReport === 'transactions' && reportData.transactions) {
        csvContent = 'Date,Part Number,Part Name,Type,Quantity,Performed By\n';
        reportData.transactions.forEach(transaction => {
          csvContent += `${new Date(transaction.createdAt).toLocaleDateString()},${transaction.part?.partNumber || 'N/A'},${transaction.part?.name || 'N/A'},${transaction.transactionType},${transaction.quantity},${transaction.performedBy?.name || 'System'}\n`;
        });
      } else if (activeReport === 'lowStock' && reportData.parts) {
        csvContent = 'Part Number,Name,Current Stock,Min Stock,Category,Supplier\n';
        reportData.parts.forEach(part => {
          csvContent += `${part.partNumber},${part.name},${part.currentStock},${part.minStockLevel},${part.category},${part.supplier || 'N/A'}\n`;
        });
      }
      
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const renderSummaryReport = () => (
    <div className="report-content">
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.totalParts || 0}</div>
            <div className="stat-label">Total Parts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.lowStockParts || 0}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <div className="stat-value">{reportData?.outOfStockParts || 0}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">${(reportData?.totalValue || 0).toFixed(2)}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
      </div>
      
      {reportData?.categoryBreakdown && (
        <div className="category-breakdown">
          <h3>Category Breakdown</h3>
          <div className="category-list">
            {reportData.categoryBreakdown.map((category) => (
              <div key={category._id} className="category-item">
                <div className="category-name">{category._id}</div>
                <div className="category-stats">
                  <span>Parts: {category.count}</span>
                  <span>Value: ${(category.totalValue || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLowStockReport = () => (
    <div className="report-content">
      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.parts?.map((part) => (
              <tr key={part._id}>
                <td>{part.partNumber}</td>
                <td>{part.name}</td>
                <td>{part.category}</td>
                <td className={part.currentStock === 0 ? 'out-of-stock' : 'low-stock'}>
                  {part.currentStock}
                </td>
                <td>{part.minStockLevel}</td>
                <td>
                  <span className={`status ${part.currentStock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                    {part.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </td>
                <td>{part.supplier || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!reportData?.parts || reportData.parts.length === 0) && (
          <div className="no-data">No low stock items found</div>
        )}
      </div>
    </div>
  );

  const renderTransactionReport = () => (
    <div className="report-content">
      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Part Number</th>
              <th>Part Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Performed By</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.transactions?.map((transaction) => (
              <tr key={transaction._id}>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.part?.partNumber || 'N/A'}</td>
                <td>{transaction.part?.name || 'N/A'}</td>
                <td>
                  <span className={`transaction-type ${transaction.transactionType.toLowerCase()}`}>
                    {transaction.transactionType}
                  </span>
                </td>
                <td>{transaction.quantity}</td>
                <td>{transaction.performedBy?.name || 'System'}</td>
                <td>{transaction.reason || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!reportData?.transactions || reportData.transactions.length === 0) && (
          <div className="no-data">No transactions found for the selected date range</div>
        )}
      </div>
    </div>
  );

  const renderReportContent = () => {
    if (loading) {
      return <div className="loading">Loading report data...</div>;
    }

    if (error) {
      return (
        <div className="info-banner" style={{ 
          background: '#fef3c7', 
          border: '1px solid #fbbf24', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px',
          color: '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Backend Inventory API Not Yet Implemented</h3>
              <p style={{ margin: '0 0 12px 0' }}>
                The inventory reports backend routes (e.g., <code>/api/inventory/reports/*</code>) need to be created in the backend server.
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                To fix this: Create inventory routes in <code>backend/routes/inventoryRoutes.js</code> and implement report controllers.
              </p>
              <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>
                Showing mock data with zero values until backend is ready.
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (activeReport) {
      case 'summary':
        return renderSummaryReport();
      case 'lowStock':
        return renderLowStockReport();
      case 'transactions':
        return renderTransactionReport();
      default:
        return <div className="no-data">Report type not implemented yet</div>;
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>📊 Inventory Reports</h1>
        <div className="header-actions">
          <button 
            className="export-btn"
            onClick={() => exportReport('csv')}
            disabled={!reportData || loading}
          >
            📥 Export CSV
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchReportData}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="reports-container">
        <div className="reports-sidebar">
          <h3>Report Types</h3>
          <div className="report-types">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                className={`report-type-btn ${activeReport === report.id ? 'active' : ''}`}
                onClick={() => setActiveReport(report.id)}
              >
                <span className="report-icon">{report.icon}</span>
                <span className="report-name">{report.name}</span>
              </button>
            ))}
          </div>

          {(activeReport === 'transactions') && (
            <div className="date-filters">
              <h4>Date Range</h4>
              <div className="date-inputs">
                <label>
                  From:
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  />
                </label>
                <label>
                  To:
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="reports-main">
          <div className="report-header">
            <h2>
              {reportTypes.find(r => r.id === activeReport)?.icon} {' '}
              {reportTypes.find(r => r.id === activeReport)?.name}
            </h2>
            {activeReport === 'transactions' && (
              <div className="date-range-display">
                {dateRange.startDate} to {dateRange.endDate}
              </div>
            )}
          </div>

          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;