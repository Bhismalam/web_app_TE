const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/training.controller");

router.get("/", authenticate, controller.listSessions);
router.get("/today", authenticate, controller.listToday);
router.post("/", authenticate, authorize("COACH", "ADMIN"), controller.createSession);

module.exports = router;
