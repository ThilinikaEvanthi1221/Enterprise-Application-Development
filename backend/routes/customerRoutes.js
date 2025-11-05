const express = require("express");
const router = express.Router();
const { listCustomers } = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, listCustomers);

module.exports = router;


