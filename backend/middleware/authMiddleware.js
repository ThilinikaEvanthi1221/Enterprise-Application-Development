const jwt = require("jsonwebtoken");

// Verifies JWT and attaches user payload to req.user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

// Ensures the authenticated user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden: Admins only" });
  return next();
};

// Middleware to check if user has one of the required roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `Forbidden: ${roles.join(' or ')} role required` });
    }
    return next();
  };
};

module.exports = { 
  verifyToken, 
  requireAdmin, 
  authorize,
  protect: verifyToken // alias for compatibility
};
