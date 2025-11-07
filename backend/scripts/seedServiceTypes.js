const mongoose = require('mongoose');
const ServiceType = require('../models/serviceType');
require('dotenv').config();

const seedServiceTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Sample service types
    const serviceTypes = [
      {
        name: 'Oil Change',
        description: 'Full synthetic oil change with filter replacement',
        category: 'Maintenance',
        price: 79.99,
        duration: 45 // 45 minutes
      },
      {
        name: 'Tire Rotation',
        description: 'Rotate and balance all four tires',
        category: 'Maintenance',
        price: 49.99,
        duration: 30
      },
      {
        name: 'Brake Service',
        description: 'Inspect and service brake system, including pads and rotors',
        category: 'Maintenance',
        price: 199.99,
        duration: 90
      },
      {
        name: 'Engine Diagnostic',
        description: 'Complete engine diagnostic scan and inspection',
        category: 'Diagnostic',
        price: 89.99,
        duration: 60
      },
      {
        name: 'AC Service',
        description: 'AC system check and recharge',
        category: 'Repair',
        price: 129.99,
        duration: 60
      }
    ];

    // Clear existing service types
    await ServiceType.deleteMany({});
    console.log('Existing service types cleared');

    // Insert new service types
    await ServiceType.insertMany(serviceTypes);
    console.log('Sample service types added successfully');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding service types:', err);
    process.exit(1);
  }
};

seedServiceTypes();
