const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/coach.controller");

router.get("/dashboard", authenticate, authorize("COACH", "ADMIN"), controller.getDashboardStats);

module.exports = router;
