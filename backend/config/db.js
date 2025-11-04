const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect to the main database
    const mongoUri = `${process.env.MONGO_URI}enterprise_app_db?retryWrites=true&w=majority`;
    await mongoose.connect(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("MongoDB Connected to enterprise_app_db...");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
