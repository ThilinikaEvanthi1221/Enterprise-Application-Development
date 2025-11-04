const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const TimeLog = require("../models/timeLog");

async function seedSampleData() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    await TimeLog.deleteMany({});

    // Create Users
    console.log("Creating users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const customerPassword = await bcrypt.hash("customer123", 10);
    const employeePassword = await bcrypt.hash("employee123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin"
    });

    const employees = [];
    for (let i = 1; i <= 3; i++) {
      const employee = await User.create({
        name: `Employee ${i}`,
        email: `employee${i}@example.com`,
        password: employeePassword,
        role: "employee"
      });
      employees.push(employee);
    }

    const customers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = await User.create({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        password: customerPassword,
        role: "customer"
      });
      customers.push(customer);
    }

    console.log(`Created ${1} admin, ${employees.length} employees, and ${customers.length} customers`);

    // Create Services
    console.log("Creating services...");
    const services = await Service.insertMany([
      {
        name: "Oil Change",
        description: "Standard oil change service with filter replacement",
        price: 49.99
      },
      {
        name: "Brake Inspection",
        description: "Complete brake system inspection and report",
        price: 79.99
      },
      {
        name: "Tire Rotation",
        description: "Rotate all four tires for even wear",
        price: 29.99
      },
      {
        name: "Battery Replacement",
        description: "Replace old battery with new one",
        price: 149.99
      },
      {
        name: "Engine Tune-up",
        description: "Complete engine tune-up and diagnostics",
        price: 199.99
      },
      {
        name: "Air Filter Replacement",
        description: "Replace cabin and engine air filters",
        price: 39.99
      }
    ]);
    console.log(`Created ${services.length} services`);

    // Create Vehicles
    console.log("Creating vehicles...");
    const vehicles = [];
    const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW"];
    const models = ["Camry", "Civic", "F-150", "Silverado", "3 Series"];
    const years = [2020, 2021, 2022, 2023, 2024];

    for (let i = 0; i < customers.length && i < 5; i++) {
      const vehicle = await Vehicle.create({
        plateNumber: `ABC-${1000 + i}`,
        make: makes[i],
        model: models[i],
        year: years[i],
        owner: customers[i]._id,
        status: "active"
      });
      vehicles.push(vehicle);
    }
    console.log(`Created ${vehicles.length} vehicles`);

    // Create Appointments
    console.log("Creating appointments...");
    const appointments = [];
    const statuses = ["scheduled", "completed", "scheduled", "cancelled"];
    
    for (let i = 0; i < vehicles.length && i < 4; i++) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (i + 1) * 2); // Schedule appointments 2, 4, 6, 8 days from now
      scheduledDate.setHours(10 + i, 0, 0, 0);

      const appointment = await Appointment.create({
        user: vehicles[i].owner,
        vehicle: vehicles[i]._id,
        service: services[i % services.length]._id,
        scheduledAt: scheduledDate,
        status: statuses[i % statuses.length],
        notes: `Sample appointment ${i + 1} for ${services[i % services.length].name}`
      });
      appointments.push(appointment);
    }
    console.log(`Created ${appointments.length} appointments`);

    // Create Time Logs
    console.log("Creating time logs...");
    const timeLogs = [];
    for (let i = 0; i < employees.length; i++) {
      for (let day = 0; day < 7; day++) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - day);
        logDate.setHours(9, 0, 0, 0);

        const timeLog = await TimeLog.create({
          employee: employees[i]._id,
          date: logDate,
          hours: 7 + Math.random() * 2, // Random hours between 7-9
          description: `Work log for day ${day + 1}`
        });
        timeLogs.push(timeLog);
      }
    }
    console.log(`Created ${timeLogs.length} time logs`);

    console.log("\n=== Seed Data Summary ===");
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Vehicles: ${await Vehicle.countDocuments()}`);
    console.log(`Services: ${await Service.countDocuments()}`);
    console.log(`Appointments: ${await Appointment.countDocuments()}`);
    console.log(`Time Logs: ${await TimeLog.countDocuments()}`);

    console.log("\n=== Login Credentials ===");
    console.log("Admin: admin@example.com / admin123");
    console.log("Employees: employee1@example.com / employee123");
    console.log("Customers: customer1@example.com / customer123");

    await mongoose.disconnect();
    console.log("\nDatabase seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedSampleData();

