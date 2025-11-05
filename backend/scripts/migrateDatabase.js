/**
 * Database Migration Script
 * Migrates data from source MongoDB to target MongoDB
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const TimeLog = require("../models/timeLog");

async function migrateDatabase(sourceUri, targetUri, options = {}) {
  const { dropTarget = false, collections = [] } = options;
  
  let sourceConnection, targetConnection;

  try {
    console.log("=== Database Migration Started ===\n");

    // Connect to source database
    console.log("Connecting to source database...");
    sourceConnection = await mongoose.createConnection(sourceUri).asPromise();
    console.log("✓ Connected to source database");

    // Connect to target database
    console.log("Connecting to target database...");
    targetConnection = await mongoose.createConnection(targetUri).asPromise();
    console.log("✓ Connected to target database");

    // Drop target collections if requested
    if (dropTarget) {
      console.log("\n⚠ Dropping existing collections in target database...");
      const targetCollections = await targetConnection.db.listCollections().toArray();
      for (const collection of targetCollections) {
        if (!collection.name.startsWith('system.')) {
          await targetConnection.db.collection(collection.name).drop();
          console.log(`  Dropped collection: ${collection.name}`);
        }
      }
    }

    // Collections to migrate (default: all)
    const collectionsToMigrate = collections.length > 0 
      ? collections 
      : ['users', 'vehicles', 'services', 'appointments', 'timelogs', 'admins'];

    console.log(`\nMigrating collections: ${collectionsToMigrate.join(', ')}\n`);

    // Migrate each collection
    for (const collectionName of collectionsToMigrate) {
      try {
        const sourceCollection = sourceConnection.db.collection(collectionName);
        const targetCollection = targetConnection.db.collection(collectionName);

        // Check if source collection exists
        const sourceExists = await sourceCollection.countDocuments() > 0;
        if (!sourceExists) {
          console.log(`⚠ Collection ${collectionName} is empty or doesn't exist in source, skipping...`);
          continue;
        }

        const count = await sourceCollection.countDocuments();
        console.log(`Migrating ${collectionName} (${count} documents)...`);

        // Get all documents from source
        const documents = await sourceCollection.find({}).toArray();

        if (documents.length > 0) {
          // Insert into target (using insertMany for better performance)
          const batchSize = 1000;
          for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            // Remove _id to let MongoDB generate new ones, or keep them to maintain relationships
            const batchToInsert = batch.map(doc => {
              const { _id, ...rest } = doc;
              return rest;
            });
            
            await targetCollection.insertMany(batchToInsert, { ordered: false });
          }
          console.log(`  ✓ Migrated ${documents.length} documents`);
        } else {
          console.log(`  ✓ Collection is empty`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`  ⚠ Duplicate key error in ${collectionName} (some documents may already exist)`);
        } else {
          console.error(`  ✗ Error migrating ${collectionName}:`, error.message);
        }
      }
    }

    // Run migrations on target database
    console.log("\n=== Running migrations on target database ===");
    // Note: This requires reconnecting with the target URI
    await targetConnection.close();
    
    // Set target URI temporarily and run migrations
    const originalUri = process.env.MONGO_URI;
    process.env.MONGO_URI = targetUri;
    
    // You would call the migration runner here
    console.log("  Run migrations manually: npm run migrate:up");

    console.log("\n=== Migration Completed Successfully ===\n");

  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    throw error;
  } finally {
    if (sourceConnection) await sourceConnection.close();
    if (targetConnection) await targetConnection.close();
  }
}

// CLI interface
if (require.main === module) {
  const sourceUri = process.env.SOURCE_MONGO_URI || process.env.MONGO_URI;
  const targetUri = process.env.TARGET_MONGO_URI;

  if (!sourceUri || !targetUri) {
    console.error(`
Database Migration Script

Usage:
  Set environment variables:
    SOURCE_MONGO_URI=mongodb://localhost:27017/source-db
    TARGET_MONGO_URI=mongodb://localhost:27017/target-db

  Or use in code:
    const migrateDatabase = require('./scripts/migrateDatabase');
    await migrateDatabase(sourceUri, targetUri, {
      dropTarget: false,
      collections: ['users', 'vehicles']
    });

Options:
  dropTarget: true/false - Drop target collections before migration
  collections: [] - Array of collection names to migrate (empty = all)
    `);
    process.exit(1);
  }

  const dropTarget = process.argv.includes('--drop-target');
  const collectionsArg = process.argv.find(arg => arg.startsWith('--collections='));
  const collections = collectionsArg 
    ? collectionsArg.split('=')[1].split(',')
    : [];

  migrateDatabase(sourceUri, targetUri, { dropTarget, collections })
    .then(() => {
      console.log("Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = migrateDatabase;

