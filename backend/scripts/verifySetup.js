const mongoose = require('mongoose');
const User = require('../models/user');
const { Part, ReorderAlert } = require('../inventory-management/models');
require('dotenv').config();

const testSetup = async () => {
  try {
    // Connect to database
    const mongoUri = `${process.env.MONGO_URI}enterprise_app_db?retryWrites=true&w=majority`;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Test user creation and roles
    const userCount = await User.countDocuments();
    console.log(`✅ Users in database: ${userCount}`);

    // Test different user roles
    const roles = await User.distinct('role');
    console.log(`✅ Available roles: ${roles.join(', ')}`);

    // Test inventory parts
    const partCount = await Part.countDocuments();
    console.log(`✅ Parts in database: ${partCount}`);

    // Test reorder alerts
    const alertCount = await ReorderAlert.countDocuments();
    console.log(`✅ Reorder alerts: ${alertCount}`);

    // Test role permissions
    const inventoryManager = await User.findOne({ role: 'inventory_manager' });
    if (inventoryManager) {
      console.log(`✅ Inventory Manager permissions: ${inventoryManager.permissions.join(', ')}`);
    }

    // Test low stock parts
    const lowStockParts = await Part.find({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });
    console.log(`✅ Low stock parts: ${lowStockParts.length}`);

    if (lowStockParts.length > 0) {
      console.log('   Low stock items:');
      lowStockParts.forEach(part => {
        console.log(`   - ${part.name} (${part.partNumber}): ${part.currentStock}/${part.minStockLevel}`);
      });
    }

    console.log('\n🎉 Setup verification completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('   Admin: admin@enterprise.com / admin123');
    console.log('   Inventory Manager: inventory.manager@enterprise.com / inventory123');
    console.log('   Service Manager: service.manager@enterprise.com / service123');
    console.log('   Mechanic: mechanic@enterprise.com / mechanic123');
    console.log('   Employee: employee@enterprise.com / employee123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup verification failed:', error);
    process.exit(1);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testSetup();
}

module.exports = { testSetup };