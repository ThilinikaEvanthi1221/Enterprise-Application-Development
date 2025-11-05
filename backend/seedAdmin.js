const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@autoservice.com" });
    
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@autoservice.com");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const admin = new User({
      name: "Admin",
      email: "admin@autoservice.com",
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();
    
    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@autoservice.com");
    console.log("Password: admin123");
    console.log("\n⚠️  Please change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
