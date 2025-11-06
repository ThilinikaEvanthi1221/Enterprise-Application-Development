const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Create a test customer
    const customerPassword = await bcrypt.hash('customer123', 10);
    await User.findOneAndUpdate(
      { email: 'customer@test.com' },
      {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: customerPassword,
        role: 'customer'
      },
      { upsert: true, new: true }
    );

    // Create a test admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: adminPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    console.log('Test users created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating test users:', err);
    process.exit(1);
  }
};

createTestUsers();
