const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

const verifyUsers = async () => {
  try {
    // Connect to database
    const mongoUri = `${process.env.MONGO_URI}enterprise_app_db?retryWrites=true&w=majority`;
    await mongoose.connect(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB...');

    // Get all users
    const users = await User.find({});
    console.log('\n=== EXISTING USERS ===');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
      console.log('---');
    });

    // Test password for inventory manager
    const inventoryManager = await User.findOne({ email: 'inventory.manager@enterprise.com' });
    if (inventoryManager) {
      console.log('\n=== TESTING INVENTORY MANAGER PASSWORD ===');
      const isMatch = await bcrypt.compare('inventory123', inventoryManager.password);
      console.log(`Password 'inventory123' matches: ${isMatch}`);
      
      // Try with different possible passwords
      const possiblePasswords = ['inventory123', 'password123', 'manager123', 'admin123'];
      for (const pwd of possiblePasswords) {
        const match = await bcrypt.compare(pwd, inventoryManager.password);
        console.log(`Password '${pwd}' matches: ${match}`);
      }
    } else {
      console.log('Inventory manager not found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyUsers();