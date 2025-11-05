# Database Migrations

This directory contains database migration scripts for managing schema changes and indexes.

## What are Migrations?

Migrations are version-controlled scripts that:
- Create and manage database indexes for optimal query performance
- Ensure schema consistency across environments
- Track which migrations have been executed
- Allow rollback of changes when needed

## Migration Files

- `001_initial_indexes.js` - Creates all necessary indexes for collections
- `002_add_timestamps.js` - Ensures all documents have createdAt/updatedAt timestamps
- `migration-runner.js` - Executes migrations in order and tracks execution

## Quick Start

### Run All Pending Migrations
```bash
npm run migrate:up
```

### Check Migration Status
```bash
npm run migrate:status
```

### Rollback Last Migration
```bash
npm run migrate:down
```

### Run Specific Migration
```bash
node migrations/migration-runner.js up 001_initial_indexes
node migrations/migration-runner.js down 001_initial_indexes
```

## Creating New Migrations

1. Create a new migration file: `XXX_description.js`
   - Use sequential numbers (001, 002, 003, etc.)
   - Use descriptive names (snake_case)

2. Export `up` and `down` functions:
```javascript
module.exports = {
  up: async (db) => {
    // Migration logic here
    // db is the MongoDB database object
    await db.collection('collectionName').createIndex({ field: 1 });
  },

  down: async (db) => {
    // Rollback logic here
    await db.collection('collectionName').dropIndex('index_name');
  }
};
```

3. Run the migration:
```bash
npm run migrate:up
```

## Migration Execution

Migrations are executed in alphabetical order by filename. The runner:
- Tracks executed migrations in a `migrations` collection
- Only runs pending migrations (not already executed)
- Supports rollback of migrations
- Prevents running the same migration twice

## Indexes Created

### Users Collection
- `email` (unique) - Fast email lookups
- `role` - Filter by user role

### Vehicles Collection
- `plateNumber` (unique) - Fast plate number lookups
- `owner` - Find vehicles by owner
- `status` - Filter by vehicle status

### Services Collection
- `name` - Search services by name

### Appointments Collection
- `user` - Find appointments by user
- `vehicle` - Find appointments by vehicle
- `service` - Find appointments by service
- `scheduledAt` - Sort/filter by date
- `status` - Filter by appointment status
- `user + scheduledAt` (compound) - Find user appointments by date

### TimeLogs Collection
- `employee` - Find logs by employee
- `date` - Filter logs by date
- `employee + date` (compound) - Find employee logs by date

### Admins Collection
- `email` (unique) - Fast admin email lookups

## Database Migration (Moving Data)

To migrate data from one MongoDB database to another:

1. Set environment variables:
```env
SOURCE_MONGO_URI=mongodb://localhost:27017/source-db
TARGET_MONGO_URI=mongodb://localhost:27017/target-db
```

2. Run migration script:
```bash
npm run migrate:db
```

Options:
- `--drop-target` - Drop existing collections in target before migration
- `--collections=users,vehicles` - Migrate only specific collections

Example:
```bash
# Migrate all collections
npm run migrate:db

# Drop target and migrate only users and vehicles
SOURCE_MONGO_URI=... TARGET_MONGO_URI=... node scripts/migrateDatabase.js --drop-target --collections=users,vehicles
```

## Troubleshooting

### Migration Already Executed
If a migration was already run, it won't run again. Check status:
```bash
npm run migrate:status
```

### Index Already Exists
If an index already exists, MongoDB will throw an error. The migration will handle this gracefully, but you can manually check:
```javascript
db.collection('users').indexes()
```

### Migration Failed Midway
If a migration fails:
1. Check the error message
2. Fix the issue in the migration file
3. Manually clean up any partial changes
4. Run the migration again

### Rollback Failed
If rollback fails, you may need to manually undo changes. Check the migration's `down` function for what it tries to do.

## Best Practices

1. **Always backup your database** before running migrations in production
2. **Test migrations** on a development database first
3. **Keep migrations small** and focused on one task
4. **Make migrations idempotent** when possible (can run multiple times safely)
5. **Document complex migrations** in comments
6. **Never edit executed migrations** - create new ones instead

## Environment Setup

Ensure your `.env` file has:
```env
MONGO_URI=mongodb://localhost:27017/your-database-name
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

