const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, sparse: true, unique: true },

    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    // Password required only if googleId does not exist
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    role: {
      type: String,
      enum: ["customer", "employee", "admin"],
      default: "customer",
    },

    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: "" },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Exclude password from JSON responses
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

// Exclude password from Object responses
userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
