const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");

dotenv.config({ path: require("path").join(__dirname, "../.env") });

async function createAdminInAdminsCollection() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not set in environment");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const name = process.env.ADMIN_NAME || "Super Admin";
    const rawPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

    const exists = await Admin.findOne({ email });
    if (exists) {
      console.log(`Admin already exists in admins collection: ${email}`);
      await mongoose.disconnect();
      return;
    }

    const password = await bcrypt.hash(rawPassword, 10);
    await Admin.create({ name, email, password, isSuperAdmin: true });

    console.log("Admin document created in 'admins' collection (database EAD)");
    console.log(`Email: ${email}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

createAdminInAdminsCollection();


