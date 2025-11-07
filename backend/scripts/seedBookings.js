const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
const User = require("../models/user");
const Booking = require("../models/booking");

async function seedBookings() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get existing users
    const customers = await User.find({ role: "customer" }).limit(3);
    const employees = await User.find({ role: "employee" }).limit(2);

    if (customers.length === 0 || employees.length === 0) {
      console.log("No customers or employees found. Run seedSampleData.js first!");
      process.exit(1);
    }

    // Clear existing bookings
    console.log("Clearing existing bookings...");
    await Booking.deleteMany({});

    // Create sample bookings
    console.log("Creating sample bookings...");
    const bookings = [];

    // Create 6 bookings with different statuses
    const sampleBookings = [
      {
        customer: customers[0]._id,
        vehicleInfo: {
          make: "Toyota",
          model: "Camry",
          year: 2020,
          licensePlate: "ABC-123"
        },
        serviceType: "Oil Change",
        description: "Regular oil change and filter replacement",
        status: "confirmed",
        assignedTo: employees[0]._id,
        bookingDate: new Date(),
        serviceDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        estimatedPrice: 50
      },
      {
        customer: customers[1]._id,
        vehicleInfo: {
          make: "Honda",
          model: "Civic",
          year: 2019,
          licensePlate: "XYZ-789"
        },
        serviceType: "Brake Service",
        description: "Brake pads replacement and inspection",
        status: "in-progress",
        assignedTo: employees[0]._id,
        bookingDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        serviceDate: new Date(),
        estimatedPrice: 150
      },
      {
        customer: customers[2]._id,
        vehicleInfo: {
          make: "Ford",
          model: "F-150",
          year: 2021,
          licensePlate: "DEF-456"
        },
        serviceType: "Engine Diagnostics",
        description: "Check engine light diagnosis",
        status: "pending",
        assignedTo: employees[1]._id,
        bookingDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        serviceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        estimatedPrice: 120
      },
      {
        customer: customers[0]._id,
        vehicleInfo: {
          make: "BMW",
          model: "X5",
          year: 2018,
          licensePlate: "GHI-012"
        },
        serviceType: "Tire Rotation",
        description: "Rotate and balance all four tires",
        status: "completed",
        assignedTo: employees[0]._id,
        bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        serviceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        estimatedPrice: 80,
        actualPrice: 75
      },
      {
        customer: customers[1]._id,
        vehicleInfo: {
          make: "Chevrolet",
          model: "Silverado",
          year: 2022,
          licensePlate: "JKL-345"
        },
        serviceType: "Battery Replacement",
        description: "Replace old battery with new one",
        status: "confirmed",
        assignedTo: employees[1]._id,
        bookingDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        serviceDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        estimatedPrice: 140
      },
      {
        customer: customers[2]._id,
        vehicleInfo: {
          make: "Nissan",
          model: "Altima",
          year: 2023,
          licensePlate: "MNO-678"
        },
        serviceType: "Air Filter Replacement",
        description: "Replace cabin and engine air filters",
        status: "pending",
        assignedTo: employees[1]._id,
        bookingDate: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        serviceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        estimatedPrice: 40
      }
    ];

    for (const bookingData of sampleBookings) {
      const booking = await Booking.create(bookingData);
      bookings.push(booking);
    }

    console.log(`Created ${bookings.length} sample bookings`);

    // Show summary
    console.log("\n=== Booking Summary ===");
    for (const employee of employees) {
      const assignedCount = await Booking.countDocuments({ assignedTo: employee._id });
      console.log(`${employee.name} (${employee.email}): ${assignedCount} assigned bookings`);
    }

    console.log("\n=== Bookings by Status ===");
    const statusCount = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    statusCount.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });

    console.log("\nBookings seeded successfully!");
    console.log("You can now test the employee booking page with assigned bookings.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding bookings:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedBookings();