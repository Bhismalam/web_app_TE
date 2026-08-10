const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/auth.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/register-staff", authenticate, authorize("ADMIN"), controller.registerStaff);

module.exports = router;
