const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/event.controller");

router.get("/", authenticate, controller.listEvents);
router.get("/:id", authenticate, controller.getEvent);
router.post("/", authenticate, authorize("ADMIN"), controller.createEvent);

module.exports = router;
