import React, { useState, useEffect } from 'react';
import inventoryApi from '../services/inventoryApi';
import '../styles/Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Enterprise Auto Parts',
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      defaultWarehouse: 'Main Warehouse'
    },
    inventory: {
      defaultMinStockLevel: 5,
      defaultMaxStockLevel: 100,
      autoReorderEnabled: false,
      lowStockAlertThreshold: 10,
      enableBarcodeScanning: false
    },
    categories: [
      'Engine', 'Transmission', 'Brakes', 'Electrical', 
      'Body', 'Interior', 'Exterior', 'Suspension', 
      'Cooling', 'Fuel', 'Other'
    ],
    notifications: {
      emailNotifications: true,
      lowStockAlerts: true,
      reorderAlerts: true,
      transactionNotifications: false
    }
  });

  const [newCategory, setNewCategory] = useState('');

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'categories', name: 'Categories', icon: '🏷️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'users', name: 'Users', icon: '👥' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getInventoryConfig();
      if (response && response.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Saving settings:', {
        section: activeTab,
        data: settings[activeTab]
      });
      
      // Save to backend
      const response = await inventoryApi.updateConfig(activeTab, settings[activeTab]);
      console.log('Settings save response:', response);
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Settings save error:', err);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to save settings';
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        console.error('Server error details:', err.response.data);
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error - could not connect to server';
        console.error('Network error:', err.request);
      } else {
        // Other error
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const addCategory = () => {
    if (newCategory.trim() && !settings.categories.includes(newCategory.trim())) {
      setSettings(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== category)
    }));
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Settings</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Company Name</label>
          <input
            type="text"
            value={settings.general.companyName}
            onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label>Default Currency</label>
          <select
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="LKR">LKR - Sri Lankan Rupee</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label>Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Colombo">Colombo</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label>Default Warehouse</label>
          <input
            type="text"
            value={settings.general.defaultWarehouse}
            onChange={(e) => handleSettingChange('general', 'defaultWarehouse', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderInventorySettings = () => (
    <div className="settings-section">
      <h3>Inventory Settings</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>Default Minimum Stock Level</label>
          <input
            type="number"
            min="0"
            value={settings.inventory.defaultMinStockLevel}
            onChange={(e) => handleSettingChange('inventory', 'defaultMinStockLevel', parseInt(e.target.value))}
          />
        </div>
        
        <div className="setting-item">
          <label>Default Maximum Stock Level</label>
          <input
            type="number"
            min="1"
            value={settings.inventory.defaultMaxStockLevel}
            onChange={(e) => handleSettingChange('inventory', 'defaultMaxStockLevel', parseInt(e.target.value))}
          />
        </div>
        
        <div className="setting-item">
          <label>Low Stock Alert Threshold</label>
          <input
            type="number"
            min="0"
            value={settings.inventory.lowStockAlertThreshold}
            onChange={(e) => handleSettingChange('inventory', 'lowStockAlertThreshold', parseInt(e.target.value))}
          />
        </div>
        
        <div className="setting-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={settings.inventory.autoReorderEnabled}
              onChange={(e) => handleSettingChange('inventory', 'autoReorderEnabled', e.target.checked)}
            />
            Enable Auto Reorder
          </label>
        </div>
        
        <div className="setting-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={settings.inventory.enableBarcodeScanning}
              onChange={(e) => handleSettingChange('inventory', 'enableBarcodeScanning', e.target.checked)}
            />
            Enable Barcode Scanning
          </label>
        </div>
      </div>
    </div>
  );

  const renderCategoriesSettings = () => (
    <div className="settings-section">
      <h3>Part Categories</h3>
      
      <div className="add-category">
        <div className="add-category-input">
          <input
            type="text"
            placeholder="Enter new category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          />
          <button onClick={addCategory} disabled={!newCategory.trim()}>
            Add Category
          </button>
        </div>
      </div>
      
      <div className="categories-list">
        {settings.categories.map((category) => (
          <div key={category} className="category-item">
            <span className="category-name">{category}</span>
            {category !== 'Other' && (
              <button
                className="remove-btn"
                onClick={() => removeCategory(category)}
                title="Remove category"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="settings-section">
      <h3>Notification Settings</h3>
      <div className="settings-grid">
        <div className="setting-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            />
            Enable Email Notifications
          </label>
        </div>
        
        <div className="setting-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.lowStockAlerts}
              onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
            />
            Low Stock Alerts
          </label>
        </div>
        
        <div className="setting-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.reorderAlerts}
              onChange={(e) => handleSettingChange('notifications', 'reorderAlerts', e.target.checked)}
            />
            Reorder Alerts
          </label>
        </div>
        
        <div className="setting-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.transactionNotifications}
              onChange={(e) => handleSettingChange('notifications', 'transactionNotifications', e.target.checked)}
            />
            Transaction Notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderUsersSettings = () => (
    <div className="settings-section">
      <h3>User Management</h3>
      <div className="coming-soon">
        <div className="coming-soon-icon">👥</div>
        <h4>User Management</h4>
        <p>User management functionality will be available in the next update.</p>
        <div className="planned-features">
          <div className="feature-item">✓ Add/Remove Users</div>
          <div className="feature-item">✓ Role Management</div>
          <div className="feature-item">✓ Permission Settings</div>
          <div className="feature-item">✓ User Activity Logs</div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'inventory':
        return renderInventorySettings();
      case 'categories':
        return renderCategoriesSettings();
      case 'notifications':
        return renderNotificationsSettings();
      case 'users':
        return renderUsersSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <div className="header-actions">
          {activeTab !== 'users' && (
            <button 
              className="save-btn"
              onClick={saveSettings}
              disabled={loading}
            >
              💾 Save Changes
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-main">
          {loading && <div className="loading">Loading settings...</div>}
          {!loading && renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Settings;