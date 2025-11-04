const User = require('../../models/user');
const bcrypt = require('bcryptjs');

const userManagementController = {
  // Get all inventory-related users
  getInventoryUsers: async (req, res) => {
    try {
      const inventoryRoles = ['inventory_manager', 'service_manager', 'mechanic', 'employee'];
      
      const users = await User.find({
        role: { $in: inventoryRoles }
      }).select('-password').sort({ createdAt: -1 });

      res.json({
        success: true,
        data: users,
        total: users.length
      });
    } catch (error) {
      console.error('Error fetching inventory users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory users'
      });
    }
  },

  // Create a new inventory user
  createInventoryUser: async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role,
        department,
        permissions
      } = req.body;

      // Validate required fields
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and role are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Validate role
      const allowedRoles = ['inventory_manager', 'service_manager', 'mechanic', 'employee'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      // Set default permissions based on role
      let defaultPermissions = [];
      switch (role) {
        case 'inventory_manager':
          defaultPermissions = ['inventory_read', 'inventory_write', 'parts_manage', 'stock_adjust', 'alerts_manage', 'reports_view'];
          break;
        case 'service_manager':
          defaultPermissions = ['inventory_read', 'inventory_write', 'parts_manage', 'stock_adjust', 'reports_view'];
          break;
        case 'mechanic':
          defaultPermissions = ['inventory_read', 'parts_manage'];
          break;
        case 'employee':
          defaultPermissions = ['inventory_read', 'reports_view'];
          break;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        department: department || 'inventory',
        permissions: permissions || defaultPermissions,
        isActive: true,
        createdBy: req.user.id
      });

      await user.save();

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'Inventory user created successfully',
        data: userResponse
      });
    } catch (error) {
      console.error('Error creating inventory user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create inventory user'
      });
    }
  },

  // Update inventory user
  updateInventoryUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated this way
      delete updates.password;
      delete updates._id;
      delete updates.__v;

      // Validate role if being updated
      if (updates.role) {
        const allowedRoles = ['inventory_manager', 'service_manager', 'mechanic', 'employee'];
        if (!allowedRoles.includes(updates.role)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role specified'
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Error updating inventory user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory user'
      });
    }
  },

  // Toggle user active status
  toggleUserStatus: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isActive = !user.isActive;
      user.updatedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle user status'
      });
    }
  },

  // Reset user password
  resetUserPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const user = await User.findByIdAndUpdate(
        id,
        { 
          password: hashedPassword,
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Password reset successfully',
        data: user
      });
    } catch (error) {
      console.error('Error resetting user password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset user password'
      });
    }
  },

  // Get user permissions and role info
  getUserPermissions: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select('name email role department permissions isActive');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user,
          availablePermissions: [
            'inventory_read',
            'inventory_write', 
            'parts_manage',
            'stock_adjust',
            'alerts_manage',
            'reports_view',
            'user_manage',
            'config_manage'
          ],
          availableRoles: [
            'inventory_manager',
            'service_manager', 
            'mechanic',
            'employee'
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user permissions'
      });
    }
  }
};

module.exports = userManagementController;