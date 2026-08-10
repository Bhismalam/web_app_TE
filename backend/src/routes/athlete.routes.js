const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/athlete.controller");

router.get("/", authenticate, authorize("COACH", "ADMIN"), controller.listAthletes);
router.get("/me", authenticate, controller.getMe);
router.get("/:id", authenticate, controller.getAthlete);
router.put("/:id", authenticate, controller.updateAthlete);

module.exports = router;
