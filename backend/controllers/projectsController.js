const Project = require("../models/project");
const Vehicle = require("../models/vehicle");
const User = require("../models/user");
const {
  estimateProjectCost,
  calculateActualCost,
} = require("../utils/costEstimator");

/**
 * CUSTOMER FUNCTIONS
 */

// Customer: Request a new modification/project
exports.requestProject = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      title,
      description,
      modificationType,
      vehicleId,
      laborHours,
      partsRequired,
      priority,
      customerNotes,
      estimatedCompletionDate,
    } = req.body;

    // Validate required fields
    if (!title || !description || !modificationType || !vehicleId) {
      return res.status(400).json({
        msg: "Title, description, modification type, and vehicle are required",
      });
    }

    // Verify vehicle belongs to customer
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    if (vehicle.owner.toString() !== customerId) {
      return res.status(403).json({
        msg: "You can only request modifications for your own vehicles",
      });
    }

    // Calculate estimated cost
    const costEstimate = estimateProjectCost({
      modificationType,
      laborHours,
      partsRequired,
      priority: priority || "medium",
    });

    // Create project/modification request
    const project = await Project.create({
      title,
      description,
      modificationType,
      customer: customerId,
      vehicle: vehicleId,
      estimatedCost: costEstimate.estimatedTotal,
      laborHours: costEstimate.laborHours,
      partsRequired: partsRequired || [],
      priority: priority || "medium",
      customerNotes,
      estimatedCompletionDate,
      status: "requested",
    });

    // Populate vehicle and customer info
    await project.populate([
      { path: "customer", select: "name email" },
      { path: "vehicle", select: "make model year plateNumber" },
    ]);

    return res.status(201).json({
      project,
      costEstimate,
    });
  } catch (err) {
    console.error("Error requesting project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Customer: Get their own projects
exports.getMyProjects = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { status, vehicleId } = req.query;

    const filter = { customer: customerId };
    if (status) filter.status = status;
    if (vehicleId) filter.vehicle = vehicleId;

    const projects = await Project.find(filter)
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email")
      .sort({ requestedDate: -1 });

    return res.json(projects);
  } catch (err) {
    console.error("Error fetching customer projects:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Customer: Get a specific project (only their own)
exports.getMyProject = async (req, res) => {
  try {
    const customerId = req.user.id;
    const project = await Project.findById(req.params.id)
      .populate("vehicle", "make model year plateNumber")
      .populate("customer", "name email")
      .populate("assignedTo", "name email");

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.customer._id.toString() !== customerId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    return res.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Customer: Cancel their project request
exports.cancelMyProject = async (req, res) => {
  try {
    const customerId = req.user.id;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.customer.toString() !== customerId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Can only cancel if not completed or too far in progress
    if (project.status === "completed") {
      return res.status(400).json({ msg: "Cannot cancel a completed project" });
    }
    if (project.status === "ongoing" && project.progress > 50) {
      return res.status(400).json({
        msg: "Cannot cancel project that is more than 50% complete. Please contact support.",
      });
    }

    project.status = "cancelled";
    await project.save();

    return res.json({ msg: "Project cancelled successfully", project });
  } catch (err) {
    console.error("Error cancelling project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

/**
 * EMPLOYEE FUNCTIONS
 */

// Employee: Get assigned projects
exports.getAssignedProjects = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { status } = req.query;

    const filter = { assignedTo: employeeId };
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate("vehicle", "make model year plateNumber")
      .populate("customer", "name email")
      .sort({ priority: -1, requestedDate: -1 }); // High priority first

    return res.json(projects);
  } catch (err) {
    console.error("Error fetching assigned projects:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Get all pending/approved projects (to pick up work)
exports.getAvailableProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      status: { $in: ["approved", "pending"] },
      assignedTo: { $exists: false },
    })
      .populate("vehicle", "make model year plateNumber")
      .populate("customer", "name email")
      .sort({ priority: -1, requestedDate: 1 }); // High priority first, oldest first

    return res.json(projects);
  } catch (err) {
    console.error("Error fetching available projects:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Update project status and progress
exports.updateProjectProgress = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const {
      status,
      progress,
      notes,
      actualLaborHours,
      actualParts,
      milestones,
    } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Employee can only update projects assigned to them
    if (project.assignedTo && project.assignedTo.toString() !== employeeId) {
      return res
        .status(403)
        .json({ msg: "This project is not assigned to you" });
    }

    // Prepare update object
    const updateData = {};

    // Update fields
    if (status) {
      updateData.status = status;

      // Set dates based on status
      if (status === "ongoing" && !project.startDate) {
        updateData.startDate = new Date();
      }
      if (status === "completed") {
        updateData.completionDate = new Date();
        updateData.progress = 100;

        // Calculate actual cost if provided
        if (actualLaborHours) {
          const actualCost = calculateActualCost({
            actualLaborHours,
            laborRate: 100, // Modification rate
            actualParts: actualParts || project.partsRequired,
            additionalCosts: 0,
          });
          updateData.actualCost = actualCost.actualTotal;
        }
      }
    }

    if (progress !== undefined) updateData.progress = progress;
    if (notes) updateData.notes = notes;
    if (milestones) {
      // Update milestones
      updateData.milestones = milestones;
    }

    // Use findByIdAndUpdate to avoid validation issues
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "customer", select: "name email" },
      { path: "assignedTo", select: "name email" },
    ]);

    return res.json({
      msg: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error updating project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Claim/assign a project to themselves
exports.claimProject = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Check if already assigned
    if (project.assignedTo) {
      return res.status(400).json({ msg: "Project is already assigned" });
    }

    // Check if project is in appropriate status
    if (!["approved", "pending"].includes(project.status)) {
      return res
        .status(400)
        .json({ msg: "Project cannot be claimed in current status" });
    }

    // Use findByIdAndUpdate to avoid validation issues
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: employeeId,
        status: "ongoing",
        startDate: new Date(),
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "customer", select: "name email" },
      { path: "assignedTo", select: "name email" },
    ]);

    return res.json({
      msg: "Project claimed successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error claiming project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Add milestone to project
exports.addMilestone = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { title, description } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.assignedTo.toString() !== employeeId) {
      return res
        .status(403)
        .json({ msg: "This project is not assigned to you" });
    }

    project.milestones.push({
      title,
      description,
      completed: false,
    });

    await project.save();
    return res.json({ msg: "Milestone added successfully", project });
  } catch (err) {
    console.error("Error adding milestone:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Complete milestone
exports.completeMilestone = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { milestoneId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.assignedTo.toString() !== employeeId) {
      return res
        .status(403)
        .json({ msg: "This project is not assigned to you" });
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ msg: "Milestone not found" });
    }

    milestone.completed = true;
    milestone.completedDate = new Date();

    // Update overall progress based on completed milestones
    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(
      (m) => m.completed
    ).length;
    project.progress = Math.round(
      (completedMilestones / totalMilestones) * 100
    );

    await project.save();
    return res.json({ msg: "Milestone completed successfully", project });
  } catch (err) {
    console.error("Error completing milestone:", err);
    return res.status(500).json({ msg: err.message });
  }
};

/**
 * ADMIN FUNCTIONS
 */

// Admin: Get all projects
exports.listProjects = async (req, res) => {
  try {
    const { status, customerId, employeeId, vehicleId, priority } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;
    if (employeeId) filter.assignedTo = employeeId;
    if (vehicleId) filter.vehicle = vehicleId;
    if (priority) filter.priority = priority;

    const projects = await Project.find(filter)
      .populate("customer", "name email")
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email")
      .sort({ priority: -1, requestedDate: -1 });

    return res.json(projects);
  } catch (err) {
    console.error("Error listing projects:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Get a specific project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("customer", "name email")
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email");

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    return res.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Create a project (manual entry)
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    await project.populate([
      { path: "customer", select: "name email" },
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "assignedTo", select: "name email" },
    ]);
    return res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Update any project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email")
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email");

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    return res.json(project);
  } catch (err) {
    console.error("Error updating project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }
    return res.json({ msg: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Approve a project request
exports.approveProject = async (req, res) => {
  try {
    const { assignedTo, estimatedCompletionDate, priority } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const updateData = { status: "approved" };

    if (assignedTo) {
      // Verify employee exists
      const employee = await User.findById(assignedTo);
      if (!employee || employee.role !== "employee") {
        return res.status(400).json({ msg: "Invalid employee ID" });
      }
      updateData.assignedTo = assignedTo;
    }

    if (estimatedCompletionDate) {
      updateData.estimatedCompletionDate = estimatedCompletionDate;
    }

    if (priority) {
      updateData.priority = priority;
    }

    // Use findByIdAndUpdate to avoid validation issues
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "customer", select: "name email" },
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "assignedTo", select: "name email" },
    ]);

    return res.json({
      msg: "Project approved successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error approving project:", err);
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = exports;
