const express = require("express");
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/candidate",
  authMiddleware,
  roleMiddleware("candidate"),
  profileController.getCandidate
);

router.put(
  "/candidate",
  authMiddleware,
  roleMiddleware("candidate"),
  profileController.updateCandidate
);

router.get(
  "/recruiter",
  authMiddleware,
  roleMiddleware("recruiter"),
  profileController.getRecruiter
);

router.put(
  "/recruiter",
  authMiddleware,
  roleMiddleware("recruiter"),
  profileController.updateRecruiter
);

router.post(
  "/change-password",
  authMiddleware,
  profileController.changePassword
);

module.exports = router;