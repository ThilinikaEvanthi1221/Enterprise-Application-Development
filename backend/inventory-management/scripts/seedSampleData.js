const mongoose = require('mongoose');

// Function to create sample parts with proper user ID
const createSamplePartsData = (userId) => [
  // Engine Parts
  {
    partNumber: 'ENG001',
    name: 'Engine Oil Filter',
    description: 'High-quality oil filter for automotive engines',
    category: 'Engine',
    manufacturer: 'AutoParts Pro',
    supplier: 'Engine Parts Ltd',
    unitPrice: 15.99,
    currentStock: 25,
    minStockLevel: 10,
    maxStockLevel: 50,
    isActive: true,
    createdBy: userId
  },
  {
    partNumber: 'ENG002',
    name: 'Spark Plug Set',
    description: 'Premium spark plugs for better performance',
    category: 'Engine',
    manufacturer: 'SparkMaster',
    supplier: 'Ignition Supply Co',
    unitPrice: 89.99,
    currentStock: 8,
    minStockLevel: 15,
    maxStockLevel: 40,
    isActive: true,
    createdBy: userId
  },
  {
    partNumber: 'ENG003',
    name: 'Air Filter',
    description: 'High-flow air filter for improved engine breathing',
    category: 'Engine',
    manufacturer: 'AirFlow',
    supplier: 'Engine Parts Ltd',
    unitPrice: 24.50,
    currentStock: 0,
    minStockLevel: 12,
    maxStockLevel: 35,
    isActive: true,
    createdBy: userId
  },
  // Brake Parts
  {
    partNumber: 'BRK001',
    name: 'Brake Pads - Front',
    description: 'Ceramic brake pads for front wheels',
    category: 'Brakes',
    manufacturer: 'StopSafe',
    supplier: 'Brake Systems Inc',
    unitPrice: 65.00,
    currentStock: 18,
    minStockLevel: 8,
    maxStockLevel: 30,
    isActive: true,
    createdBy: userId
  },
  {
    partNumber: 'BRK002',
    name: 'Brake Disc - Rear',
    description: 'Ventilated brake disc for rear wheels',
    category: 'Brakes',
    manufacturer: 'DiscMaster',
    supplier: 'Brake Systems Inc',
    unitPrice: 120.00,
    currentStock: 6,
    minStockLevel: 10,
    maxStockLevel: 25,
    isActive: true,
    createdBy: userId
  },
  // Electrical Parts
  {
    partNumber: 'ELE001',
    name: 'Headlight Bulb H7',
    description: 'LED headlight bulb - H7 fitting',
    category: 'Electrical',
    manufacturer: 'BrightLight',
    supplier: 'Electric Auto Parts',
    unitPrice: 35.99,
    currentStock: 22,
    minStockLevel: 15,
    maxStockLevel: 50,
    isActive: true,
    createdBy: userId
  },
  {
    partNumber: 'ELE002',
    name: 'Battery 12V',
    description: 'High-performance 12V car battery',
    category: 'Electrical',
    manufacturer: 'PowerMax',
    supplier: 'Battery World',
    unitPrice: 189.99,
    currentStock: 4,
    minStockLevel: 6,
    maxStockLevel: 20,
    isActive: true,
    createdBy: userId
  },
  // Suspension Parts
  {
    partNumber: 'SUS001',
    name: 'Shock Absorber - Front',
    description: 'Gas-filled shock absorber for front suspension',
    category: 'Suspension',
    manufacturer: 'SmoothRide',
    supplier: 'Suspension Pro',
    unitPrice: 95.50,
    currentStock: 12,
    minStockLevel: 8,
    maxStockLevel: 24,
    isActive: true,
    createdBy: userId
  },
  {
    partNumber: 'SUS002',
    name: 'Coil Spring - Rear',
    description: 'Heavy-duty coil spring for rear suspension',
    category: 'Suspension',
    manufacturer: 'SpringMaster',
    supplier: 'Suspension Pro',
    unitPrice: 78.00,
    currentStock: 3,
    minStockLevel: 10,
    maxStockLevel: 20,
    isActive: true,
    createdBy: userId
  },
  // Transmission Parts
  {
    partNumber: 'TRA001',
    name: 'Transmission Fluid',
    description: 'Synthetic transmission fluid - 1L bottle',
    category: 'Transmission',
    manufacturer: 'FluidTech',
    supplier: 'Fluid Systems Ltd',
    unitPrice: 28.99,
    currentStock: 30,
    minStockLevel: 20,
    maxStockLevel: 60,
    isActive: true,
    createdBy: userId
  }
];

// Sample transactions
const createSampleTransactions = async (parts, userId) => {
  const transactions = [];
  const transactionTypes = ['IN', 'OUT', 'ADJUSTMENT'];
  
  // Create some recent transactions
  for (let i = 0; i < 8; i++) {
    const randomPart = parts[Math.floor(Math.random() * parts.length)];
    const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    
    transactions.push({
      part: randomPart._id,
      transactionType: randomType,
      quantity: quantity,
      reason: `Sample ${randomType.toLowerCase()} transaction`,
      performedBy: userId,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
    });
  }
  
  return transactions;
};

// Create reorder alerts for low stock items
const createReorderAlerts = async (parts) => {
  const alerts = [];
  
  parts.forEach(part => {
    if (part.currentStock <= part.minStockLevel) {
      alerts.push({
        part: part._id,
        currentStock: part.currentStock,
        minStockLevel: part.minStockLevel,
        suggestedOrderQuantity: part.maxStockLevel - part.currentStock,
        priority: part.currentStock === 0 ? 'HIGH' : 'MEDIUM',
        status: 'ACTIVE',
        notes: `Auto-generated alert for low stock on ${part.name}`
      });
    }
  });
  
  return alerts;
};

async function seedSampleData() {
  try {
    console.log('🌱 Starting to seed sample inventory data...');
    
    // Import models
    const Part = require('../models/Part');
    const InventoryTransaction = require('../models/InventoryTransaction');
    const ReorderAlert = require('../models/ReorderAlert');
    const User = require('../../models/user');
    
    // Clear existing inventory data
    await Part.deleteMany({});
    await InventoryTransaction.deleteMany({});
    await ReorderAlert.deleteMany({});
    console.log('🗑️ Cleared existing inventory data');
    
    // Find or create a default user for seeding
    let defaultUser = await User.findOne({ role: 'inventory_manager' });
    if (!defaultUser) {
      defaultUser = await User.findOne({});
      if (!defaultUser) {
        console.log('⚠️ No users found. Creating a default user for seeding...');
        defaultUser = await User.create({
          name: 'System Admin',
          email: 'admin@system.com',
          password: 'hashedpassword',
          role: 'inventory_manager'
        });
      }
    }
    
    // Create sample parts with the user ID
    const sampleParts = createSamplePartsData(defaultUser._id);
    const insertedParts = await Part.insertMany(sampleParts);
    console.log(`📦 Inserted ${insertedParts.length} sample parts`);
    
    // Create sample transactions
    const transactions = await createSampleTransactions(insertedParts, defaultUser._id);
    if (transactions.length > 0) {
      await InventoryTransaction.insertMany(transactions);
      console.log(`📋 Inserted ${transactions.length} sample transactions`);
    }
    
    // Create reorder alerts
    const alerts = await createReorderAlerts(insertedParts);
    if (alerts.length > 0) {
      await ReorderAlert.insertMany(alerts);
      console.log(`🚨 Created ${alerts.length} reorder alerts`);
    }
    
    // Display summary
    console.log('\n📊 Sample Data Summary:');
    console.log(`- Total Parts: ${insertedParts.length}`);
    console.log(`- Low Stock Parts: ${insertedParts.filter(p => p.currentStock <= p.minStockLevel).length}`);
    console.log(`- Out of Stock Parts: ${insertedParts.filter(p => p.currentStock === 0).length}`);
    
    const totalValue = insertedParts.reduce((sum, part) => sum + (part.currentStock * part.unitPrice), 0);
    console.log(`- Total Inventory Value: $${totalValue.toFixed(2)}`);
    console.log(`- Active Alerts: ${alerts.length}`);
    
    console.log('\n✅ Sample data seeded successfully!');
    return {
      parts: insertedParts.length,
      transactions: transactions.length,
      alerts: alerts.length,
      totalValue: totalValue.toFixed(2)
    };
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
}

// If running this script directly
if (require.main === module) {
  // Connect to MongoDB (adjust connection string as needed)
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_app';
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('📡 Connected to MongoDB');
      return seedSampleData();
    })
    .then(() => {
      console.log('🏁 Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSampleData, createSamplePartsData };