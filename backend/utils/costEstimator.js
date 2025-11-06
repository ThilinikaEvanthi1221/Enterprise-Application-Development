/**
 * Cost Estimation Utility for Services and Projects
 * Calculates estimated costs based on service type, labor hours, and parts
 */

// Base labor rates (per hour)
const LABOR_RATES = {
  standard: 50, // Standard service work
  specialized: 75, // Specialized repairs
  modification: 100, // Custom modifications
};

// Base service costs and estimated hours
const SERVICE_BASE_COSTS = {
  "Oil Change": {
    baseCost: 40,
    laborHours: 0.5,
    laborRate: LABOR_RATES.standard,
  },
  "Tire Replacement": {
    baseCost: 80,
    laborHours: 1,
    laborRate: LABOR_RATES.standard,
  },
  "Brake Service": {
    baseCost: 150,
    laborHours: 2,
    laborRate: LABOR_RATES.specialized,
  },
  "Engine Repair": {
    baseCost: 300,
    laborHours: 4,
    laborRate: LABOR_RATES.specialized,
  },
  "Transmission Service": {
    baseCost: 200,
    laborHours: 3,
    laborRate: LABOR_RATES.specialized,
  },
  "AC Service": {
    baseCost: 120,
    laborHours: 1.5,
    laborRate: LABOR_RATES.specialized,
  },
  "Battery Replacement": {
    baseCost: 60,
    laborHours: 0.5,
    laborRate: LABOR_RATES.standard,
  },
  "General Inspection": {
    baseCost: 30,
    laborHours: 1,
    laborRate: LABOR_RATES.standard,
  },
  Other: { baseCost: 100, laborHours: 2, laborRate: LABOR_RATES.standard },
};

// Base modification/project costs
const MODIFICATION_BASE_COSTS = {
  "Performance Upgrade": {
    baseCost: 500,
    laborHours: 8,
    laborRate: LABOR_RATES.modification,
  },
  "Aesthetic Modification": {
    baseCost: 400,
    laborHours: 6,
    laborRate: LABOR_RATES.modification,
  },
  "Custom Paint Job": {
    baseCost: 800,
    laborHours: 12,
    laborRate: LABOR_RATES.modification,
  },
  "Interior Modification": {
    baseCost: 600,
    laborHours: 8,
    laborRate: LABOR_RATES.modification,
  },
  "Audio System": {
    baseCost: 300,
    laborHours: 4,
    laborRate: LABOR_RATES.modification,
  },
  "Suspension Upgrade": {
    baseCost: 700,
    laborHours: 10,
    laborRate: LABOR_RATES.specialized,
  },
  "Engine Tuning": {
    baseCost: 1000,
    laborHours: 15,
    laborRate: LABOR_RATES.modification,
  },
  "Body Kit Installation": {
    baseCost: 600,
    laborHours: 8,
    laborRate: LABOR_RATES.modification,
  },
  Other: { baseCost: 500, laborHours: 8, laborRate: LABOR_RATES.modification },
};

/**
 * Calculate total cost of parts
 * @param {Array} parts - Array of part objects with name, quantity, cost
 * @returns {Number} Total parts cost
 */
const calculatePartsCost = (parts) => {
  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    return 0;
  }

  return parts.reduce((total, part) => {
    const quantity = part.quantity || 0;
    const cost = part.cost || 0;
    return total + quantity * cost;
  }, 0);
};

/**
 * Calculate labor cost
 * @param {Number} hours - Number of labor hours
 * @param {Number} rate - Hourly labor rate
 * @returns {Number} Total labor cost
 */
const calculateLaborCost = (hours, rate) => {
  return (hours || 0) * (rate || LABOR_RATES.standard);
};

/**
 * Estimate cost for a service request
 * @param {Object} serviceData - Service details
 * @param {String} serviceData.serviceType - Type of service
 * @param {Number} serviceData.laborHours - Optional: Override labor hours
 * @param {Array} serviceData.partsRequired - Optional: Parts needed
 * @returns {Object} Cost breakdown
 */
const estimateServiceCost = (serviceData) => {
  const { serviceType, laborHours, partsRequired } = serviceData;

  // Get base cost info for service type
  const baseInfo =
    SERVICE_BASE_COSTS[serviceType] || SERVICE_BASE_COSTS["Other"];

  // Calculate costs
  const hours = laborHours || baseInfo.laborHours;
  const laborCost = calculateLaborCost(hours, baseInfo.laborRate);
  const partsCost = calculatePartsCost(partsRequired);
  const baseCost = baseInfo.baseCost;

  // Total = base cost + labor + parts
  const totalCost = baseCost + laborCost + partsCost;

  // Add 10% contingency
  const contingency = totalCost * 0.1;
  const estimatedTotal = totalCost + contingency;

  return {
    baseCost,
    laborHours: hours,
    laborRate: baseInfo.laborRate,
    laborCost,
    partsCost,
    subtotal: totalCost,
    contingency,
    estimatedTotal: Math.round(estimatedTotal * 100) / 100, // Round to 2 decimals
    breakdown: {
      base: baseCost,
      labor: laborCost,
      parts: partsCost,
      contingency,
    },
  };
};

/**
 * Estimate cost for a modification/project request
 * @param {Object} projectData - Project details
 * @param {String} projectData.modificationType - Type of modification
 * @param {Number} projectData.laborHours - Optional: Override labor hours
 * @param {Array} projectData.partsRequired - Optional: Parts needed
 * @param {String} projectData.priority - Optional: Priority level (affects cost)
 * @returns {Object} Cost breakdown
 */
const estimateProjectCost = (projectData) => {
  const { modificationType, laborHours, partsRequired, priority } = projectData;

  // Get base cost info for modification type
  const baseInfo =
    MODIFICATION_BASE_COSTS[modificationType] ||
    MODIFICATION_BASE_COSTS["Other"];

  // Calculate costs
  const hours = laborHours || baseInfo.laborHours;
  const laborCost = calculateLaborCost(hours, baseInfo.laborRate);
  const partsCost = calculatePartsCost(partsRequired);
  const baseCost = baseInfo.baseCost;

  // Total before adjustments
  let totalCost = baseCost + laborCost + partsCost;

  // Priority adjustment
  let priorityMultiplier = 1.0;
  if (priority === "urgent") {
    priorityMultiplier = 1.3; // 30% rush fee
  } else if (priority === "high") {
    priorityMultiplier = 1.15; // 15% expedited fee
  }

  totalCost = totalCost * priorityMultiplier;

  // Add 15% contingency for modifications (higher than services due to complexity)
  const contingency = totalCost * 0.15;
  const estimatedTotal = totalCost + contingency;

  return {
    baseCost,
    laborHours: hours,
    laborRate: baseInfo.laborRate,
    laborCost,
    partsCost,
    priorityMultiplier,
    subtotal: totalCost,
    contingency,
    estimatedTotal: Math.round(estimatedTotal * 100) / 100, // Round to 2 decimals
    breakdown: {
      base: baseCost,
      labor: laborCost,
      parts: partsCost,
      priorityAdjustment: totalCost - (baseCost + laborCost + partsCost),
      contingency,
    },
  };
};

/**
 * Update actual cost based on completed work
 * @param {Object} workData - Completed work details
 * @param {Number} workData.actualLaborHours - Actual hours worked
 * @param {Number} workData.laborRate - Labor rate used
 * @param {Array} workData.actualParts - Actual parts used
 * @param {Number} workData.additionalCosts - Any additional costs
 * @returns {Number} Actual total cost
 */
const calculateActualCost = (workData) => {
  const { actualLaborHours, laborRate, actualParts, additionalCosts } =
    workData;

  const laborCost = calculateLaborCost(actualLaborHours, laborRate);
  const partsCost = calculatePartsCost(actualParts);
  const additional = additionalCosts || 0;

  const actualTotal = laborCost + partsCost + additional;

  return {
    laborCost,
    partsCost,
    additionalCosts: additional,
    actualTotal: Math.round(actualTotal * 100) / 100,
  };
};

/**
 * Get estimated hours for a service type
 * @param {String} serviceType - Type of service
 * @returns {Number} Estimated labor hours
 */
const getEstimatedHours = (serviceType) => {
  const baseInfo =
    SERVICE_BASE_COSTS[serviceType] || SERVICE_BASE_COSTS["Other"];
  return baseInfo.laborHours;
};

/**
 * Get estimated hours for a modification type
 * @param {String} modificationType - Type of modification
 * @returns {Number} Estimated labor hours
 */
const getEstimatedProjectHours = (modificationType) => {
  const baseInfo =
    MODIFICATION_BASE_COSTS[modificationType] ||
    MODIFICATION_BASE_COSTS["Other"];
  return baseInfo.laborHours;
};

module.exports = {
  estimateServiceCost,
  estimateProjectCost,
  calculateActualCost,
  calculatePartsCost,
  calculateLaborCost,
  getEstimatedHours,
  getEstimatedProjectHours,
  LABOR_RATES,
  SERVICE_BASE_COSTS,
  MODIFICATION_BASE_COSTS,
};
