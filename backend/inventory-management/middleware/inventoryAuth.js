const User = require('../../models/user');

/**
 * Middleware to check user permissions for inventory management
 * @param {Array} requiredPermissions - Array of permissions required to access the route
 * @returns {Function} Express middleware function
 */
const requirePermissions = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No authentication token provided.'
        });
      }

      // Get user from database with latest permissions
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User account is disabled.'
        });
      }

      // Get user's full permissions (including role-based permissions)
      const userPermissions = user.fullPermissions || [];

      // Admin has all permissions
      if (user.role === 'admin' || userPermissions.includes('all_access')) {
        req.userPermissions = userPermissions;
        req.userRole = user.role;
        req.userDepartment = user.department;
        return next();
      }

      // Check if user has required permissions
      const hasPermission = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          required: requiredPermissions,
          userPermissions: userPermissions
        });
      }

      // Add user context to request
      req.userPermissions = userPermissions;
      req.userRole = user.role;
      req.userDepartment = user.department;
      next();

    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during permission check'
      });
    }
  };
};

/**
 * Middleware to check specific roles
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const requireRoles = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No authentication token provided.'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found or inactive.'
        });
      }

      // Admin always has access
      if (user.role === 'admin') {
        req.userRole = user.role;
        req.userDepartment = user.department;
        return next();
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient role privileges.',
          required: allowedRoles,
          userRole: user.role
        });
      }

      req.userRole = user.role;
      req.userDepartment = user.department;
      next();

    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during role check'
      });
    }
  };
};

/**
 * Middleware for inventory-specific operations
 */
const inventoryPermissions = {
  // Read-only access (view inventory, parts, reports)
  read: requirePermissions(['inventory_read']),
  
  // Write access (create, update inventory)
  write: requirePermissions(['inventory_write']),
  
  // Parts management (create, update, delete parts)
  partsManage: requirePermissions(['parts_manage']),
  
  // Stock adjustments (adjust quantities, transfers)
  stockAdjust: requirePermissions(['stock_adjust']),
  
  // Alerts management (create, update, resolve alerts)
  alertsManage: requirePermissions(['alerts_manage']),
  
  // Reports access (view detailed reports)
  reports: requirePermissions(['reports_view']),
  
  // User management (for inventory staff)
  userManage: requirePermissions(['user_manage']),
  
  // Configuration management
  configManage: requirePermissions(['config_manage'])
};

/**
 * Role-based middleware shortcuts
 */
const rolePermissions = {
  // Only inventory managers and admins
  managerOnly: requireRoles(['inventory_manager', 'admin']),
  
  // Service staff and above
  serviceStaff: requireRoles(['mechanic', 'service_manager', 'inventory_manager', 'admin']),
  
  // All inventory-related roles
  inventoryStaff: requireRoles(['mechanic', 'service_manager', 'inventory_manager', 'admin']),
  
  // Admin only
  adminOnly: requireRoles(['admin'])
};

/**
 * Middleware to check if user can modify specific resources
 * @param {string} resourceType - Type of resource ('part', 'transaction', etc.)
 * @returns {Function} Express middleware function
 */
const canModifyResource = (resourceType) => {
  return (req, res, next) => {
    const userRole = req.userRole;
    const userPermissions = req.userPermissions || [];
    
    // Admin can modify anything
    if (userRole === 'admin' || userPermissions.includes('all_access')) {
      return next();
    }
    
    // Check specific resource permissions
    switch (resourceType) {
      case 'part':
        if (userPermissions.includes('parts_manage') || 
            ['inventory_manager', 'service_manager'].includes(userRole)) {
          return next();
        }
        break;
        
      case 'stock':
        if (userPermissions.includes('stock_adjust') || 
            ['inventory_manager', 'service_manager'].includes(userRole)) {
          return next();
        }
        break;
        
      case 'transaction':
        if (userPermissions.includes('inventory_write') || 
            ['inventory_manager', 'service_manager', 'mechanic'].includes(userRole)) {
          return next();
        }
        break;
        
      default:
        break;
    }
    
    return res.status(403).json({
      success: false,
      message: `Access denied. Cannot modify ${resourceType} with current permissions.`,
      userRole,
      userPermissions
    });
  };
};

module.exports = {
  requirePermissions,
  requireRoles,
  inventoryPermissions,
  rolePermissions,
  canModifyResource
};