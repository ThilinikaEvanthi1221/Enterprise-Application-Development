const { Part, InventoryTransaction, ReorderAlert } = require('../models');
const mongoose = require('mongoose');

class InventoryService {
  
  /**
   * Get all parts with filtering and pagination
   */
  async getAllParts(filters = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const query = { isActive: true };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by stock status
    if (stockStatus) {
      switch (stockStatus) {
        case 'low':
          query.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
          break;
        case 'out':
          query.currentStock = 0;
          break;
        case 'overstock':
          query.$expr = { $gte: ['$currentStock', '$maxStockLevel'] };
          break;
        case 'reorder':
          query.isReorderRequired = true;
          break;
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const parts = await Part.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Part.countDocuments(query);

    return {
      data: parts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Get part by ID
   */
  async getPartById(partId) {
    const part = await Part.findById(partId)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!part) {
      throw new Error('Part not found');
    }
    
    return part;
  }

  /**
   * Create new part
   */
  async createPart(partData, userId) {
    const part = new Part({
      ...partData,
      createdBy: userId
    });

    const savedPart = await part.save();

    // Create reorder alert if stock is low
    await ReorderAlert.createAlertForPart(savedPart._id);

    return await Part.findById(savedPart._id)
      .populate('createdBy', 'name email');
  }

  /**
   * Update part
   */
  async updatePart(partId, updates, userId) {
    const part = await Part.findByIdAndUpdate(
      partId,
      { ...updates, updatedBy: userId },
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');

    if (!part) {
      throw new Error('Part not found');
    }

    // Update or create reorder alert
    await ReorderAlert.createAlertForPart(partId);

    return part;
  }

  /**
   * Delete part (soft delete)
   */
  async deletePart(partId, userId) {
    const part = await Part.findByIdAndUpdate(
      partId,
      { 
        isActive: false,
        updatedBy: userId
      },
      { new: true }
    );

    if (!part) {
      throw new Error('Part not found');
    }

    return part;
  }

  /**
   * Adjust stock with transaction
   */
  async adjustStock(adjustmentData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { partId, transactionType, quantity, unitPrice, reference, notes, reason } = adjustmentData;

      if (!['IN', 'OUT', 'ADJUSTMENT'].includes(transactionType)) {
        throw new Error('Invalid transaction type. Must be IN, OUT, or ADJUSTMENT');
      }

      if (!partId) {
        throw new Error('Part ID is required');
      }

      if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }

      const part = await Part.findById(partId).session(session);
      if (!part) {
        throw new Error('Part not found');
      }

      const previousStock = part.currentStock;
      let newStock;

      switch (transactionType) {
        case 'IN':
          newStock = previousStock + quantity;
          break;
        case 'OUT':
          if (previousStock < quantity) {
            throw new Error('Insufficient stock');
          }
          newStock = previousStock - quantity;
          break;
        case 'ADJUSTMENT':
          newStock = quantity; // Direct set to new quantity
          break;
      }

      // Update part stock
      part.currentStock = newStock;
      if (transactionType === 'IN') {
        part.lastRestockDate = new Date();
      }
      await part.save({ session });

      // Create transaction record
      const transaction = new InventoryTransaction({
        part: partId,
        transactionType,
        quantity: transactionType === 'ADJUSTMENT' ? Math.abs(quantity - previousStock) : quantity,
        previousStock,
        newStock,
        unitPrice: unitPrice || part.unitPrice,
        reference: reference || reason,
        notes: notes || `Stock ${transactionType.toLowerCase()} - ${reason || 'Manual adjustment'}`,
        performedBy: userId
      });
      await transaction.save({ session });

      // Handle reorder alerts
      if (newStock <= part.minStockLevel) {
        await ReorderAlert.createAlertForPart(partId);
      } else {
        await ReorderAlert.resolveAlertsForPart(partId, userId);
      }

      await session.commitTransaction();

      const updatedPart = await Part.findById(partId)
        .populate('createdBy updatedBy', 'name email');

      return {
        part: updatedPart,
        transaction: await transaction.populate('performedBy', 'name email')
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get transactions for a part
   */
  async getPartTransactions(partId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const transactions = await InventoryTransaction.find({ part: partId })
      .populate('part', 'partNumber name')
      .populate('performedBy approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InventoryTransaction.countDocuments({ part: partId });

    return {
      data: transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Get reorder alerts
   */
  async getReorderAlerts(filters = {}) {
    const { status = 'ACTIVE', priority, page = 1, limit = 10 } = filters;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;

    const alerts = await ReorderAlert.find(query)
      .populate('part', 'partNumber name category currentStock minStockLevel maxStockLevel')
      .populate('acknowledgedBy resolvedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReorderAlert.countDocuments(query);

    return {
      data: alerts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId, userId, notes = '') {
    const alert = await ReorderAlert.findByIdAndUpdate(
      alertId,
      {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        notes
      },
      { new: true }
    ).populate('part', 'partNumber name');

    if (!alert) {
      throw new Error('Alert not found');
    }

    return alert;
  }

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    const totalParts = await Part.countDocuments({ isActive: true });
    const lowStockParts = await Part.countDocuments({ 
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });
    const outOfStockParts = await Part.countDocuments({ 
      isActive: true,
      currentStock: 0 
    });
    const activeAlerts = await ReorderAlert.countDocuments({ status: 'ACTIVE' });

    // Calculate total inventory value
    const inventoryValueResult = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } }
        }
      }
    ]);
    const inventoryValue = inventoryValueResult.length > 0 ? inventoryValueResult[0].totalValue : 0;

    // Recent transactions
    const recentTransactions = await InventoryTransaction.find()
      .populate('part', 'partNumber name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Stock by category
    const stockByCategory = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalParts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$minStockLevel'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return {
      summary: {
        totalParts,
        lowStockParts,
        outOfStockParts,
        inventoryValue,
        activeAlerts
      },
      recentTransactions,
      stockByCategory
    };
  }

  /**
   * Get category analysis
   */
  async getCategoryAnalysis() {
    const categoryAnalysis = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalParts: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
          averagePrice: { $avg: '$unitPrice' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$minStockLevel'] }, 1, 0]
            }
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    return {
      categories: categoryAnalysis,
      totalCategories: categoryAnalysis.length,
      timestamp: new Date()
    };
  }

  /**
   * Get inventory value report
   */
  async getInventoryValueReport() {
    const valueAnalysis = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalParts: { $sum: 1 },
          totalStockQuantity: { $sum: '$currentStock' },
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
          averagePartValue: { $avg: { $multiply: ['$currentStock', '$unitPrice'] } }
        }
      }
    ]);

    const topValueParts = await Part.find({ isActive: true })
      .select('partNumber name currentStock unitPrice category')
      .addFields({
        totalValue: { $multiply: ['$currentStock', '$unitPrice'] }
      })
      .sort({ totalValue: -1 })
      .limit(10);

    const categoryValues = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
          partCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    return {
      summary: valueAnalysis[0] || {
        totalParts: 0,
        totalStockQuantity: 0,
        totalValue: 0,
        averagePartValue: 0
      },
      topValueParts,
      categoryValues,
      timestamp: new Date()
    };
  }

  /**
   * Get low stock report
   */
  async getLowStockReport(filters = {}) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const parts = await Part.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    })
    .populate('createdBy', 'name')
    .sort({ currentStock: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Part.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });

    return {
      data: parts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Get transaction report
   */
  async getTransactionReport(filters = {}) {
    const { 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate, 
      transactionType,
      partId 
    } = filters;

    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (transactionType && transactionType !== 'all') {
      query.transactionType = transactionType;
    }

    if (partId) {
      query.part = partId;
    }

    const skip = (page - 1) * limit;

    const transactions = await InventoryTransaction.find(query)
      .populate('part', 'partNumber name category')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InventoryTransaction.countDocuments(query);

    return {
      data: transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary() {
    const totalParts = await Part.countDocuments({ isActive: true });
    const totalValue = await Part.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } } } }
    ]);

    const stockDistribution = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          inStock: { $sum: { $cond: [{ $gt: ['$currentStock', '$minStockLevel'] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $and: [{ $lte: ['$currentStock', '$minStockLevel'] }, { $gt: ['$currentStock', 0] }] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$currentStock', 0] }, 1, 0] } }
        }
      }
    ]);

    const categoryBreakdown = await Part.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
          averageStock: { $avg: '$currentStock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      totalParts,
      totalValue: totalValue[0]?.total || 0,
      stockDistribution: stockDistribution[0] || { inStock: 0, lowStock: 0, outOfStock: 0 },
      categoryBreakdown
    };
  }

  /**
   * Get all transactions
   */
  async getAllTransactions(filters = {}) {
    return this.getTransactionReport(filters);
  }

  /**
   * Create transaction
   */
  async createTransaction(transactionData, userId) {
    const { partId, transactionType, quantity, notes, reference } = transactionData;
    
    return this.adjustStock({
      partId,
      transactionType,
      quantity,
      notes,
      reference
    }, userId);
  }
}

module.exports = new InventoryService();