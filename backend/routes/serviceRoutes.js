const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { listServices, getService, createService, updateService, deleteService } = require("../controllers/servicesController");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/", listServices);
router.get("/:id", getService);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;


