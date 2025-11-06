const express = require("express");
const router = express.Router();
const { listCustomers } = require("../controllers/customerController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, listCustomers);

module.exports = router;


