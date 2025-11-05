const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'DAMAGE', 'RETURN']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  previousStock: {
    type: Number,
    required: true,
    min: [0, 'Previous stock cannot be negative']
  },
  newStock: {
    type: Number,
    required: true,
    min: [0, 'New stock cannot be negative']
  },
  unitPrice: {
    type: Number,
    min: [0, 'Unit price cannot be negative']
  },
  totalValue: {
    type: Number,
    min: [0, 'Total value cannot be negative']
  },
  reference: {
    type: String,
    trim: true // Purchase order, work order, etc.
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    from: {
      warehouse: String,
      section: String,
      shelf: String,
      bin: String
    },
    to: {
      warehouse: String,
      section: String,
      shelf: String,
      bin: String
    }
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  approvalDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
inventoryTransactionSchema.index({ part: 1, createdAt: -1 });
inventoryTransactionSchema.index({ transactionType: 1 });
inventoryTransactionSchema.index({ performedBy: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total value
inventoryTransactionSchema.pre('save', function(next) {
  if (this.unitPrice && this.quantity) {
    this.totalValue = this.unitPrice * this.quantity;
  }
  next();
});

// Static method to get transaction summary
inventoryTransactionSchema.statics.getTransactionSummary = async function(partId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        part: mongoose.Types.ObjectId(partId),
        createdAt: {
          $gte: startDate || new Date(0),
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$transactionType',
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: '$totalValue' },
        count: { $sum: 1 }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);