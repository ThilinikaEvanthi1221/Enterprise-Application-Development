const express = require("express");
const router = express.Router();
const { listStaff } = require("../controllers/staffController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, listStaff);

module.exports = router;


