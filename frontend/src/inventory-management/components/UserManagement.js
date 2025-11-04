import React, { useState, useEffect } from 'react';
import inventoryApi from '../services/inventoryApi';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'inventory',
    permissions: []
  });

  const rolePermissions = {
    inventory_manager: ['inventory_read', 'inventory_write', 'parts_manage', 'stock_adjust', 'alerts_manage', 'reports_view', 'user_manage'],
    service_manager: ['inventory_read', 'inventory_write', 'parts_manage', 'stock_adjust', 'reports_view'],
    mechanic: ['inventory_read', 'parts_manage'],
    employee: ['inventory_read', 'reports_view']
  };

  const availableRoles = [
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'service_manager', label: 'Service Manager' },
    { value: 'mechanic', label: 'Mechanic' },
    { value: 'employee', label: 'Employee' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call when backend is connected
      const mockUsers = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'inventory_manager',
          department: 'inventory',
          permissions: ['inventory_read', 'inventory_write', 'parts_manage'],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      setUsers(mockUsers);
      
      // Uncomment when backend is ready
      // const response = await inventoryApi.getInventoryUsers();
      // if (response.success) {
      //   setUsers(response.data);
      // } else {
      //   setError('Failed to fetch users');
      // }
    } catch (err) {
      setError('Error fetching users');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-update permissions when role changes
      ...(name === 'role' && { permissions: rolePermissions[value] || [] })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingUser) {
        response = await inventoryApi.updateInventoryUser(editingUser._id, formData);
      } else {
        response = await inventoryApi.createInventoryUser(formData);
      }

      if (response.success) {
        await fetchUsers();
        resetForm();
        setShowAddForm(false);
        setEditingUser(null);
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (err) {
      setError('Error saving user');
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: 'inventory',
      permissions: rolePermissions.employee
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      role: user.role,
      department: user.department || 'inventory',
      permissions: user.permissions || []
    });
    setShowAddForm(true);
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await inventoryApi.toggleUserStatus(userId);
      if (response.success) {
        await fetchUsers();
      } else {
        setError(response.message || 'Failed to toggle user status');
      }
    } catch (err) {
      setError('Error toggling user status');
      console.error('Error:', err);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (newPassword && newPassword.length >= 6) {
      try {
        const response = await inventoryApi.resetUserPassword(userId, newPassword);
        if (response.success) {
          alert('Password reset successfully');
        } else {
          setError(response.message || 'Failed to reset password');
        }
      } catch (err) {
        setError('Error resetting password');
        console.error('Error:', err);
      }
    } else if (newPassword !== null) {
      alert('Password must be at least 6 characters long');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'inventory_manager': return 'role-manager';
      case 'service_manager': return 'role-service';
      case 'mechanic': return 'role-mechanic';
      case 'employee': return 'role-employee';
      default: return 'role-default';
    }
  };

  if (loading) {
    return (
      <div className="user-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>User Management</h1>
        <p>Manage inventory team members and their permissions</p>
        <button 
          className="add-user-btn"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
            setEditingUser(null);
          }}
        >
          <span className="btn-icon">👤➕</span>
          Add New User
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="error-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Add/Edit User Form */}
      {showAddForm && (
        <div className="user-form-overlay">
          <div className="user-form-container">
            <div className="form-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button 
                className="close-form-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter password (min 6 characters)"
                    minLength="6"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="inventory">Inventory</option>
                  <option value="service">Service</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="admin">Administration</option>
                </select>
              </div>

              <div className="form-group permissions-group">
                <label>Permissions</label>
                <div className="permissions-list">
                  {formData.permissions.map(permission => (
                    <span key={permission} className="permission-tag">
                      {permission.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="permissions-note">
                  Permissions are automatically assigned based on the selected role.
                </p>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="users-list">
        <div className="users-header">
          <h2>Team Members ({users.length})</h2>
        </div>

        {users.length === 0 ? (
          <div className="no-users">
            <p>No users found. Add your first team member!</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map(user => (
              <div key={user._id} className={`user-card ${!user.isActive ? 'inactive' : ''}`}>
                <div className="user-header">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <div className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? '🟢' : '🔴'}
                  </div>
                </div>

                <div className="user-details">
                  <div className="user-role">
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="user-department">
                    <strong>Department:</strong> {user.department || 'Not specified'}
                  </div>

                  <div className="user-permissions">
                    <strong>Permissions:</strong>
                    <div className="permissions-tags">
                      {user.permissions?.slice(0, 3).map(permission => (
                        <span key={permission} className="permission-tag small">
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                      {user.permissions?.length > 3 && (
                        <span className="permission-tag small more">
                          +{user.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="user-meta">
                    <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                    {user.updatedAt && (
                      <p>Updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                <div className="user-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(user)}
                    title="Edit user"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className={`action-btn toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                    onClick={() => handleToggleStatus(user._id)}
                    title={user.isActive ? 'Deactivate user' : 'Activate user'}
                  >
                    {user.isActive ? '🚫 Deactivate' : '✅ Activate'}
                  </button>
                  <button 
                    className="action-btn reset-password"
                    onClick={() => handleResetPassword(user._id)}
                    title="Reset password"
                  >
                    🔑 Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;