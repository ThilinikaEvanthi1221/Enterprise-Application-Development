const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { Part, InventoryTransaction, ReorderAlert } = require('../inventory-management/models');
const INVENTORY_CONFIG = require('../inventory-management/config/inventoryConfig');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    // Connect to database
    const mongoUri = `${process.env.MONGO_URI}enterprise_app_db?retryWrites=true&w=majority`;
    await mongoose.connect(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB for initialization...');

    // Create default users
    await createDefaultUsers();
    
    // Create sample parts data
    await createSampleParts();
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

const createDefaultUsers = async () => {
  console.log('Creating default users...');
  
  const defaultUsers = [
    {
      name: 'System Administrator',
      email: 'admin@enterprise.com',
      password: 'admin123',
      role: 'admin',
      department: 'admin',
      permissions: ['all_access']
    },
    {
      name: 'Inventory Manager',
      email: 'inventory.manager@enterprise.com',
      password: 'inventory123',
      role: 'inventory_manager',
      department: 'inventory',
      permissions: ['inventory_read', 'inventory_write', 'parts_manage', 'stock_adjust', 'alerts_manage', 'reports_view']
    },
    {
      name: 'Service Manager',
      email: 'service.manager@enterprise.com',
      password: 'service123',
      role: 'service_manager',
      department: 'service',
      permissions: ['inventory_read', 'inventory_write', 'parts_manage', 'stock_adjust', 'reports_view']
    },
    {
      name: 'Senior Mechanic',
      email: 'mechanic@enterprise.com',
      password: 'mechanic123',
      role: 'mechanic',
      department: 'service',
      permissions: ['inventory_read', 'parts_manage']
    },
    {
      name: 'Employee User',
      email: 'employee@enterprise.com',
      password: 'employee123',
      role: 'employee',
      department: 'service',
      permissions: ['inventory_read', 'reports_view']
    },
    {
      name: 'Customer User',
      email: 'customer@enterprise.com',
      password: 'customer123',
      role: 'customer',
      department: null,
      permissions: []
    }
  ];

  for (const userData of defaultUsers) {
    const existingUser = await User.findOne({ email: userData.email });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
        isActive: true
      });
      
      await user.save();
      console.log(`Created user: ${userData.name} (${userData.email})`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }
};

const createSampleParts = async () => {
  console.log('Creating sample parts data...');
  
  // Get the admin user to use as creator
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    console.log('Admin user not found, skipping sample parts creation');
    return;
  }

  const sampleParts = [
    {
      partNumber: 'ENG-001',
      name: 'Engine Oil Filter',
      description: 'High-performance oil filter for diesel engines',
      category: 'Engine',
      manufacturer: 'FilterCorp',
      supplier: 'AutoParts Supply Co.',
      currentStock: 25,
      minStockLevel: 5,
      maxStockLevel: 50,
      unitPrice: 15.99,
      currency: 'USD',
      location: {
        warehouse: 'Main Warehouse',
        section: 'A',
        shelf: '1',
        bin: '1'
      },
      createdBy: adminUser._id
    },
    {
      partNumber: 'BRK-002',
      name: 'Brake Pad Set - Front',
      description: 'Premium brake pads for front wheels',
      category: 'Brakes',
      manufacturer: 'BrakeMaster',
      supplier: 'AutoParts Supply Co.',
      currentStock: 3, // Low stock to trigger alert
      minStockLevel: 10,
      maxStockLevel: 40,
      unitPrice: 89.99,
      currency: 'USD',
      location: {
        warehouse: 'Main Warehouse',
        section: 'B',
        shelf: '2',
        bin: '3'
      },
      createdBy: adminUser._id
    },
    {
      partNumber: 'ELC-003',
      name: 'LED Headlight Bulb',
      description: 'Energy-efficient LED headlight replacement',
      category: 'Electrical',
      manufacturer: 'BrightLite',
      supplier: 'Electronics Direct',
      currentStock: 15,
      minStockLevel: 8,
      maxStockLevel: 30,
      unitPrice: 45.50,
      currency: 'USD',
      location: {
        warehouse: 'Main Warehouse',
        section: 'C',
        shelf: '1',
        bin: '2'
      },
      createdBy: adminUser._id
    },
    {
      partNumber: 'TRN-004',
      name: 'Transmission Fluid',
      description: 'Synthetic transmission fluid - 1 quart',
      category: 'Transmission',
      manufacturer: 'FluidTech',
      supplier: 'Lubricants Plus',
      currentStock: 0, // Out of stock to trigger critical alert
      minStockLevel: 12,
      maxStockLevel: 60,
      unitPrice: 12.75,
      currency: 'USD',
      location: {
        warehouse: 'Main Warehouse',
        section: 'D',
        shelf: '3',
        bin: '1'
      },
      createdBy: adminUser._id
    },
    {
      partNumber: 'SUS-005',
      name: 'Shock Absorber - Rear',
      description: 'Heavy-duty rear shock absorber',
      category: 'Suspension',
      manufacturer: 'SmoothRide',
      supplier: 'Suspension Specialists',
      currentStock: 8,
      minStockLevel: 4,
      maxStockLevel: 20,
      unitPrice: 125.00,
      currency: 'USD',
      location: {
        warehouse: 'Main Warehouse',
        section: 'E',
        shelf: '2',
        bin: '2'
      },
      createdBy: adminUser._id
    }
  ];

  for (const partData of sampleParts) {
    const existingPart = await Part.findOne({ partNumber: partData.partNumber });
    
    if (!existingPart) {
      const part = new Part(partData);
      await part.save();
      console.log(`Created part: ${partData.partNumber} - ${partData.name}`);
      
      // Create reorder alert if stock is low
      await ReorderAlert.createAlertForPart(part._id);
    } else {
      console.log(`Part already exists: ${partData.partNumber}`);
    }
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, createDefaultUsers, createSampleParts };