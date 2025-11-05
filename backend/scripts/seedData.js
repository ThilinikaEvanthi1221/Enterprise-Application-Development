const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/user");
const Project = require("../models/project");
const Service = require("../models/service");
const Booking = require("../models/booking");
const bcrypt = require("bcryptjs");

// Load .env file from backend directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Project.deleteMany({});
    // await Service.deleteMany({});
    // await Booking.deleteMany({});

    // Create a sample employee if doesn't exist
    let employee = await User.findOne({ email: "employee@autoservice.com" });
    if (!employee) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      employee = await User.create({
        name: "Cody Fisher",
        email: "employee@autoservice.com",
        password: hashedPassword,
        role: "employee"
      });
      console.log("Created employee:", employee.email);
    }

    // Create a sample customer if doesn't exist
    let customer = await User.findOne({ email: "customer@example.com" });
    if (!customer) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      customer = await User.create({
        name: "John Doe",
        email: "customer@example.com",
        password: hashedPassword,
        role: "customer"
      });
      console.log("Created customer:", customer.email);
    }

    // Create sample projects
    const projects = await Project.find({ assignedTo: employee._id });
    if (projects.length === 0) {
      const sampleProjects = [
        {
          title: "Engine Diagnostic",
          description: "Complete engine diagnostic and repair",
          assignedTo: employee._id,
          status: "ongoing",
          startDate: new Date(),
        },
        {
          title: "Brake System Overhaul",
          description: "Replace brake pads and rotors",
          assignedTo: employee._id,
          status: "completed",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Transmission Service",
          description: "Fluid change and inspection",
          assignedTo: employee._id,
          status: "pending",
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        }
      ];

      await Project.insertMany(sampleProjects);
      console.log("Created sample projects");
    }

    // Create sample services
    const services = await Service.find({ assignedTo: employee._id });
    if (services.length === 0) {
      const sampleServices = [
        {
          name: "Oil Change Service",
          description: "Standard oil change with filter replacement",
          assignedTo: employee._id,
          status: "ongoing",
          startDate: new Date(),
        },
        {
          name: "Tire Rotation",
          description: "Rotate all four tires",
          assignedTo: employee._id,
          status: "ongoing",
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          name: "Battery Replacement",
          description: "Replace old battery with new one",
          assignedTo: employee._id,
          status: "completed",
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        }
      ];

      await Service.insertMany(sampleServices);
      console.log("Created sample services");
    }

    // Create sample bookings
    const bookings = await Booking.find({ customer: customer._id });
    if (bookings.length === 0) {
      const sampleBookings = [
        {
          customer: customer._id,
          vehicleInfo: {
            make: "Toyota",
            model: "Camry",
            year: 2020,
            licensePlate: "ABC-1234"
          },
          serviceType: "Oil Change",
          description: "Regular oil change service",
          status: "confirmed",
          assignedTo: employee._id,
          bookingDate: new Date(),
          serviceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          estimatedPrice: 50
        },
        {
          customer: customer._id,
          vehicleInfo: {
            make: "Honda",
            model: "Civic",
            year: 2019,
            licensePlate: "XYZ-5678"
          },
          serviceType: "Brake Inspection",
          description: "Complete brake system inspection",
          status: "in-progress",
          assignedTo: employee._id,
          bookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          serviceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          estimatedPrice: 120
        },
        {
          customer: customer._id,
          vehicleInfo: {
            make: "Ford",
            model: "F-150",
            year: 2021,
            licensePlate: "DEF-9012"
          },
          serviceType: "Tire Replacement",
          description: "Replace all four tires",
          status: "pending",
          assignedTo: employee._id,
          bookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          serviceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          estimatedPrice: 600
        }
      ];

      await Booking.insertMany(sampleBookings);
      console.log("Created sample bookings");
    }

    console.log("\n✅ Seed data created successfully!");
    console.log("\nYou can now login with:");
    console.log("Email: employee@autoservice.com");
    console.log("Password: password123");
    console.log("\nOr");
    console.log("Email: customer@example.com");
    console.log("Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();

