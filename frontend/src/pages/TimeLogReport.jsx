import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Layout from '../components/Layout';
import './TimeLogReport.css';

export default function TimeLogReport() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    projectType: '',
    status: '',
    employeeid: '',
    searchTerm: '',
  });

  const [timeLogs, setTimeLogs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/time-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const cleaned = data.data.filter(
          (log) =>
            log.hoursWorked &&
            !isNaN(Number(log.hoursWorked)) &&
            Number(log.hoursWorked) > 0 &&
            log.status &&
            log.status.trim() !== ''
        );
        setTimeLogs(cleaned);
      } else {
        showNotification('Failed to load time logs', 'error');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      showNotification('Server error while loading logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'not-started': { className: 'badge-outline', label: 'Not Started' },
      'in-progress': { className: 'badge-primary', label: 'In Progress' },
      'on-hold': { className: 'badge-secondary', label: 'On Hold' },
      'completed': { className: 'badge-success', label: 'Completed' },
      'delayed': { className: 'badge-danger', label: 'Delayed' },
    };
    const config = statusConfig[status] || { className: 'badge-outline', label: status };
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const filteredLogs = timeLogs.filter((log) => {
    const logDate = new Date(log.date).toISOString().split('T')[0];
    if (filters.startDate && logDate < filters.startDate) return false;
    if (filters.endDate && logDate > filters.endDate) return false;
    if (filters.projectType && filters.projectType !== 'all' && log.projectType !== filters.projectType) return false;
    if (filters.status && filters.status !== 'all' && log.status !== filters.status) return false;
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        (log.projectId && log.projectId.toLowerCase().includes(searchLower)) ||
        (log.description && log.description.toLowerCase().includes(searchLower)) ||
        (log.employeeid && log.employeeid.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const totalHours = filteredLogs.reduce((sum, log) => sum + Number(log.hoursWorked || 0), 0);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Time Log Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Total Entries: ${filteredLogs.length}`, 14, 34);
      doc.text(`Total Hours: ${Number(totalHours || 0).toFixed(2)} hours`, 14, 40);

      let startY = 48;
      if (filters.startDate || filters.endDate || filters.projectType || filters.status || filters.employeeid) {
        doc.setFontSize(9);
        doc.text('Filters Applied:', 14, 46);
        if (filters.startDate) {
          doc.text(`Start Date: ${filters.startDate}`, 14, startY);
          startY += 5;
        }
        if (filters.endDate) {
          doc.text(`End Date: ${filters.endDate}`, 14, startY);
          startY += 5;
        }
        if (filters.projectType && filters.projectType !== 'all') {
          doc.text(`Type: ${filters.projectType}`, 14, startY);
          startY += 5;
        }
        if (filters.status && filters.status !== 'all') {
          doc.text(`Status: ${filters.status}`, 14, startY);
          startY += 5;
        }
        if (filters.employeeid && filters.employeeid !== 'all') {
          doc.text(`Employee: ${filters.employeeid}`, 14, startY);
          startY += 5;
        }
        startY += 5;
      }

      const tableData = filteredLogs.map((log) => [
        new Date(log.date).toLocaleDateString(),
        log.projectType === 'service' ? 'Service' : 'Project',
        log.projectId || '',
        log.employeeid || '',
        `${Number(log.hoursWorked).toFixed(1)}h`,
        log.status,
        log.description || '',
      ]);

      autoTable(doc, {
        head: [['Date', 'Type', 'ID', 'Employee', 'Hours', 'Status', 'Description']],
        body: tableData,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 0, 0] },
      });

      const fileName = `time-log-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showNotification('PDF report downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF Error:', error);
      showNotification('Failed to generate PDF', 'error');
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      projectType: '',
      status: '',
      employeeid: '',
      searchTerm: '',
    });
  };

  return (
    <Layout>
      <div className="time-log-report-card">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="card-header">
          <div className="header-with-button">
            <div>
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Time Log Reports
              </h2>
              <p className="card-description">View and export employee time log records</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={generatePDF}
              disabled={filteredLogs.length === 0 || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {loading ? 'Loading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="card-content">
          {/* Filters Section */}
          <div className="filters-section">
            <div className="filters-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <h3>Filters</h3>
            </div>

            <div className="filters-grid">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Project Type</label>
                <select
                  value={filters.projectType}
                  onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="service">Service</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>

              <div className="form-group search-input-wrapper">
                <label>Search</label>
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by ID, Employee, Description..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                />
              </div>
            </div>

            <div className="filters-footer">
              <div className="filter-summary">
                Showing <strong>{filteredLogs.length}</strong> of <strong>{timeLogs.length}</strong> entries
                | Total Hours: <strong>{totalHours.toFixed(2)}h</strong>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Project/Service ID</th>
                  <th>Employee ID</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Loading time logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No time logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={log._id || index}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>{log.projectType === 'service' ? 'Service' : 'Project'}</td>
                      <td>{log.projectId || '-'}</td>
                      <td>{log.employeeid || '-'}</td>
                      <td>{Number(log.hoursWorked).toFixed(1)}h</td>
                      <td>{getStatusBadge(log.status)}</td>
                      <td className="description-cell">{log.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
