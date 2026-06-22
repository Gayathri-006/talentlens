const express = require("express");
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const uploadApplicationResume = require("../middleware/applicationUploadMiddleware");

const router = express.Router();

router.post(
  "/applications",
  authMiddleware,
  roleMiddleware("candidate"),
  uploadApplicationResume.single("resume"),
  applicationController.create
);

router.get(
  "/applications/my",
  authMiddleware,
  roleMiddleware("candidate"),
  applicationController.mine
);

router.get(
  "/applications/my/recent",
  authMiddleware,
  roleMiddleware("candidate"),
  applicationController.recentMine
);

router.get(
  "/applications/:id",
  authMiddleware,
  applicationController.byId
);

router.get(
  "/recruiter/jobs/:jobId/applications",
  authMiddleware,
  roleMiddleware("recruiter"),
  applicationController.forJob
);

router.patch(
  "/applications/:id/status",
  authMiddleware,
  roleMiddleware("recruiter"),
  applicationController.updateStatus
);

module.exports = router;