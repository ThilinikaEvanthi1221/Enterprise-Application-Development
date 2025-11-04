const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');
    console.log('Auth middleware - Received token:', token ? 'Token present' : 'No token');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Check if token starts with 'Bearer '
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    console.log('Auth middleware - Token value extracted, length:', tokenValue.length);

    // Verify token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully:', decoded.id, decoded.role);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    console.log('Auth middleware - User found:', user ? user.email : 'User not found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    console.log('Auth middleware - Authentication successful for:', user.email);
    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

module.exports = authMiddleware;