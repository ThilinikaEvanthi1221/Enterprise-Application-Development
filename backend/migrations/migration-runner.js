/**
 * Migration Runner
 * Executes database migrations in order
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Migration tracking schema
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  executedAt: { type: Date, default: Date.now }
});

// Check if model already exists before creating
let Migration;
try {
  Migration = mongoose.model("Migration");
} catch (error) {
  Migration = mongoose.model("Migration", migrationSchema);
}

class MigrationRunner {
  constructor() {
    this.migrations = [];
    this.loadMigrations();
  }

  loadMigrations() {
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => 
        file.endsWith('.js') && 
        file !== 'migration-runner.js' &&
        !file.startsWith('_') // Skip any test or utility files
      )
      .sort();

    for (const file of files) {
      const migration = require(path.join(migrationsDir, file));
      const name = path.basename(file, '.js');
      this.migrations.push({ name, file, ...migration });
    }

    console.log(`Loaded ${this.migrations.length} migrations`);
  }

  async connect() {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not set in environment");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }

  async getExecutedMigrations() {
    try {
      const migrations = await Migration.find({});
      return new Set(migrations.map(m => m.name));
    } catch (error) {
      // If migrations collection doesn't exist, return empty set
      return new Set();
    }
  }

  async recordMigration(name, direction) {
    const db = mongoose.connection.db;
    if (direction === 'up') {
      await Migration.findOneAndUpdate(
        { name },
        { name, executedAt: new Date() },
        { upsert: true }
      );
    } else {
      await Migration.deleteOne({ name });
    }
  }

  async run(direction = 'up', specificMigration = null) {
    try {
      await this.connect();

      const db = mongoose.connection.db;
      const executedMigrations = await this.getExecutedMigrations();

      const migrationsToRun = specificMigration
        ? this.migrations.filter(m => m.name === specificMigration)
        : direction === 'up'
          ? this.migrations.filter(m => !executedMigrations.has(m.name))
          : this.migrations.filter(m => executedMigrations.has(m.name)).reverse();

      if (migrationsToRun.length === 0) {
        console.log(`No migrations to ${direction}`);
        return;
      }

      console.log(`\n=== Running ${migrationsToRun.length} migration(s) ===\n`);

      for (const migration of migrationsToRun) {
        try {
          console.log(`\n--- ${migration.name} (${direction.toUpperCase()}) ---`);
          
          if (direction === 'up') {
            await migration.up(db);
            await this.recordMigration(migration.name, 'up');
          } else {
            await migration.down(db);
            await this.recordMigration(migration.name, 'down');
          }

          console.log(`✓ ${migration.name} completed\n`);
        } catch (error) {
          console.error(`✗ ${migration.name} failed:`, error);
          throw error;
        }
      }

      console.log("\n=== All migrations completed successfully ===\n");
    } catch (error) {
      console.error("Migration error:", error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async status() {
    try {
      await this.connect();
      const executedMigrations = await this.getExecutedMigrations();

      console.log("\n=== Migration Status ===\n");
      console.log(`Total migrations: ${this.migrations.length}`);
      console.log(`Executed: ${executedMigrations.size}`);
      console.log(`Pending: ${this.migrations.length - executedMigrations.size}\n`);

      console.log("Migration Details:");
      for (const migration of this.migrations) {
        const status = executedMigrations.has(migration.name) ? "✓ Executed" : "○ Pending";
        const executed = executedMigrations.has(migration.name);
        let date = "";
        if (executed) {
          const record = await Migration.findOne({ name: migration.name });
          date = record ? ` (${record.executedAt.toISOString()})` : "";
        }
        console.log(`  ${status} - ${migration.name}${date}`);
      }
      console.log();
    } catch (error) {
      console.error("Error checking status:", error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
const runner = new MigrationRunner();
const command = process.argv[2];
const argument = process.argv[3];

(async () => {
  try {
    switch (command) {
      case 'up':
        await runner.run('up', argument);
        break;
      case 'down':
        await runner.run('down', argument);
        break;
      case 'status':
        await runner.status();
        break;
      default:
        console.log(`
MongoDB Migration Runner

Usage:
  node migration-runner.js <command> [migration-name]

Commands:
  up [migration-name]    Run pending migrations (or specific migration)
  down [migration-name]   Rollback last migration (or specific migration)
  status                 Show migration status

Examples:
  node migration-runner.js up
  node migration-runner.js up 001_initial_indexes
  node migration-runner.js down
  node migration-runner.js status
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
})();

