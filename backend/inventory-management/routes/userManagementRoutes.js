const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const authMiddleware = require('../../middleware/authMiddleware');
const { rolePermissions, inventoryPermissions } = require('../middleware/inventoryAuth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User management routes - only admins and inventory managers
router.get('/users', rolePermissions.managerOnly, userManagementController.getInventoryUsers);
router.post('/users', rolePermissions.managerOnly, inventoryPermissions.userManage, userManagementController.createInventoryUser);
router.put('/users/:id', rolePermissions.managerOnly, inventoryPermissions.userManage, userManagementController.updateInventoryUser);
router.patch('/users/:id/toggle-status', rolePermissions.managerOnly, inventoryPermissions.userManage, userManagementController.toggleUserStatus);
router.patch('/users/:id/reset-password', rolePermissions.managerOnly, inventoryPermissions.userManage, userManagementController.resetUserPassword);
router.get('/users/:id/permissions', rolePermissions.managerOnly, userManagementController.getUserPermissions);

module.exports = router;