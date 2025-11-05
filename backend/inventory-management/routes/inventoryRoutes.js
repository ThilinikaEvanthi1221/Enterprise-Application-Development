const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const configController = require('../controllers/configController');
const { verifyToken } = require('../../middleware/authMiddleware');
const { inventoryPermissions, rolePermissions, canModifyResource } = require('../middleware/inventoryAuth');

// Public config routes (no auth required)
router.get('/config', configController.getInventoryConfig);
router.get('/config/categories', configController.getCategories);

// Test route to verify routing works
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Inventory routes are working!' });
});

// Apply authentication middleware to all other routes
router.use(verifyToken);

// Dashboard route - accessible to all authenticated users
router.get('/dashboard', inventoryController.getDashboardData);

// Parts routes - accessible to all authenticated users for reading
router.get('/parts', inventoryController.getAllParts);
router.get('/parts/:id', inventoryController.getPartById);
router.post('/parts', inventoryPermissions.partsManage, canModifyResource('part'), inventoryController.createPart);
router.put('/parts/:id', inventoryPermissions.partsManage, canModifyResource('part'), inventoryController.updatePart);
router.delete('/parts/:id', inventoryPermissions.partsManage, canModifyResource('part'), inventoryController.deletePart);

// Stock adjustment routes - requires stock adjustment permissions
router.post('/stock/adjust', inventoryPermissions.stockAdjust, canModifyResource('stock'), inventoryController.adjustStock);

// Transaction routes - accessible to all authenticated users for reading
router.get('/parts/:id/transactions', inventoryController.getPartTransactions);

// Reorder alert routes - accessible to all authenticated users for reading
router.get('/alerts', inventoryController.getReorderAlerts);
router.put('/alerts/:id/acknowledge', inventoryPermissions.alertsManage, inventoryController.acknowledgeAlert);

// Additional routes for comprehensive inventory management
// Reports routes - accessible to all authenticated users
router.get('/reports/low-stock', inventoryController.getLowStockReport);
router.get('/reports/transactions', inventoryController.getTransactionReport);
router.get('/reports/summary', inventoryController.getInventorySummary);
router.get('/reports/category-analysis', inventoryController.getCategoryAnalysis);
router.get('/reports/inventory-value', inventoryController.getInventoryValueReport);

// Transaction management routes - accessible to all authenticated users for reading
router.get('/transactions', inventoryController.getAllTransactions);
router.post('/transactions', inventoryPermissions.write, canModifyResource('transaction'), inventoryController.createTransaction);

// Advanced configuration routes (admin/manager only)
router.put('/config/:section', rolePermissions.managerOnly, configController.updateConfig);

module.exports = router;