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
  requestProject,
  getMyProjects,
  getMyProject,
  cancelMyProject,

  // Employee functions
  getAssignedProjects,
  getAvailableProjects,
  updateProjectProgress,
  claimProject,
  addMilestone,
  completeMilestone,

  // Admin functions
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  approveProject,
} = require("../controllers/projectsController");

const router = express.Router();

// CUSTOMER ROUTES - Customers can request modifications and view their own projects
router.post("/request", verifyToken, requireCustomer, requestProject);
router.get("/my-projects", verifyToken, requireCustomer, getMyProjects);
router.get("/my-projects/:id", verifyToken, requireCustomer, getMyProject);
router.patch(
  "/my-projects/:id/cancel",
  verifyToken,
  requireCustomer,
  cancelMyProject
);

// EMPLOYEE ROUTES - Employees can view assigned work and update progress
router.get("/assigned", verifyToken, requireEmployee, getAssignedProjects);
router.get("/available", verifyToken, requireEmployee, getAvailableProjects);
router.patch(
  "/:id/progress",
  verifyToken,
  requireEmployee,
  updateProjectProgress
);
router.post("/:id/claim", verifyToken, requireEmployee, claimProject);
router.post("/:id/milestones", verifyToken, requireEmployee, addMilestone);
router.patch(
  "/:id/milestones/complete",
  verifyToken,
  requireEmployee,
  completeMilestone
);

// ADMIN ROUTES - Admins have full control
router.get("/", verifyToken, requireAdmin, listProjects);
router.get("/:id", verifyToken, requireAdmin, getProject);
router.post("/", verifyToken, requireAdmin, createProject);
router.put("/:id", verifyToken, requireAdmin, updateProject);
router.delete("/:id", verifyToken, requireAdmin, deleteProject);
router.post("/:id/approve", verifyToken, requireAdmin, approveProject);

module.exports = router;
