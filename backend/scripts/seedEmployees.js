const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
require("dotenv").config();

// Sample employees with their credentials
const employees = [
  {
    name: "John Smith",
    email: "john.smith@autoservice.com",
    password: "Employee@123",
    role: "employee"
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@autoservice.com",
    password: "Employee@456",
    role: "employee"
  }
];

async function seedEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if employees already exist
    for (const emp of employees) {
      const existingUser = await User.findOne({ email: emp.email });
      
      if (existingUser) {
        console.log(`⚠️  Employee ${emp.email} already exists - skipping`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(emp.password, 10);

      // Create employee
      const employee = await User.create({
        name: emp.name,
        email: emp.email,
        password: hashedPassword,
        role: emp.role
      });

      console.log(`✅ Created employee: ${emp.name}`);
      console.log(`   📧 Email: ${emp.email}`);
      console.log(`   🔑 Password: ${emp.password}`);
      console.log("");
    }

    console.log("✅ Employee seeding completed!");
    console.log("\n📝 EMPLOYEE CREDENTIALS:");
    console.log("========================");
    employees.forEach((emp, index) => {
      console.log(`\nEmployee ${index + 1}:`);
      console.log(`  Name: ${emp.name}`);
      console.log(`  Email: ${emp.email}`);
      console.log(`  Password: ${emp.password}`);
    });
    console.log("\n========================");

  } catch (error) {
    console.error("❌ Error seeding employees:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

seedEmployees();
