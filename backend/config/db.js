const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("\n⚠️  Troubleshooting steps:");
    console.error("1. Check your internet connection");
    console.error("2. Verify MongoDB Atlas cluster is running (not paused)");
    console.error("3. Check if your IP is whitelisted in MongoDB Atlas");
    console.error("4. Verify the MONGO_URI in .env file is correct");
    console.error("\n⚠️  Server will continue running, but database operations will fail.");
    // Don't exit - allow server to run for testing frontend
    // process.exit(1);
  }
};

module.exports = connectDB;
