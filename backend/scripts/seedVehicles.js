const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const User = require('../models/user');
require('dotenv').config();

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Find test customer
    const customer = await User.findOne({ email: 'customer@test.com' });
    if (!customer) {
      console.error('Test customer not found');
      process.exit(1);
    }

    // Sample vehicles for the test customer
    const vehicles = [
      {
        user: customer._id,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: 'TEST1234567890CAM',
        plateNumber: 'ABC123',
        color: 'Silver',
        mileage: 35000
      },
      {
        user: customer._id,
        make: 'Honda',
        model: 'CR-V',
        year: 2019,
        vin: 'TEST1234567890CRV',
        plateNumber: 'XYZ789',
        color: 'Blue',
        mileage: 45000
      },
      {
        user: customer._id,
        make: 'Ford',
        model: 'F-150',
        year: 2021,
        vin: 'TEST1234567890F15',
        plateNumber: 'DEF456',
        color: 'Red',
        mileage: 25000
      }
    ];

    // Clear existing vehicles for this customer
    await Vehicle.deleteMany({ user: customer._id });
    console.log('Existing vehicles cleared for test customer');

    // Insert new vehicles
    await Vehicle.insertMany(vehicles);
    console.log('Sample vehicles added successfully');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding vehicles:', err);
    process.exit(1);
  }
};

seedVehicles();
