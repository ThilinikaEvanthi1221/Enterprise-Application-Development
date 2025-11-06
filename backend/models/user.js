const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() {
    // Password is required only if googleId is not present
    return !this.googleId;
  }},
  role: { type: String, enum: ["customer", "employee", "admin"], default: "customer" },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

// Exclude password from JSON responses
userSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.password;
    return ret;
  }
});

// Exclude password from Object responses
userSchema.set('toObject', {
  transform: function(doc, ret, options) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model("User", userSchema);
