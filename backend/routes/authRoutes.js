const express = require("express");
const { 
  signup, 
  login, 
  googleAuth, 
  forgotPassword, 
  resetPassword, 
  verifyResetToken 
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);

module.exports = router;
