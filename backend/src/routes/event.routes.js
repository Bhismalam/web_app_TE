const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/event.controller");

router.get("/", authenticate, controller.listEvents);
router.get("/:id", authenticate, controller.getEvent);
router.post("/", authenticate, authorize("ADMIN", "COACH"), controller.createEvent);
router.post("/:id/register", authenticate, controller.registerForEvent);
router.delete("/:id/register", authenticate, controller.cancelRegistration);
router.patch(
  "/:id/entries/:entryId/payment",
  authenticate,
  authorize("ADMIN", "COACH"),
  controller.setPaymentStatus
);

module.exports = router;
