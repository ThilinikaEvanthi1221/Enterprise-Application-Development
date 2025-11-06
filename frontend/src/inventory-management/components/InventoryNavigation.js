import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './InventoryNavigation.css';

const InventoryNavigation = ({ userRole = 'inventory_manager', onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
      if (window.innerWidth <= 1200) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify parent component of sidebar state
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/inventory/dashboard',
      roles: ['admin', 'inventory_manager', 'service_manager', 'mechanic', 'employee'],
      description: 'Overview & Analytics'
    },
    {
      id: 'parts',
      label: 'Parts Management',
      icon: '�',
      path: '/inventory/parts',
      roles: ['admin', 'inventory_manager', 'service_manager', 'mechanic'],
      description: 'Manage Spare Parts'
    },
    {
      id: 'stock',
      label: 'Stock Adjustment',
      icon: '�',
      path: '/inventory/stock-adjustment',
      roles: ['admin', 'inventory_manager', 'service_manager'],
      description: 'Adjust Stock Levels'
    },

    {
      id: 'reports',
      label: 'Reports',
      icon: '�',
      path: '/inventory/reports',
      roles: ['admin', 'inventory_manager', 'service_manager', 'employee'],
      description: 'Generate Reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/inventory/settings',
      roles: ['admin', 'inventory_manager'],
      description: 'System Settings'
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile menu after navigation
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getUserRoleDisplay = (role) => {
    switch (role) {
      case 'inventory_manager': return 'Inventory Manager';
      case 'service_manager': return 'Service Manager';
      case 'mechanic': return 'Mechanic';
      case 'employee': return 'Employee';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'inventory_manager': return '👨‍💼';
      case 'service_manager': return '🔧';
      case 'mechanic': return '🛠️';
      case 'employee': return '👤';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  return (
    <>
      <div className={`inventory-navigation ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="nav-header">
          <div className="nav-brand">
            <div className="brand-icon">🏢</div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="brand-text">
                <h3>Inventory System</h3>
                <p>Management Portal</p>
              </div>
            )}
          </div>
          <button 
            className="collapse-btn"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed && !isMobileOpen ? '▶️' : '◀️'}
          </button>
        </div>

      <div className="user-info">
        <div className="user-avatar">
          {getRoleIcon(userRole)}
        </div>
        {(!isCollapsed || isMobileOpen) && (
          <div className="user-details">
            <div className="user-role">{getUserRoleDisplay(userRole)}</div>
            <div className="user-status">Active</div>
          </div>
        )}
      </div>

      <nav className="nav-menu">
        <ul className="nav-list">
          {filteredItems.map(item => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {(!isCollapsed || isMobileOpen) && <span className="nav-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav-footer">        
        <button 
          className="logout-btn"
          onClick={() => {
            // Handle logout logic here
            localStorage.removeItem('token');
            navigate('/login');
          }}
          title="Logout"
        >
          <span className="logout-icon">🚪</span>
          {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </div>

    {/* Mobile overlay */}
    {isMobileOpen && (
      <div 
        className="mobile-overlay active"
        onClick={() => setIsMobileOpen(false)}
      />
    )}
  </>
  );
};

export default InventoryNavigation;