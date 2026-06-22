const express = require("express");
const emailController = require("../controllers/emailController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/emails/send",
  authMiddleware,
  roleMiddleware("recruiter"),
  emailController.send
);

router.get(
  "/emails/templates",
  authMiddleware,
  roleMiddleware("recruiter"),
  emailController.templates
);

router.post(
  "/emails/templates",
  authMiddleware,
  roleMiddleware("recruiter"),
  emailController.createTemplate
);

router.get(
  "/emails/history",
  authMiddleware,
  roleMiddleware("recruiter"),
  emailController.history
);

module.exports = router;