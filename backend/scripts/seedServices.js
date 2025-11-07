const mongoose = require('mongoose');
const Service = require('../models/service');
require('dotenv').config();

const services = [
  {
    name: 'Oil Change',
    description: 'Full synthetic oil change service with filter replacement',
    price: 49.99,
    duration: 60, // in minutes
    category: 'Maintenance'
  },
  {
    name: 'Brake Service',
    description: 'Brake pad replacement and rotor inspection',
    price: 199.99,
    duration: 120,
    category: 'Repair'
  },
  {
    name: 'Tire Rotation',
    description: 'Rotate and balance all tires',
    price: 29.99,
    duration: 45,
    category: 'Maintenance'
  },
  {
    name: 'Full Vehicle Inspection',
    description: 'Comprehensive vehicle inspection including all major systems',
    price: 89.99,
    duration: 90,
    category: 'Diagnostic'
  },
  {
    name: 'Air Conditioning Service',
    description: 'AC system check and recharge',
    price: 129.99,
    duration: 60,
    category: 'Repair'
  },
  {
    name: 'Engine Tune-up',
    description: 'Complete engine tune-up including spark plugs and filters',
    price: 299.99,
    duration: 180,
    category: 'Maintenance'
  }
];

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Existing services cleared');

    // Insert new services
    await Service.insertMany(services);
    console.log('Sample services added successfully');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding services:', err);
    process.exit(1);
  }
};

seedServices();
