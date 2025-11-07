const express = require("express");
const {
  verifyToken,
  requireAdmin,
  requireEmployee,
  requireCustomer,
  requireCustomerOrEmployee,
} = require("../middleware/authMiddleware");
const {
  // Public functions
  listAvailableServices,
  // Customer functions
  requestService,
  getMyServices,
  getMyService,
  cancelMyService,

  // Employee functions
  getAssignedServices,
  getAvailableServices,
  updateServiceProgress,
  claimService,

  // Admin functions
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  approveService,
} = require("../controllers/servicesController");

const router = express.Router();

// PUBLIC ROUTES - Available to all users
router.get('/available-services', listAvailableServices);

// CUSTOMER ROUTES - Customers can request and view their own services
router.post("/request", verifyToken, requireCustomer, requestService);
router.get("/my-services", verifyToken, requireCustomer, getMyServices);
router.get("/my-services/:id", verifyToken, requireCustomer, getMyService);
router.patch(
  "/my-services/:id/cancel",
  verifyToken,
  requireCustomer,
  cancelMyService
);

// EMPLOYEE ROUTES - Employees can view assigned work and update progress
// IMPORTANT: These must come BEFORE the generic /:id routes
router.get("/assigned", verifyToken, requireEmployee, getAssignedServices);
router.get("/available", verifyToken, requireEmployee, getAvailableServices);
router.patch(
  "/:id/progress",
  verifyToken,
  requireEmployee,
  updateServiceProgress
);
router.post("/:id/claim", verifyToken, requireEmployee, claimService);

// ADMIN ROUTES - Admins have full control
// IMPORTANT: Generic /:id routes must come AFTER specific routes like /assigned
router.get("/", verifyToken, requireAdmin, listServices);
router.post("/", verifyToken, requireAdmin, createService);
router.patch("/:id/approve", verifyToken, requireAdmin, approveService);
router.put("/:id", verifyToken, requireAdmin, updateService);
router.delete("/:id", verifyToken, requireAdmin, deleteService);

// Customer cancel route (alternative shorter path)
// This should come AFTER admin routes since it's a parameterized route
router.patch("/:id/cancel", verifyToken, requireCustomer, cancelMyService);

// Admin get single service - MUST be last since it matches any /:id
router.get("/:id", verifyToken, requireAdmin, getService);

// Public route to list available services
router.get("/available", listAvailableServices);

module.exports = router;
