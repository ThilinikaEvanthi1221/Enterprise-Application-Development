/**
 * Migration: 001_initial_indexes
 * Description: Creates initial indexes for all collections
 */

module.exports = {
  up: async (db) => {
    console.log("Running migration: 001_initial_indexes (UP)");

    // Users collection indexes
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
      await db.collection('users').createIndex({ role: 1 }, { name: 'role_index' });
      console.log("✓ Created indexes for users collection");
    } catch (error) {
      console.error("Error creating users indexes:", error.message);
    }

    // Vehicles collection indexes
    try {
      await db.collection('vehicles').createIndex({ plateNumber: 1 }, { unique: true, name: 'plateNumber_unique' });
      await db.collection('vehicles').createIndex({ owner: 1 }, { name: 'owner_index' });
      await db.collection('vehicles').createIndex({ status: 1 }, { name: 'status_index' });
      console.log("✓ Created indexes for vehicles collection");
    } catch (error) {
      console.error("Error creating vehicles indexes:", error.message);
    }

    // Services collection indexes
    try {
      await db.collection('services').createIndex({ name: 1 }, { name: 'name_index' });
      console.log("✓ Created indexes for services collection");
    } catch (error) {
      console.error("Error creating services indexes:", error.message);
    }

    // Appointments collection indexes
    try {
      await db.collection('appointments').createIndex({ user: 1 }, { name: 'user_index' });
      await db.collection('appointments').createIndex({ vehicle: 1 }, { name: 'vehicle_index' });
      await db.collection('appointments').createIndex({ service: 1 }, { name: 'service_index' });
      await db.collection('appointments').createIndex({ scheduledAt: 1 }, { name: 'scheduledAt_index' });
      await db.collection('appointments').createIndex({ status: 1 }, { name: 'status_index' });
      // Compound index for finding appointments by user and date
      await db.collection('appointments').createIndex({ user: 1, scheduledAt: 1 }, { name: 'user_scheduledAt_index' });
      console.log("✓ Created indexes for appointments collection");
    } catch (error) {
      console.error("Error creating appointments indexes:", error.message);
    }

    // TimeLogs collection indexes
    try {
      await db.collection('timelogs').createIndex({ employee: 1 }, { name: 'employee_index' });
      await db.collection('timelogs').createIndex({ date: 1 }, { name: 'date_index' });
      // Compound index for finding time logs by employee and date
      await db.collection('timelogs').createIndex({ employee: 1, date: 1 }, { name: 'employee_date_index' });
      console.log("✓ Created indexes for timelogs collection");
    } catch (error) {
      console.error("Error creating timelogs indexes:", error.message);
    }

    // Admin collection indexes (if exists)
    try {
      await db.collection('admins').createIndex({ email: 1 }, { unique: true, name: 'admin_email_unique' });
      console.log("✓ Created indexes for admins collection");
    } catch (error) {
      console.log("⚠ Admins collection indexes skipped (collection may not exist)");
    }

    console.log("✓ Migration 001_initial_indexes completed successfully");
  },

  down: async (db) => {
    console.log("Running migration: 001_initial_indexes (DOWN)");

    const collections = ['users', 'vehicles', 'services', 'appointments', 'timelogs', 'admins'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        
        // Drop all indexes except _id
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await collection.dropIndex(index.name);
            console.log(`✓ Dropped index ${index.name} from ${collectionName}`);
          }
        }
      } catch (error) {
        console.log(`⚠ Error dropping indexes from ${collectionName}:`, error.message);
      }
    }

    console.log("✓ Migration 001_initial_indexes rolled back successfully");
  }
};

