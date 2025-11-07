const Service = require("../models/service");
const Vehicle = require("../models/vehicle");
const User = require("../models/user");
const Appointment = require("../models/appointment");
const {
  estimateServiceCost,
  calculateActualCost,
} = require("../utils/costEstimator");

/**
 * PUBLIC FUNCTIONS
 */

// Public: List all available service types
exports.listAvailableServices = async (req, res) => {
  try {
    // Find all active services that can be booked
    const services = await Service.find({
      isActive: true,
      // Add any other conditions that define an "available" service
    }).select("name description price duration category");

    res.json(services);
  } catch (error) {
    console.error("Error fetching available services:", error);
    res.status(500).json({ message: "Error fetching available services" });
  }
};

/**
 * CUSTOMER FUNCTIONS
 */

// Customer: Request a new service
exports.requestService = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      serviceType,
      name,
      description,
      vehicleId,
      laborHours,
      partsRequired,
      customerNotes,
      scheduledDate,
      timeSlot,
      appointmentNotes,
    } = req.body;

    // Validate required fields
    if (!serviceType || !name || !vehicleId) {
      return res
        .status(400)
        .json({ msg: "Service type, name, and vehicle are required" });
    }

    // Validate appointment is required
    if (!scheduledDate || !timeSlot) {
      return res
        .status(400)
        .json({ msg: "Appointment date and time slot are required" });
    }

    // Verify vehicle belongs to customer
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    if (vehicle.owner.toString() !== customerId) {
      return res
        .status(403)
        .json({ msg: "You can only request services for your own vehicles" });
    }

    // Parse time slot to get the start time
    const timeSlotStart = timeSlot.split(" - ")[0]; // e.g., "10:00 AM"
    const [time, period] = timeSlotStart.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Combine date and time
    const appointmentDateTime = new Date(scheduledDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Check if appointment is in the past
    if (appointmentDateTime < new Date()) {
      return res
        .status(400)
        .json({ msg: "Cannot schedule appointments in the past" });
    }

    // Calculate estimated cost
    const costEstimate = estimateServiceCost({
      serviceType,
      laborHours,
      partsRequired,
    });

    // Create service request
    const service = await Service.create({
      serviceType,
      name,
      description,
      customer: customerId,
      vehicle: vehicleId,
      estimatedCost: costEstimate.estimatedTotal,
      laborHours: costEstimate.laborHours,
      partsRequired: partsRequired || [],
      customerNotes,
      status: "requested",
    });

    // Create appointment (now mandatory)
    const appointment = await Appointment.create({
      customer: customerId,
      vehicle: vehicleId,
      service: service._id,
      date: appointmentDateTime,
      status: "pending",
      notes: appointmentNotes || `${name} - ${timeSlot}`,
      estimatedDuration: laborHours * 60, // Convert hours to minutes
      price: costEstimate.estimatedTotal,
    });

    await appointment.populate([
      { path: "customer", select: "name email" },
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "service", select: "name serviceType" },
    ]);

    // Populate vehicle and customer info
    await service.populate([
      { path: "customer", select: "name email" },
      { path: "vehicle", select: "make model year plateNumber" },
    ]);

    return res.status(201).json({
      service,
      appointment,
      costEstimate,
    });
  } catch (err) {
    console.error("Error requesting service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Customer: Get their own services
exports.getMyServices = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { status, vehicleId } = req.query;

    const filter = { customer: customerId };

    // Handle multiple statuses (comma-separated)
    if (status) {
      if (status.includes(",")) {
        filter.status = { $in: status.split(",").map((s) => s.trim()) };
      } else {
        filter.status = status;
      }
    }

    if (vehicleId) filter.vehicle = vehicleId;

    const services = await Service.find(filter)
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email")
      .sort({ requestedDate: -1 });

    return res.json(services);
  } catch (err) {
    console.error("Error fetching customer services:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Customer: Get a specific service (only their own)
exports.getMyService = async (req, res) => {
  try {
    const customerId = req.user.id;
    const service = await Service.findById(req.params.id)
      .populate("vehicle", "make model year plateNumber")
      .populate("customer", "name email")
      .populate("assignedTo", "name email");

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    if (service.customer._id.toString() !== customerId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    return res.json(service);
  } catch (err) {
    console.error("Error fetching service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Customer: Cancel their service request
exports.cancelMyService = async (req, res) => {
  try {
    const customerId = req.user.id;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    if (service.customer.toString() !== customerId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Can only cancel if not completed
    if (service.status === "completed") {
      return res.status(400).json({ msg: "Cannot cancel a completed service" });
    }

    service.status = "cancelled";
    await service.save();

    return res.json({ msg: "Service cancelled successfully", service });
  } catch (err) {
    console.error("Error cancelling service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

/**
 * EMPLOYEE FUNCTIONS
 */

// Employee: Get assigned services
exports.getAssignedServices = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { status } = req.query;

    const filter = { assignedTo: employeeId };
    if (status) filter.status = status;

    const services = await Service.find(filter)
      .populate("vehicle", "make model year plateNumber")
      .populate("customer", "name email")
      .sort({ requestedDate: -1 });

    return res.json(services);
  } catch (err) {
    console.error("Error fetching assigned services:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Get all pending/approved services (to pick up work)
exports.getAvailableServices = async (req, res) => {
  try {
    const services = await Service.find({
      status: { $in: ["approved", "pending"] },
      assignedTo: { $exists: false },
    })
      .populate("vehicle", "make model year plateNumber")
      .populate("customer", "name email")
      .sort({ requestedDate: 1 });

    return res.json(services);
  } catch (err) {
    console.error("Error fetching available services:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Update service status and progress
exports.updateServiceProgress = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { status, progress, notes, actualLaborHours, actualParts } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    // Employee can only update services assigned to them
    if (service.assignedTo && service.assignedTo.toString() !== employeeId) {
      return res
        .status(403)
        .json({ msg: "This service is not assigned to you" });
    }

    // Prepare update object
    const updateData = {};

    // Update fields
    if (status) {
      updateData.status = status;

      // Set dates based on status
      if (status === "ongoing" && !service.startDate) {
        updateData.startDate = new Date();
      }
      if (status === "completed") {
        updateData.completionDate = new Date();
        updateData.progress = 100;

        // Calculate actual cost if provided
        if (actualLaborHours) {
          const actualCost = calculateActualCost({
            actualLaborHours,
            laborRate: 50, // Use appropriate rate
            actualParts: actualParts || service.partsRequired,
            additionalCosts: 0,
          });
          updateData.actualCost = actualCost.actualTotal;
        }
      }
    }

    if (progress !== undefined) updateData.progress = progress;
    if (notes) updateData.notes = notes;

    // Use findByIdAndUpdate to avoid validation issues
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "customer", select: "name email" },
      { path: "assignedTo", select: "name email" },
    ]);

    return res.json({
      msg: "Service updated successfully",
      service: updatedService,
    });
  } catch (err) {
    console.error("Error updating service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Employee: Claim/assign a service to themselves
exports.claimService = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    // Check if already assigned
    if (service.assignedTo) {
      return res.status(400).json({ msg: "Service is already assigned" });
    }

    // Check if service is in appropriate status
    if (!["approved", "pending"].includes(service.status)) {
      return res
        .status(400)
        .json({ msg: "Service cannot be claimed in current status" });
    }

    // Use findByIdAndUpdate to avoid validation issues
    const updatedService = await Service.findByIdAndUpdate(
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
      msg: "Service claimed successfully",
      service: updatedService,
    });
  } catch (err) {
    console.error("Error claiming service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

/**
 * ADMIN FUNCTIONS
 */

// Admin: Get all services
exports.listServices = async (req, res) => {
  try {
    const { status, customerId, employeeId, vehicleId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;
    if (employeeId) filter.assignedTo = employeeId;
    if (vehicleId) filter.vehicle = vehicleId;

    const services = await Service.find(filter)
      .populate("customer", "name email")
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email")
      .sort({ requestedDate: -1 });

    return res.json(services);
  } catch (err) {
    console.error("Error listing services:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Get a specific service
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("customer", "name email")
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email");

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    return res.json(service);
  } catch (err) {
    console.error("Error fetching service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Create a service (manual entry)
exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    await service.populate([
      { path: "customer", select: "name email" },
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "assignedTo", select: "name email" },
    ]);
    return res.status(201).json(service);
  } catch (err) {
    console.error("Error creating service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Update any service
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("customer", "name email")
      .populate("vehicle", "make model year plateNumber")
      .populate("assignedTo", "name email");

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    return res.json(service);
  } catch (err) {
    console.error("Error updating service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }
    return res.json({ msg: "Service deleted successfully" });
  } catch (err) {
    console.error("Error deleting service:", err);
    return res.status(500).json({ msg: err.message });
  }
};

// Admin: Approve a service request
exports.approveService = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
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

    // Use findByIdAndUpdate to avoid validation issues
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "customer", select: "name email" },
      { path: "vehicle", select: "make model year plateNumber" },
      { path: "assignedTo", select: "name email" },
    ]);

    return res.json({
      msg: "Service approved successfully",
      service: updatedService,
    });
  } catch (err) {
    console.error("Error approving service:", err);
    return res.status(500).json({ msg: err.message });
  }
};
