// Inventory configuration constants for backend
const INVENTORY_CONFIG = {
  CATEGORIES: [
    'Engine',
    'Transmission', 
    'Brakes',
    'Electrical',
    'Body',
    'Interior',
    'Exterior',
    'Suspension',
    'Cooling',
    'Fuel',
    'Other'
  ],
  
  CURRENCIES: ['USD', 'EUR', 'GBP', 'LKR'],
  
  TRANSACTION_TYPES: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'DAMAGE', 'RETURN'],
  
  ALERT_TYPES: ['LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRED'],
  
  ALERT_PRIORITIES: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  
  ALERT_STATUSES: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'],
  
  DEFAULT_VALUES: {
    minStockLevel: 5,
    maxStockLevel: 100,
    currency: 'USD',
    category: 'Other',
    warehouse: 'Main Warehouse',
    section: 'A',
    shelf: '1',
    bin: '1'
  },
  
  VALIDATION: {
    partNumber: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Z0-9-_]+$/
    },
    name: {
      minLength: 2,
      maxLength: 100
    },
    description: {
      maxLength: 500
    },
    notes: {
      maxLength: 500
    }
  }
};

module.exports = INVENTORY_CONFIG;