const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);

module.exports = router;
