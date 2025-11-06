const mongoose = require('mongoose');
const INVENTORY_CONFIG = require('../config/inventoryConfig');

const partSchema = new mongoose.Schema({
  partNumber: {
    type: String,
    required: [true, 'Part number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: INVENTORY_CONFIG.CATEGORIES,
    default: INVENTORY_CONFIG.DEFAULT_VALUES.category
  },
  manufacturer: {
    type: String,
    trim: true
  },
  supplier: {
    type: String,
    trim: true
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock level cannot be negative'],
    default: INVENTORY_CONFIG.DEFAULT_VALUES.minStockLevel
  },
  maxStockLevel: {
    type: Number,
    required: [true, 'Maximum stock level is required'],
    min: [0, 'Maximum stock level cannot be negative'],
    default: INVENTORY_CONFIG.DEFAULT_VALUES.maxStockLevel
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: INVENTORY_CONFIG.DEFAULT_VALUES.currency,
    enum: INVENTORY_CONFIG.CURRENCIES
  },
  location: {
    warehouse: {
      type: String,
      default: INVENTORY_CONFIG.DEFAULT_VALUES.warehouse
    },
    section: {
      type: String,
      default: INVENTORY_CONFIG.DEFAULT_VALUES.section
    },
    shelf: {
      type: String,
      default: INVENTORY_CONFIG.DEFAULT_VALUES.shelf
    },
    bin: {
      type: String,
      default: INVENTORY_CONFIG.DEFAULT_VALUES.bin
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isReorderRequired: {
    type: Boolean,
    default: false
  },
  lastRestockDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance (partNumber already has unique index from schema)
partSchema.index({ category: 1 });
partSchema.index({ isActive: 1 });
partSchema.index({ isReorderRequired: 1 });
partSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to check reorder requirement
partSchema.pre('save', function(next) {
  if (this.currentStock <= this.minStockLevel) {
    this.isReorderRequired = true;
  } else {
    this.isReorderRequired = false;
  }
  next();
});

// Validate that max stock is greater than min stock
partSchema.pre('save', function(next) {
  if (this.maxStockLevel <= this.minStockLevel) {
    const error = new Error('Maximum stock level must be greater than minimum stock level');
    return next(error);
  }
  next();
});

// Virtual for stock status
partSchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) {
    return 'Out of Stock';
  } else if (this.currentStock <= this.minStockLevel) {
    return 'Low Stock';
  } else if (this.currentStock >= this.maxStockLevel) {
    return 'Overstock';
  } else {
    return 'In Stock';
  }
});

// Virtual for location string
partSchema.virtual('locationString').get(function() {
  return `${this.location.warehouse}-${this.location.section}-${this.location.shelf}-${this.location.bin}`;
});

// Ensure virtual fields are serialized
partSchema.set('toJSON', { virtuals: true });
partSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Part', partSchema);