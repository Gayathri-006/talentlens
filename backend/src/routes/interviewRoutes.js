const express = require("express");
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/interviews",
  authMiddleware,
  interviewController.list
);

router.get(
  "/interviews/:id",
  authMiddleware,
  interviewController.byId
);

router.post(
  "/interviews",
  authMiddleware,
  roleMiddleware("recruiter"),
  interviewController.create
);

router.patch(
  "/interviews/:id",
  authMiddleware,
  roleMiddleware("recruiter"),
  interviewController.update
);

router.delete(
  "/interviews/:id",
  authMiddleware,
  roleMiddleware("recruiter"),
  interviewController.remove
);

module.exports = router;