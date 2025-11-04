const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const configController = require('../controllers/configController');
const authMiddleware = require('../../middleware/authMiddleware');
const { inventoryPermissions, rolePermissions, canModifyResource } = require('../middleware/inventoryAuth');

// Public config routes (no auth required)
router.get('/config', configController.getInventoryConfig);
router.get('/config/categories', configController.getCategories);

// Apply authentication middleware to all other routes
router.use(authMiddleware);

// Dashboard route - requires read access
router.get('/dashboard', inventoryPermissions.read, inventoryController.getDashboardData);

// Parts routes - different permissions for different operations
router.get('/parts', inventoryPermissions.read, inventoryController.getAllParts);
router.get('/parts/:id', inventoryPermissions.read, inventoryController.getPartById);
router.post('/parts', inventoryPermissions.partsManage, canModifyResource('part'), inventoryController.createPart);
router.put('/parts/:id', inventoryPermissions.partsManage, canModifyResource('part'), inventoryController.updatePart);
router.delete('/parts/:id', inventoryPermissions.partsManage, canModifyResource('part'), inventoryController.deletePart);

// Stock adjustment routes - requires stock adjustment permissions
router.post('/stock/adjust', inventoryPermissions.stockAdjust, canModifyResource('stock'), inventoryController.adjustStock);

// Transaction routes - read access for viewing
router.get('/parts/:id/transactions', inventoryPermissions.read, inventoryController.getPartTransactions);

// Reorder alert routes - different permissions for viewing vs managing
router.get('/alerts', inventoryPermissions.read, inventoryController.getReorderAlerts);
router.put('/alerts/:id/acknowledge', inventoryPermissions.alertsManage, inventoryController.acknowledgeAlert);

// Additional routes for comprehensive inventory management
// Reports routes - requires report viewing permissions
router.get('/reports/low-stock', inventoryPermissions.reports, inventoryController.getLowStockReport);
router.get('/reports/transactions', inventoryPermissions.reports, inventoryController.getTransactionReport);
router.get('/reports/summary', inventoryPermissions.reports, inventoryController.getInventorySummary);
router.get('/reports/category-analysis', inventoryPermissions.reports, inventoryController.getCategoryAnalysis);
router.get('/reports/inventory-value', inventoryPermissions.reports, inventoryController.getInventoryValueReport);

// Transaction management routes
router.get('/transactions', inventoryPermissions.read, inventoryController.getAllTransactions);
router.post('/transactions', inventoryPermissions.write, canModifyResource('transaction'), inventoryController.createTransaction);

// Advanced configuration routes (admin/manager only)
router.put('/config/:section', rolePermissions.managerOnly, configController.updateConfig);

module.exports = router;