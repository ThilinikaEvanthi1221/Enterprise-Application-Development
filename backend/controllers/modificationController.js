const Modification = require("../models/Modification");
const { sendModificationStatusEmail } = require("../services/emailService");

// 🧾 Customer creates a new modification request (with optional image)
exports.createModification = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      vehicleMake,
      vehicleModel,
      registrationNo,
      color,
      mileage,
      modificationType,
      description,
      startDate,
      endDate,
      budgetRange,
      notes,
    } = req.body;

    if (!fullName || !email || !vehicleMake || !vehicleModel || !modificationType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get image path (if uploaded)
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newModification = new Modification({
      fullName,
      email,
      phone,
      vehicleMake,
      vehicleModel,
      registrationNo,
      color,
      mileage,
      modificationType,
      description,
      startDate,
      endDate,
      budgetRange,
      notes,
      imageUrl,
      status: "Pending",
    });

    await newModification.save();

    // Send confirmation email (optional)
    await sendModificationStatusEmail(
      email,
      fullName,
      modificationType,
      "Pending",
      "Your modification request has been received and is pending review."
    );

    res.status(201).json({
      message: "Modification request submitted successfully!",
      data: newModification,
    });
  } catch (err) {
    console.error("Error creating modification:", err);
    res.status(400).json({
      message: "Error creating modification",
      error: err.message,
    });
  }
};

// 🧭 Admin: Get all modification requests
exports.getAllModifications = async (req, res) => {
  try {
    const modifications = await Modification.find().sort({ createdAt: -1 });
    res.status(200).json(modifications);
  } catch (error) {
    console.error("Error fetching modifications:", error);
    res.status(500).json({ message: "Error fetching modifications", error });
  }
};

// 👤 Customer: Get modifications by email
exports.getModificationsByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const modifications = await Modification.find({ email });
    res.status(200).json(modifications);
  } catch (error) {
    console.error("Error fetching customer modifications:", error);
    res.status(500).json({ message: "Error fetching modifications", error });
  }
};

// 🛠 Admin: Update modification status or note
exports.updateModificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Modification.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Modification not found" });
    }

    // Send update email
    await sendModificationStatusEmail(
      updated.email,
      updated.fullName,
      updated.modificationType,
      updated.status,
      req.body.note || "Your modification status has been updated."
    );

    res.status(200).json({
      message: "Modification updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating modification:", error);
    res.status(400).json({
      message: "Error updating modification",
      error: error.message,
    });
  }
};
