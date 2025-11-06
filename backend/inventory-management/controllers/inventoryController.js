const inventoryService = require('../services/inventoryService');

class InventoryController {
  
  /**
   * Get all parts with pagination and filtering
   */
  async getAllParts(req, res) {
    try {
      const result = await inventoryService.getAllParts(req.query);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching parts',
        error: error.message
      });
    }
  }

  /**
   * Get single part by ID
   */
  async getPartById(req, res) {
    try {
      const part = await inventoryService.getPartById(req.params.id);
      
      res.status(200).json({
        success: true,
        data: part
      });
    } catch (error) {
      const statusCode = error.message === 'Part not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create new part
   */
  async createPart(req, res) {
    try {
      const part = await inventoryService.createPart(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Part created successfully',
        data: part
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Part number already exists'
        });
      }

      res.status(400).json({
        success: false,
        message: 'Error creating part',
        error: error.message
      });
    }
  }

  /**
   * Update part
   */
  async updatePart(req, res) {
    try {
      const part = await inventoryService.updatePart(req.params.id, req.body, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Part updated successfully',
        data: part
      });
    } catch (error) {
      const statusCode = error.message === 'Part not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete part (soft delete)
   */
  async deletePart(req, res) {
    try {
      await inventoryService.deletePart(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Part deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Part not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Adjust stock (IN/OUT/ADJUSTMENT)
   */
  async adjustStock(req, res) {
    try {
      const result = await inventoryService.adjustStock(req.body, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Stock adjusted successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error adjusting stock',
        error: error.message
      });
    }
  }

  /**
   * Get inventory transactions for a part
   */
  async getPartTransactions(req, res) {
    try {
      const result = await inventoryService.getPartTransactions(
        req.params.id, 
        req.query.page, 
        req.query.limit
      );
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching transactions',
        error: error.message
      });
    }
  }

  /**
   * Get reorder alerts
   */
  async getReorderAlerts(req, res) {
    try {
      const result = await inventoryService.getReorderAlerts(req.query);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching reorder alerts',
        error: error.message
      });
    }
  }

  /**
   * Acknowledge reorder alert
   */
  async acknowledgeAlert(req, res) {
    try {
      const alert = await inventoryService.acknowledgeAlert(
        req.params.id, 
        req.user.id, 
        req.body.notes
      );
      
      res.status(200).json({
        success: true,
        message: 'Alert acknowledged successfully',
        data: alert
      });
    } catch (error) {
      const statusCode = error.message === 'Alert not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get inventory dashboard data
   */
  async getDashboardData(req, res) {
    try {
      const dashboardData = await inventoryService.getDashboardData();
      
      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message
      });
    }
  }

  /**
   * Get low stock parts report
   */
  async getLowStockReport(req, res) {
    try {
      const result = await inventoryService.getLowStockReport(req.query);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock report',
        error: error.message
      });
    }
  }

  /**
   * Get transaction report
   */
  async getTransactionReport(req, res) {
    try {
      const result = await inventoryService.getTransactionReport(req.query);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching transaction report',
        error: error.message
      });
    }
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(req, res) {
    try {
      const result = await inventoryService.getInventorySummary(req.query);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory summary',
        error: error.message
      });
    }
  }

  /**
   * Get all transactions
   */
  async getAllTransactions(req, res) {
    try {
      const result = await inventoryService.getAllTransactions(req.query);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching transactions',
        error: error.message
      });
    }
  }

  /**
   * Create new transaction
   */
  async createTransaction(req, res) {
    try {
      const transaction = await inventoryService.createTransaction(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating transaction',
        error: error.message
      });
    }
  }

  /**
   * Get category analysis report
   */
  async getCategoryAnalysis(req, res) {
    try {
      const analysis = await inventoryService.getCategoryAnalysis();
      
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category analysis',
        error: error.message
      });
    }
  }

  /**
   * Get inventory value report
   */
  async getInventoryValueReport(req, res) {
    try {
      const valueReport = await inventoryService.getInventoryValueReport();
      
      res.status(200).json({
        success: true,
        data: valueReport
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory value report',
        error: error.message
      });
    }
  }
}

module.exports = new InventoryController();