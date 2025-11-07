const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendModificationStatusEmail } = require("../services/emailService");

// Optional auth middleware (safe fallback)
let auth = null;
try {
  auth = require("../middleware/authMiddleware");
  if (auth && typeof auth !== "function") {
    if (auth.default && typeof auth.default === "function") auth = auth.default;
    else auth = null;
  }
} catch {
  auth = null;
  console.warn("⚠ Auth middleware not found. Routes will run unprotected.");
}

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "modifications");
fs.mkdirSync(uploadDir, { recursive: true });

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({ storage });

// Import model
let Modification = null;
try {
  Modification = require("../models/Modification");
} catch (e) {
  console.warn("⚠ Modification model not found, routes will use placeholders.");
}

// Helper to attach routes (with optional auth)
const attach = (method, path, ...handlers) => {
  if (auth) router[method](path, auth, ...handlers);
  else router[method](path, ...handlers);
};

// ============================================================
// 🧾 ROUTES
// ============================================================

// ✅ GET all modifications
attach("get", "/", async (req, res) => {
  try {
    if (!Modification) return res.json([]);
    const items = await Modification.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ GET /api/modifications error:", err);
    res.status(500).json({ message: "Failed to fetch modifications" });
  }
});

// ✅ POST create modification (Customer)
attach("post", "/", upload.single("referenceImage"), async (req, res) => {
  try {
    const data = {
      ...req.body,
      imagePath: req.file ? `/uploads/modifications/${req.file.filename}` : null,
      createdAt: new Date(),
      status: "pending",
    };

    if (!Modification)
      return res.status(201).json({ message: "Received (no DB)", data });

    const newMod = new Modification(data);
    await newMod.save();

    // Send confirmation email to customer
    await sendModificationStatusEmail(
      newMod.email,
      newMod.fullName,
      newMod.modificationType,
      newMod.status,
      "Your modification request has been received and is pending review."
    );

    res.status(201).json({
      message: "✅ Modification request submitted successfully",
      data: newMod,
    });
  } catch (err) {
    console.error("❌ POST /api/modifications error:", err);
    res
      .status(500)
      .json({ message: "Failed to create modification", error: err.message });
  }
});

// ✅ GET modification by MongoDB ID
attach("get", "/:id", async (req, res) => {
  try {
    if (!Modification) return res.status(404).json({ message: "Not found" });
    const mod = await Modification.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: "Modification not found" });
    res.json(mod);
  } catch (err) {
    console.error("❌ GET /api/modifications/:id error:", err);
    res.status(500).json({ message: "Failed to fetch modification" });
  }
});

// ✅ GET modification by Registration Number (for customer tracking)
router.get("/search/:regNo", async (req, res) => {
  try {
    const { regNo } = req.params;

    const mod = await Modification.findOne({
      registrationNo: { $regex: new RegExp(`^${regNo}$`, "i") },
    });

    if (!mod)
      return res
        .status(404)
        .json({ message: "No modification found for this registration number" });

    res.json(mod);
  } catch (err) {
    console.error("❌ GET /api/modifications/search/:regNo error:", err);
    res.status(500).json({ message: "Server error fetching modification" });
  }
});

// ============================================================
// ✅ PUT — Admin updates modification & sends email
// ============================================================
router.put("/:id", auth || ((req, res, next) => next()), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, startDate, endDate, budgetRange } = req.body;

    if (!Modification)
      return res.status(500).json({ message: "Modification model missing" });
    if (!id) return res.status(400).json({ message: "Missing modification id" });

    const ALLOWED_STATUSES = [
      "pending",
      "approved",
      "confirmed",
      "rejected",
      "in-progress",
      "completed",
    ];

    if (status && !ALLOWED_STATUSES.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const update = {};
    if (status) update.status = status.toLowerCase();
    if (notes) update.notes = notes;
    if (startDate) update.startDate = startDate;
    if (endDate) update.endDate = endDate;
    if (budgetRange) update.budgetRange = budgetRange;

    const updated = await Modification.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Modification not found" });

    // Send email notification to customer
    try {
      await sendModificationStatusEmail(
        updated.email,
        updated.fullName,
        updated.modificationType,
        updated.status,
        notes
      );
      console.log(`📧 Modification update email sent to ${updated.email}`);
    } catch (emailErr) {
      console.error("⚠ Email sending failed:", emailErr.message);
    }

    res.json({
      message: "✅ Modification updated & customer notified",
      data: updated,
    });
  } catch (err) {
    console.error("🔥 PUT /api/modifications/:id error:", err);
    res.status(500).json({
      message: "Server error updating modification",
      error: err.message,
    });
  }
});

// ✅ DELETE modification
attach("delete", "/:id", async (req, res) => {
  try {
    if (!Modification) return res.status(404).json({ message: "Not found" });
    const mod = await Modification.findByIdAndDelete(req.params.id);
    if (!mod) return res.status(404).json({ message: "Modification not found" });
    res.json({ message: "🗑️ Deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("❌ DELETE /api/modifications/:id error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete modification", error: err.message });
  }
});

module.exports = router;
