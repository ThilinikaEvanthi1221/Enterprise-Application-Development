const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const setupSocketIO = require("./config/socketio");
const connectDB = require("./config/db");
const Admin = require("./models/admin");
const { runMigrations, isAutoMigrationEnabled } = require("./utils/runMigrations");

// Import controllers that need Socket.IO
const progressController = require("./controllers/progressController");
const notificationController = require("./controllers/notificationController");

// Import routes
const progressRoutes = require("./routes/progressRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

// Connect to database and run migrations on startup
(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Wait for connection to be ready (connectDB resolves when connected)
    // Small delay to ensure db object is available
    await new Promise(resolve => setTimeout(resolve, 100));

    // Run automatic migrations if enabled
    if (isAutoMigrationEnabled()) {
      console.log("Running automatic database migrations...");
      const db = mongoose.connection.db;
      if (db) {
        await runMigrations(db);
      } else {
        console.log("⚠ Database object not available, skipping migrations");
      }
    } else {
      console.log("Automatic migrations disabled (set AUTO_MIGRATE=false to disable)");
    }

    // Bootstrap: ensure admins collection exists and optionally seed a default admin
    try {
      // Ensure unique index on email (idempotent)
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
    // Don't exit - let server attempt to start anyway
  }
})();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup Socket.IO with authentication
setupSocketIO(io);

// Inject Socket.IO instance into controllers
progressController.setIO(io);
notificationController.setIO(io);

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/progress", progressRoutes);
app.use("/api/notifications", notificationRoutes);

// Auth and User Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/time-logs", require("./routes/timeLogRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
