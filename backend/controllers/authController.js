const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require("../services/emailService");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.json({ msg: "Signup successful", user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('=== Login Attempt ===');
    console.log('Headers:', req.headers);
    console.log('Login request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ msg: "Email and password are required" });
    }
    
    const user = await User.findOne({ email });
    console.log('Database query result:', user);
    console.log('User found:', user ? user.email : 'Not found');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log('Creating JWT token...');
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    
    console.log('Login successful for:', user.email);
    console.log('User role:', user.role);
    
    const responseData = { 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    };
    console.log('Sending response:', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Google OAuth Login
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token and decode it
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        googleId,
        name,
        email,
        password: "GOOGLE_AUTH", // Placeholder
        role: "customer",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ msg: "Google authentication failed", error: error.message });
  }
};

// Forgot Password - Send reset email
exports.forgotPassword = async (req, res) => {
  try {
    console.log("Forgot password request received");
    const { email } = req.body;
    console.log("Email:", email);

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ msg: "If that email exists, a password reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log("Reset token generated (original):", resetToken);
    console.log("Reset token length:", resetToken.length);
    
    // Hash the token before storing
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log("Token hashed for storage:", hashedToken);
    console.log("Hashed token length:", hashedToken.length);
    
    // Set token and expiration (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    console.log("Token fields set, attempting to save...");
    
    try {
      await user.save();
      console.log("User saved successfully");
    } catch (saveError) {
      console.error("Save error:", saveError);
      throw saveError;
    }

    // Create reset URL - IMPORTANT: Use original token, not hashed
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    console.log("Reset URL created:", resetUrl);
    console.log("Token in URL:", resetToken);

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.name);
      console.log(`Password reset email sent successfully to: ${user.email}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      // Still save the token so user can potentially use it
      // Return success to not reveal if user exists
    }

    res.json({ msg: "If that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ msg: "Error processing request. Please try again later.", error: error.message });
  }
};

// Reset Password - Verify token and update password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate input
    if (!password || !confirmPassword) {
      return res.status(400).json({ msg: "Password and confirmation are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters long" });
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordResetConfirmation(user.email, user.name);

    res.json({ msg: "Password has been reset successfully. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ msg: "Error resetting password. Please try again." });
  }
};

// Verify Reset Token - Check if token is valid
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ valid: false, msg: "Invalid or expired reset token" });
    }

    res.json({ valid: true, email: user.email, msg: "Token is valid" });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ valid: false, msg: "Error verifying token" });
  }
};
