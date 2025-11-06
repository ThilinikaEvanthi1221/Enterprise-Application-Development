const jwt = require("jsonwebtoken");

// Verifies JWT and attaches user payload to req.user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  console.log("verifyToken - authHeader:", authHeader.substring(0, 20) + "...");
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;
  if (!token) {
    console.log("verifyToken - No token found");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("verifyToken - decoded token:", decoded);
    req.user = decoded;
    return next();
  } catch (err) {
    console.log("verifyToken - Token verification failed:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

// Ensures the authenticated user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Forbidden: Admins only" });
  return next();
};

// Ensures the authenticated user has employee or admin role
const requireEmployee = (req, res, next) => {
  console.log("requireEmployee middleware - req.user:", req.user);
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (req.user.role !== "employee" && req.user.role !== "admin") {
    console.log("Access denied - user role:", req.user.role);
    return res.status(403).json({ msg: "Forbidden: Employees only" });
  }
  console.log("requireEmployee middleware passed - role:", req.user.role);
  return next();
};

// Ensures the authenticated user has customer role (or admin for testing)
const requireCustomer = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (req.user.role !== "customer" && req.user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden: Customers only" });
  }
  return next();
};

// Ensures the authenticated user is either customer or employee (or admin)
const requireCustomerOrEmployee = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  const allowedRoles = ["customer", "employee", "admin"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ msg: "Forbidden: Access denied" });
  }
  return next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireEmployee,
  requireCustomer,
  requireCustomerOrEmployee,
};
