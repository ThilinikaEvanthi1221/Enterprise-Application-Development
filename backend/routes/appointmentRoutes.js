const express = require("express");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment } = require("../controllers/appointmentsController");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/", listAppointments);
router.get("/:id", getAppointment);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;


