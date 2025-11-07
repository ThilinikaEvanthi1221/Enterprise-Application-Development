const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require('./config/db');
const path = require("path");

dotenv.config();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:3000", // React app's address
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Connect to MongoDB
connectDB();

// Log when connected
mongoose.connection.once('open', () => {
  console.log('MongoDB connected successfully');
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount modification routes
app.use('/api/modifications', require('./routes/modificationRoutes'));

// Connect to database and run migrations on startup
(async () => {
  try {
    await connectDB();
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (isAutoMigrationEnabled()) {
      console.log("Running automatic database migrations...");
      const db = mongoose.connection.db;
      if (db) {
        await runMigrations(db);
      } else {
        console.log("⚠ Database object not available, skipping migrations");
      }
    } else {
      console.log(
        "Automatic migrations disabled (set AUTO_MIGRATE=false to disable)"
      );
    }

    // Bootstrap default admin
    try {
      await Admin.collection.createIndex({ email: 1 }, { unique: true });

      if (process.env.SEED_DEFAULT_ADMIN === "true") {
        const email = process.env.ADMIN_EMAIL || "admin@example.com";
        const name = process.env.ADMIN_NAME || "Super Admin";
        const rawPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

        const existing = await Admin.findOne({ email });
        if (!existing) {
          const password = await bcrypt.hash(rawPassword, 10);
          await Admin.create({ name, email, password, isSuperAdmin: true });
          console.log(`Default admin created in admins collection: ${email}`);
        }
      }
    } catch (err) {
      console.error("Admin bootstrap error:", err.message);
    }
  } catch (error) {
    console.error("Startup error:", error);
  }
})();

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ msg: "Backend server is running!" });
});

// ----------------------------------------------
// ROUTES REGISTRATION (with error-safe logging)
// ----------------------------------------------

try {
  app.use("/api/auth", require("./routes/authRoutes"));
  console.log("✓ Auth routes loaded");
} catch (err) {
  console.error("✗ Auth routes failed:", err.message);
}

try {
  app.use("/api/users", require("./routes/userRoutes"));
  console.log("✓ Users routes loaded");
} catch (err) {
  console.error("✗ Users routes failed:", err.message);
}

try {
  app.use("/api/vehicles", require("./routes/vehicleRoutes"));
  console.log("✓ Vehicles routes loaded");
} catch (err) {
  console.error("✗ Vehicles routes failed:", err.message);
}

try {
  app.use("/api/services", require("./routes/serviceRoutes"));
  console.log("✓ Services routes loaded");
} catch (err) {
  console.error("✗ Services routes failed:", err.message);
}

try {
  app.use("/api/projects", require("./routes/projectRoutes"));
  console.log("✓ Projects routes loaded");
} catch (err) {
  console.error("✗ Projects routes failed:", err.message);
}

try {
  app.use("/api/appointments", require("./routes/appointmentRoutes"));
  console.log("✓ Appointments routes loaded");
} catch (err) {
  console.error("✗ Appointments routes failed:", err.message);
}

try {
  app.use("/api/time-logs", require("./routes/timeLogRoutes"));
  console.log("✓ Time-logs routes loaded");
} catch (err) {
  console.error("✗ Time-logs routes failed:", err.message);
}

try {
  app.use("/api/dashboard", require("./routes/dashboardRoutes"));
  console.log("✓ Dashboard routes loaded");
} catch (err) {
  console.error("✗ Dashboard routes failed:", err.message);
}

try {
  app.use("/api/customers", require("./routes/customerRoutes"));
  console.log("✓ Customers routes loaded");
} catch (err) {
  console.error("✗ Customers routes failed:", err.message);
}

try {
  app.use("/api/bookings", require("./routes/bookingRoutes"));
  console.log("✓ Bookings routes loaded");
} catch (err) {
  console.error("✗ Bookings routes failed:", err.message);
}

try {
  app.use("/api/staff", require("./routes/staffRoutes"));
  console.log("✓ Staff routes loaded");
} catch (err) {
  console.error("✗ Staff routes failed:", err.message);
}

try {
  app.use("/api/notifications", require("./routes/notificationRoutes"));
  console.log("✓ Notifications routes loaded");
} catch (err) {
  console.error("✗ Notifications routes failed:", err.message);
}

try {
  app.use("/api/inventory", require("./inventory-management").routes);
  console.log("✓ Inventory routes loaded");
} catch (err) {
  console.error("✗ Inventory routes failed:", err.message);
}

try {
  app.use("/api/profile", require("./routes/profileRoutes"));
  console.log("✓ Profile routes loaded");
} catch (err) {
  console.error("✗ Profile routes failed:", err.message);
}

// ----------------------------------------------
// ✅ NEW: Modification Routes
// ----------------------------------------------
try {
  const modificationRoutes = require("./routes/modificationRoutes");
  app.use("/api/modifications", modificationRoutes);
  console.log("✓ Modifications routes loaded");
} catch (err) {
  console.error("✗ Modifications routes failed:", err.message);
}

// Mount modification routes
app.use('/api/modifications', require('./routes/modificationRoutes'));

// Mount API routes
app.use('/api/services', require('./routes/serviceRoutes'));

// ----------------------------------------------
// START SERVER
// ----------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
