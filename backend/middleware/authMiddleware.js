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

module.exports = { authMiddleware: verifyToken, requireAdmin };
