const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");
const User = require("../models/user");

const router = express.Router();

/**
 * Multer storage for avatar uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads", "avatars");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/**
 * Authenticated user: upload/update own avatar
 * POST /api/users/me/avatar
 * Body: form-data with field "avatar"
 */
router.post(
  "/me/avatar",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

      const publicPath = `/uploads/avatars/${req.file.filename}`;

      await User.findByIdAndUpdate(req.user.id, { profileImage: publicPath });
      const updated = await User.findById(req.user.id).select("-password");
      return res.json(updated);
    } catch (err) {
      console.error("Avatar upload error:", err.message);
      return res.status(500).json({ msg: "Upload failed" });
    }
  }
);

/**
 * Admin-only user management
 */
const adminRouter = express.Router();
adminRouter.use(verifyToken, requireAdmin);

adminRouter.get("/", listUsers);
adminRouter.get("/:id", getUser);
adminRouter.post("/", createUser);
adminRouter.put("/:id", updateUser);
adminRouter.delete("/:id", deleteUser);

// mount admin routes under /
router.use("/", adminRouter);

module.exports = router;
