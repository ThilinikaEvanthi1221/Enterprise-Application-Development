/**
 * Migration: 002_add_timestamps
 * Description: Ensures all documents have createdAt and updatedAt timestamps
 */

module.exports = {
  up: async (db) => {
    console.log("Running migration: 002_add_timestamps (UP)");

    const collections = [
      { name: 'services', model: 'Service' },
      { name: 'vehicles', model: 'Vehicle' },
      { name: 'appointments', model: 'Appointment' },
      { name: 'timelogs', model: 'TimeLog' }
    ];

    for (const { name: collectionName } of collections) {
      try {
        const collection = db.collection(collectionName);
        const now = new Date();

        // Add timestamps to documents that don't have them
        const result = await collection.updateMany(
          {
            $or: [
              { createdAt: { $exists: false } },
              { updatedAt: { $exists: false } }
            ]
          },
          {
            $set: {
              createdAt: now,
              updatedAt: now
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✓ Added timestamps to ${result.modifiedCount} documents in ${collectionName}`);
        } else {
          console.log(`✓ All documents in ${collectionName} already have timestamps`);
        }
      } catch (error) {
        console.error(`Error updating ${collectionName}:`, error.message);
      }
    }

    console.log("✓ Migration 002_add_timestamps completed successfully");
  },

  down: async (db) => {
    console.log("Running migration: 002_add_timestamps (DOWN)");
    console.log("⚠ Note: This migration does not remove timestamps to preserve data integrity");
    console.log("✓ Migration 002_add_timestamps rollback completed (no action taken)");
  }
};

