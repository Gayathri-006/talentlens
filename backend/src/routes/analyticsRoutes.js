const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/analytics/overview", authMiddleware, roleMiddleware("recruiter"), analyticsController.overview);
router.get("/analytics/hiring-funnel", authMiddleware, roleMiddleware("recruiter"), analyticsController.hiringFunnel);
router.get("/analytics/applications-over-time", authMiddleware, roleMiddleware("recruiter"), analyticsController.applicationsOverTime);
router.get("/analytics/jobs/:jobId", authMiddleware, roleMiddleware("recruiter"), analyticsController.job);
router.get("/analytics/pipeline", authMiddleware, roleMiddleware("recruiter"), analyticsController.pipeline);
router.get("/analytics/ai-scores", authMiddleware, roleMiddleware("recruiter"), analyticsController.aiScores);

module.exports = router;