const express = require("express");
const recruiterController = require("../controllers/recruiterController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/recruiter/stats",
  authMiddleware,
  roleMiddleware("recruiter"),
  recruiterController.stats
);

router.get(
  "/recruiter/recent-applicants",
  authMiddleware,
  roleMiddleware("recruiter"),
  recruiterController.recentApplicants
);

router.get(
  "/recruiter/top-candidates",
  authMiddleware,
  roleMiddleware("recruiter"),
  recruiterController.topCandidates
);

router.get(
  "/recruiter/jobs/:jobId/top-candidates",
  authMiddleware,
  roleMiddleware("recruiter"),
  recruiterController.topCandidatesForJob
);

router.get(
  "/recruiter/pipeline",
  authMiddleware,
  roleMiddleware("recruiter"),
  recruiterController.pipeline
);

module.exports = router;