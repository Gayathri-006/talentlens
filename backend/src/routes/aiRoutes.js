const express = require("express");
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/ai/analyze-resume/:resumeId",
  authMiddleware,
  roleMiddleware("candidate"),
  aiController.analyzeResume
);

router.get(
  "/ai/resume-analysis/latest",
  authMiddleware,
  roleMiddleware("candidate"),
  aiController.latestResumeAnalysis
);

router.get(
  "/ai/resume-analysis/:resumeId",
  authMiddleware,
  aiController.resumeAnalysis
);

router.post(
  "/ai/score-candidate/:applicationId",
  authMiddleware,
  roleMiddleware("recruiter"),
  aiController.scoreCandidate
);

router.get(
  "/ai/candidate-analysis/:applicationId",
  authMiddleware,
  roleMiddleware("recruiter"),
  aiController.candidateAnalysis
);

router.get(
  "/ai/interview-questions/:applicationId",
  authMiddleware,
  roleMiddleware("recruiter"),
  aiController.interviewQuestions
);

router.post(
  "/ai/rank-candidates/:jobId",
  authMiddleware,
  roleMiddleware("recruiter"),
  aiController.rankCandidates
);

module.exports = router;