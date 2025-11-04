const inventoryRoutes = require('./routes/inventoryRoutes');
const { Part, InventoryTransaction, ReorderAlert } = require('./models');
const inventoryService = require('./services/inventoryService');

module.exports = {
  routes: inventoryRoutes,
  models: {
    Part,
    InventoryTransaction,
    ReorderAlert
  },
  services: {
    inventoryService
  }
};