const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

dotenv.config({ path: require("path").join(__dirname, "../.env") });

async function createInitialAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const name = process.env.ADMIN_NAME || "System Admin";
    const rawPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      await mongoose.disconnect();
      return;
    }

    const password = await bcrypt.hash(rawPassword, 10);

    await User.create({ name, email, password, role: "admin" });

    console.log("Admin user created in users collection");
    console.log(`Email: ${email}`);
    console.log("Update ADMIN_PASSWORD in .env after first login.");
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

createInitialAdmin();


