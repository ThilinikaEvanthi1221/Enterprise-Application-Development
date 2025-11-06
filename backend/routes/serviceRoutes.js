const express = require("express");
const {
  verifyToken,
  requireAdmin,
  requireEmployee,
  requireCustomer,
  requireCustomerOrEmployee,
} = require("../middleware/authMiddleware");
const {
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
// Alternative cancel route (shorter path)
router.patch("/:id/cancel", verifyToken, requireCustomer, cancelMyService);

// EMPLOYEE ROUTES - Employees can view assigned work and update progress
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
router.get("/", verifyToken, requireAdmin, listServices);
router.get("/:id", verifyToken, requireAdmin, getService);
router.post("/", verifyToken, requireAdmin, createService);
router.put("/:id", verifyToken, requireAdmin, updateService);
router.delete("/:id", verifyToken, requireAdmin, deleteService);
router.patch("/:id/approve", verifyToken, requireAdmin, approveService);

module.exports = router;
