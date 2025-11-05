const INVENTORY_CONFIG = require('../config/inventoryConfig');

class ConfigController {
  
  /**
   * Get inventory configuration
   */
  async getInventoryConfig(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          categories: INVENTORY_CONFIG.CATEGORIES,
          currencies: INVENTORY_CONFIG.CURRENCIES,
          transactionTypes: INVENTORY_CONFIG.TRANSACTION_TYPES,
          alertTypes: INVENTORY_CONFIG.ALERT_TYPES,
          alertPriorities: INVENTORY_CONFIG.ALERT_PRIORITIES,
          alertStatuses: INVENTORY_CONFIG.ALERT_STATUSES,
          defaultValues: INVENTORY_CONFIG.DEFAULT_VALUES
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching configuration',
        error: error.message
      });
    }
  }

  /**
   * Get categories only
   */
  async getCategories(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: INVENTORY_CONFIG.CATEGORIES
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  }

  /**
   * Update configuration (admin/manager only)
   */
  async updateConfig(req, res) {
    try {
      const { section } = req.params;
      const updates = req.body;

      console.log(`Updating config section: ${section}`, updates);
      
      // Validate section
      const validSections = ['general', 'inventory', 'categories', 'notifications'];
      if (!validSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: `Invalid configuration section: ${section}. Valid sections: ${validSections.join(', ')}`
        });
      }

      // Log user info for debugging
      console.log('User updating config:', {
        userId: req.user?.id,
        userRole: req.userRole,
        section,
        updateKeys: Object.keys(updates)
      });

      // For now, return a success response
      // In a real application, you would update the configuration in a database
      res.status(200).json({
        success: true,
        message: `Configuration section '${section}' updated successfully`,
        data: {
          section,
          updates,
          timestamp: new Date(),
          updatedBy: req.user?.id
        }
      });
    } catch (error) {
      console.error('Config update error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating configuration',
        error: error.message
      });
    }
  }
}

module.exports = new ConfigController();