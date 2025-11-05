const express = require("express");
const router = express.Router();
const { listStaff } = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, listStaff);

module.exports = router;


