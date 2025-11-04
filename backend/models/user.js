const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: [
      "customer", 
      "employee", 
      "inventory_manager", 
      "admin",
      "service_manager",
      "mechanic"
    ], 
    default: "customer" 
  },
  permissions: [{
    type: String,
    enum: [
      "inventory_read",
      "inventory_write", 
      "inventory_delete",
      "parts_manage",
      "stock_adjust",
      "alerts_manage",
      "reports_view",
      "user_manage",
      "config_manage",
      "all_access"
    ]
  }],
  department: {
    type: String,
    enum: ["inventory", "service", "admin", "customer_service", "finance"],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full permissions based on role
userSchema.virtual('fullPermissions').get(function() {
  const rolePermissions = {
    customer: [],
    employee: ["inventory_read", "reports_view"],
    inventory_manager: [
      "inventory_read", "inventory_write", "parts_manage", 
      "stock_adjust", "alerts_manage", "reports_view"
    ],
    service_manager: [
      "inventory_read", "inventory_write", "parts_manage", 
      "stock_adjust", "reports_view"
    ],
    mechanic: ["inventory_read", "parts_manage"],
    admin: ["all_access"]
  };
  
  return [...new Set([...rolePermissions[this.role] || [], ...(this.permissions || [])])];
});

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'admin') return true;
  return this.fullPermissions.includes(permission);
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("User", userSchema);
