/**
 * Seed Sample Data to EAD Database
 * Seeds data specifically to the EAD database
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const TimeLog = require("../models/timeLog");

async function seedEADDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    // Extract base URI and connect to EAD database specifically
    let mongoUri = process.env.MONGO_URI;
    
    // Replace database name with EAD
    if (mongoUri.includes('/')) {
      const uriParts = mongoUri.split('/');
      uriParts[uriParts.length - 1] = 'EAD';
      mongoUri = uriParts.join('/');
    } else {
      mongoUri = mongoUri.replace(/\/[^\/\?]*/, '/EAD');
    }

    console.log("Connecting to EAD database...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB (EAD database)\n");

    // Clear existing data
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

    // Create Vehicles with varied license plates
    console.log("Creating vehicles...");
    const vehicles = [];
    
    // Expanded vehicle data with varied license plate formats
    const vehicleData = [
      { make: "Toyota", model: "Camry", year: 2020, plateNumber: "ABC-1000", ownerIndex: 0 },
      { make: "Honda", model: "Civic", year: 2021, plateNumber: "ABC-1001", ownerIndex: 1 },
      { make: "Ford", model: "F-150", year: 2022, plateNumber: "ABC-1002", ownerIndex: 2 },
      { make: "Chevrolet", model: "Silverado", year: 2023, plateNumber: "ABC-1003", ownerIndex: 3 },
      { make: "BMW", model: "3 Series", year: 2024, plateNumber: "ABC-1004", ownerIndex: 4 },
      { make: "Mercedes-Benz", model: "C-Class", year: 2023, plateNumber: "XYZ-2023", ownerIndex: 0 },
      { make: "Audi", model: "A4", year: 2022, plateNumber: "DEF-5678", ownerIndex: 1 },
      { make: "Nissan", model: "Altima", year: 2021, plateNumber: "GHI-9012", ownerIndex: 2 },
      { make: "Hyundai", model: "Elantra", year: 2020, plateNumber: "JKL-3456", ownerIndex: 3 },
      { make: "Mazda", model: "CX-5", year: 2023, plateNumber: "MNO-7890", ownerIndex: 4 },
      { make: "Volkswagen", model: "Jetta", year: 2022, plateNumber: "PQR-1234", ownerIndex: 0 },
      { make: "Subaru", model: "Outback", year: 2021, plateNumber: "STU-5678", ownerIndex: 1 },
      { make: "Kia", model: "Optima", year: 2020, plateNumber: "VWX-9012", ownerIndex: 2 },
      { make: "Jeep", model: "Grand Cherokee", year: 2024, plateNumber: "YZA-3456", ownerIndex: 3 },
      { make: "Lexus", model: "ES 350", year: 2023, plateNumber: "BCD-7890", ownerIndex: 4 }
    ];

    for (const vehicleInfo of vehicleData) {
      const owner = customers[vehicleInfo.ownerIndex % customers.length];
      const vehicle = await Vehicle.create({
        plateNumber: vehicleInfo.plateNumber,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        owner: owner._id,
        status: "active"
      });
      vehicles.push(vehicle);
    }
    
    console.log(`Created ${vehicles.length} vehicles`);
    
    // Display vehicles summary with license plates
    console.log("\n=== Vehicles Summary (with License Plates) ===");
    const vehicleDetails = await Vehicle.find()
      .populate("owner", "name email")
      .sort({ plateNumber: 1 });
    
    vehicleDetails.forEach((veh, index) => {
      console.log(`${index + 1}. License Plate: ${veh.plateNumber} | ${veh.make} ${veh.model} (${veh.year}) | Owner: ${veh.owner.name} | Status: ${veh.status}`);
    });

    // Create Appointments with comprehensive dummy data
    console.log("Creating appointments...");
    const appointments = [];
    
    // Sample appointment data with Customer, Vehicle ID, Appointment Date, and Status
    const appointmentData = [
      {
        customerIndex: 0,
        vehicleIndex: 0,
        serviceIndex: 0,
        daysFromNow: -5, // Past appointment
        hour: 9,
        status: "completed",
        notes: "Oil change completed successfully"
      },
      {
        customerIndex: 1,
        vehicleIndex: 1,
        serviceIndex: 1,
        daysFromNow: -3,
        hour: 14,
        status: "completed",
        notes: "Brake inspection completed, all systems good"
      },
      {
        customerIndex: 0,
        vehicleIndex: 0,
        serviceIndex: 2,
        daysFromNow: 2,
        hour: 10,
        status: "scheduled",
        notes: "Tire rotation scheduled"
      },
      {
        customerIndex: 2,
        vehicleIndex: 2,
        serviceIndex: 3,
        daysFromNow: 5,
        hour: 11,
        status: "scheduled",
        notes: "Battery replacement appointment"
      },
      {
        customerIndex: 3,
        vehicleIndex: 3,
        serviceIndex: 4,
        daysFromNow: 7,
        hour: 13,
        status: "scheduled",
        notes: "Engine tune-up scheduled"
      },
      {
        customerIndex: 1,
        vehicleIndex: 1,
        serviceIndex: 5,
        daysFromNow: 3,
        hour: 15,
        status: "scheduled",
        notes: "Air filter replacement"
      },
      {
        customerIndex: 4,
        vehicleIndex: 4,
        serviceIndex: 0,
        daysFromNow: 1,
        hour: 9,
        status: "scheduled",
        notes: "Regular oil change"
      },
      {
        customerIndex: 2,
        vehicleIndex: 2,
        serviceIndex: 1,
        daysFromNow: -7,
        hour: 10,
        status: "cancelled",
        notes: "Customer cancelled - rescheduled"
      },
      {
        customerIndex: 0,
        vehicleIndex: 0,
        serviceIndex: 3,
        daysFromNow: 10,
        hour: 14,
        status: "scheduled",
        notes: "Battery check and replacement if needed"
      },
      {
        customerIndex: 3,
        vehicleIndex: 3,
        serviceIndex: 2,
        daysFromNow: 4,
        hour: 16,
        status: "scheduled",
        notes: "Tire rotation and balance"
      },
      {
        customerIndex: 4,
        vehicleIndex: 4,
        serviceIndex: 4,
        daysFromNow: 6,
        hour: 9,
        status: "scheduled",
        notes: "Complete engine tune-up"
      },
      {
        customerIndex: 1,
        vehicleIndex: 1,
        serviceIndex: 0,
        daysFromNow: -2,
        hour: 11,
        status: "completed",
        notes: "Oil change and filter replacement done"
      },
      {
        customerIndex: 2,
        vehicleIndex: 2,
        serviceIndex: 5,
        daysFromNow: 8,
        hour: 12,
        status: "scheduled",
        notes: "Air filter replacement scheduled"
      },
      {
        customerIndex: 3,
        vehicleIndex: 3,
        serviceIndex: 1,
        daysFromNow: 9,
        hour: 10,
        status: "scheduled",
        notes: "Brake inspection appointment"
      },
      {
        customerIndex: 0,
        vehicleIndex: 0,
        serviceIndex: 4,
        daysFromNow: -1,
        hour: 13,
        status: "completed",
        notes: "Engine tune-up completed"
      }
    ];

    for (const apptData of appointmentData) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + apptData.daysFromNow);
      scheduledDate.setHours(apptData.hour, 0, 0, 0);
      scheduledDate.setMinutes(Math.floor(Math.random() * 60)); // Random minutes

      // Ensure customer and vehicle indices are valid
      const customer = customers[apptData.customerIndex % customers.length];
      const vehicle = vehicles[apptData.vehicleIndex % vehicles.length];
      const service = services[apptData.serviceIndex % services.length];

      const appointment = await Appointment.create({
        user: customer._id,
        vehicle: vehicle._id,
        service: service._id,
        scheduledAt: scheduledDate,
        status: apptData.status,
        notes: apptData.notes
      });
      appointments.push(appointment);
    }
    
    console.log(`Created ${appointments.length} appointments`);
    
    // Display appointment summary
    console.log("\n=== Appointment Summary ===");
    const appointmentDetails = await Appointment.find()
      .populate("user", "name email")
      .populate("vehicle", "plateNumber make model")
      .populate("service", "name price")
      .sort({ scheduledAt: 1 });
    
    appointmentDetails.forEach((apt, index) => {
      console.log(`${index + 1}. Customer: ${apt.user.name} | Vehicle: ${apt.vehicle.plateNumber} (${apt.vehicle.make} ${apt.vehicle.model}) | Date: ${apt.scheduledAt.toLocaleDateString()} ${apt.scheduledAt.toLocaleTimeString()} | Status: ${apt.status} | Service: ${apt.service.name}`);
    });

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
          hours: 7 + Math.random() * 2,
          description: `Work log for day ${day + 1}`
        });
        timeLogs.push(timeLog);
      }
    }
    console.log(`Created ${timeLogs.length} time logs`);

    console.log("\n=== Seed Data Summary (EAD Database) ===");
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
    console.log("\n✓ EAD database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedEADDatabase();

