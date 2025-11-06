/**
 * Quick script to get vehicle IDs for testing
 * Run: node getVehicleIds.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Vehicle = require("./models/vehicle");

const getVehicleIds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all vehicles
    const vehicles = await Vehicle.find().populate("owner", "name email");

    if (vehicles.length === 0) {
      console.log("❌ No vehicles found in database!");
      console.log("💡 Run: npm run seed:ead to create sample data\n");
    } else {
      console.log(`📋 Found ${vehicles.length} vehicles:\n`);

      vehicles.forEach((vehicle, index) => {
        console.log(
          `${index + 1}. ${vehicle.make} ${vehicle.model} (${vehicle.year})`
        );
        console.log(`   Plate: ${vehicle.plateNumber}`);
        console.log(
          `   Owner: ${vehicle.owner?.name || "No owner"} (${
            vehicle.owner?.email || "N/A"
          })`
        );
        console.log(`   🔑 Vehicle ID: ${vehicle._id}`);
        console.log(`   Status: ${vehicle.status}\n`);
      });

      // Show example for first vehicle
      if (vehicles.length > 0) {
        console.log("📝 EXAMPLE REQUEST:");
        console.log("==================");
        console.log(`POST http://localhost:5000/api/services/request`);
        console.log(`Authorization: Bearer <your-token>`);
        console.log(`Content-Type: application/json\n`);
        console.log(`{`);
        console.log(`  "serviceType": "Oil Change",`);
        console.log(`  "name": "Regular Maintenance",`);
        console.log(`  "description": "Need oil change",`);
        console.log(`  "vehicleId": "${vehicles[0]._id}",`);
        console.log(`  "customerNotes": "Please use synthetic oil"`);
        console.log(`}\n`);
      }
    }

    await mongoose.connection.close();
    console.log("✅ Connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

getVehicleIds();
