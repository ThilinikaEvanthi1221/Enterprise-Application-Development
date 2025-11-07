import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TimeLogForm.css';

export default function TimeLogForm() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    projectType: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    description: '',
    status: '',
    employeeid: '',
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    todayHours: 0,
    weekHours: 0,
    activeTasks: 0,
  });

  useEffect(() => {
    // Get user info from token
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
      // Auto-fill employee ID if available
      if (userData.email || userData.id) {
        setFormData(prev => ({ 
          ...prev, 
          employeeid: userData.id || userData.email || '' 
        }));
      }
    } catch (e) {
      console.error("Error decoding token:", e);
    }

    fetchStats();
  }, [navigate]);

  const services = [
    { id: 'SRV001', name: 'Oil Change - Toyota Camry (ABC-1234)', customer: 'John Doe' },
    { id: 'SRV002', name: 'Brake Repair - Honda Civic (XYZ-5678)', customer: 'Jane Smith' },
    { id: 'SRV003', name: 'Engine Diagnostic - Ford F-150 (DEF-9012)', customer: 'Mike Johnson' },
  ];

  const projects = [
    { id: 'PRJ001', name: 'Custom Paint Job - Tesla Model 3 (GHI-3456)', customer: 'Sarah Williams' },
    { id: 'PRJ002', name: 'Engine Swap - Mustang GT (JKL-7890)', customer: 'Robert Brown' },
    { id: 'PRJ003', name: 'Interior Modification - BMW X5 (MNO-2468)', customer: 'Emily Davis' },
  ];

  const statusOptions = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'delayed', label: 'Delayed' },
  ];

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/time-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.success) return;

      const logs = data.data;
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);

      const todayHours = logs
        .filter((log) => new Date(log.date).toISOString().split('T')[0] === today)
        .reduce((sum, log) => sum + Number(log.hoursWorked || 0), 0);

      const weekHours = logs
        .filter((log) => new Date(log.date) >= weekStart)
        .reduce((sum, log) => sum + Number(log.hoursWorked || 0), 0);

      const activeTasks = logs.filter((log) => log.status === 'in-progress').length;

      setStats({
        todayHours: todayHours.toFixed(1),
        weekHours: weekHours.toFixed(1),
        activeTasks,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.projectType || !formData.projectId || !formData.hoursWorked || !formData.status || !formData.employeeid) {
      showNotification('Please fill in all required fields', 'error');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.hoursWorked) <= 0 || parseFloat(formData.hoursWorked) > 24) {
      showNotification('Hours worked must be between 0 and 24', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/time-logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Time log submitted successfully!', 'success');
        setFormData({
          projectType: '',
          projectId: '',
          date: new Date().toISOString().split('T')[0],
          hoursWorked: '',
          description: '',
          status: '',
          employeeid: user?.id || user?.email || '',
        });

        fetchStats();
      } else {
        showNotification(data.error || 'Submission failed', 'error');
      }
    } catch (error) {
      console.error('Error submitting time log:', error);
      showNotification('Failed to submit time log. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      projectType: '',
      projectId: '',
      date: new Date().toISOString().split('T')[0],
      hoursWorked: '',
      description: '',
      status: '',
      employeeid: user?.id || user?.email || '',
    });
  };

  const availableItems =
    formData.projectType === 'service'
      ? services
      : formData.projectType === 'project'
      ? projects
      : [];

  return (
    <div className="time-log-form-card">
      {notification && <div className={`notification ${notification.type}`}>{notification.message}</div>}

      <div className="card-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Log Time Entry
        </h2>
        <p className="card-description">Record time spent on services or projects</p>
      </div>

      <div className="card-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Type <span className="required">*</span></label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value, projectId: '' })}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="service">Service</option>
                    <option value="project">Project (Modification)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{formData.projectType === 'service' ? 'Service' : 'Project'} <span className="required">*</span></label>
                  <select
                    id="projectId"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    disabled={!formData.projectType}
                    required
                  >
                    <option value="">Select {formData.projectType || 'type first'}</option>
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date <span className="required">*</span></label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hours Worked <span className="required">*</span></label>
                  <input
                    id="hoursWorked"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="2.5"
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status <span className="required">*</span></label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="">Select status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Employee ID <span className="required">*</span></label>
                  <input
                    id="employeeid"
                    type="text"
                    placeholder="EMP_123"
                    value={formData.employeeid}
                    onChange={(e) => setFormData({ ...formData, employeeid: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Work Description</label>
                  <textarea
                    id="description"
                    placeholder="Describe the work completed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleClear}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Time Log'}
                </button>
              </div>
            </form>

            <div className="stats-cards-container" style={{ marginTop: '2rem' }}>
              <div className="stats-card">
                <p className="stats-title">Today's Hours</p>
                <h2 className="stats-value">{stats.todayHours}h</h2>
              </div>
              <div className="stats-card">
                <p className="stats-title">This Week</p>
                <h2 className="stats-value">{stats.weekHours}h</h2>
              </div>
              <div className="stats-card">
                <p className="stats-title">Active Tasks</p>
                <h2 className="stats-value">{stats.activeTasks}</h2>
              </div>
            </div>
          </div>
        </div>
  );
}
