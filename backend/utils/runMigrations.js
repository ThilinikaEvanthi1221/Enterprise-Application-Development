/**
 * Automatic Migration Runner
 * Runs migrations using existing MongoDB connection
 */

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  executedAt: { type: Date, default: Date.now }
});

const Migration = mongoose.model("Migration", migrationSchema);

/**
 * Run pending migrations automatically
 * @param {Object} db - MongoDB native database object (mongoose.connection.db)
 * @returns {Promise<void>}
 */
async function runMigrations(db) {
  try {
    // Load migrations
    const migrationsDir = path.join(__dirname, "../migrations");
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migration-runner.js')
      .sort();

    const migrations = [];
    for (const file of files) {
      const migration = require(path.join(migrationsDir, file));
      const name = path.basename(file, '.js');
      migrations.push({ name, file, ...migration });
    }

    if (migrations.length === 0) {
      console.log("No migrations found");
      return;
    }

    // Get executed migrations
    let executedMigrations = new Set();
    try {
      const records = await Migration.find({});
      executedMigrations = new Set(records.map(m => m.name));
    } catch (error) {
      // If migrations collection doesn't exist yet, start with empty set
      executedMigrations = new Set();
    }

    // Filter pending migrations
    const pendingMigrations = migrations.filter(m => !executedMigrations.has(m.name));

    if (pendingMigrations.length === 0) {
      console.log("✓ All migrations are up to date");
      return;
    }

    console.log(`\n=== Running ${pendingMigrations.length} pending migration(s) ===\n`);

    // Run each pending migration
    for (const migration of pendingMigrations) {
      try {
        console.log(`--- Running migration: ${migration.name} ---`);
        
        await migration.up(db);
        
        // Record migration execution
        await Migration.findOneAndUpdate(
          { name: migration.name },
          { name: migration.name, executedAt: new Date() },
          { upsert: true }
        );
        
        console.log(`✓ Migration ${migration.name} completed\n`);
      } catch (error) {
        console.error(`✗ Migration ${migration.name} failed:`, error.message);
        // Continue with other migrations instead of stopping
        console.log(`⚠ Continuing with remaining migrations...\n`);
      }
    }

    console.log("=== Automatic migrations completed ===\n");
  } catch (error) {
    console.error("Error running migrations:", error);
    // Don't throw - let server start even if migrations fail
    // This prevents migrations from blocking server startup
  }
}

/**
 * Check if auto-migration is enabled
 * @returns {boolean}
 */
function isAutoMigrationEnabled() {
  // Default to enabled, but can be disabled via environment variable
  return process.env.AUTO_MIGRATE !== "false";
}

module.exports = {
  runMigrations,
  isAutoMigrationEnabled
};

