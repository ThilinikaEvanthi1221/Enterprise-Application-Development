// Inventory configuration constants
export const INVENTORY_CONFIG = {
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
  
  CURRENCIES: [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' }
  ],
  
  TRANSACTION_TYPES: [
    { value: 'IN', label: 'Stock In (Add)', color: '#28a745' },
    { value: 'OUT', label: 'Stock Out (Remove)', color: '#dc3545' },
    { value: 'ADJUSTMENT', label: 'Direct Adjustment (Set to)', color: '#ffc107' },
    { value: 'TRANSFER', label: 'Transfer', color: '#17a2b8' },
    { value: 'DAMAGE', label: 'Damage/Loss', color: '#6c757d' },
    { value: 'RETURN', label: 'Return', color: '#007bff' }
  ],
  
  ALERT_PRIORITIES: [
    { value: 'LOW', label: 'Low', color: '#28a745', icon: 'ℹ️' },
    { value: 'MEDIUM', label: 'Medium', color: '#ffc107', icon: '⚡' },
    { value: 'HIGH', label: 'High', color: '#fd7e14', icon: '⚠️' },
    { value: 'CRITICAL', label: 'Critical', color: '#dc3545', icon: '🚨' }
  ],
  
  ALERT_STATUSES: [
    { value: 'ACTIVE', label: 'Active', color: '#dc3545' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged', color: '#ffc107' },
    { value: 'RESOLVED', label: 'Resolved', color: '#28a745' },
    { value: 'DISMISSED', label: 'Dismissed', color: '#6c757d' }
  ],
  
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
  
  PAGINATION: {
    defaultLimit: 10,
    options: [5, 10, 25, 50, 100]
  }
};

// Utility functions
export const getTransactionTypeInfo = (type) => {
  return INVENTORY_CONFIG.TRANSACTION_TYPES.find(t => t.value === type) || {};
};

export const getAlertPriorityInfo = (priority) => {
  return INVENTORY_CONFIG.ALERT_PRIORITIES.find(p => p.value === priority) || {};
};

export const getAlertStatusInfo = (status) => {
  return INVENTORY_CONFIG.ALERT_STATUSES.find(s => s.value === status) || {};
};

export const getCurrencyInfo = (code) => {
  return INVENTORY_CONFIG.CURRENCIES.find(c => c.code === code) || { symbol: '$' };
};

export const formatCurrency = (amount, currencyCode = 'USD') => {
  const currency = getCurrencyInfo(currencyCode);
  return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
};