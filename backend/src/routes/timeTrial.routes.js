const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/timeTrial.controller");

router.get("/athlete/:athleteId", authenticate, controller.listByAthlete);
router.post("/", authenticate, authorize("COACH"), controller.createTimeTrial);

module.exports = router;
