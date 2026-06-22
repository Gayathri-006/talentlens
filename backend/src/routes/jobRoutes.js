const express = require("express");
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/jobs", jobController.list);

router.get(
  "/jobs/recommended",
  authMiddleware,
  roleMiddleware("candidate"),
  jobController.recommended
);

router.get("/jobs/:id", jobController.byId);

router.get(
  "/recruiter/jobs",
  authMiddleware,
  roleMiddleware("recruiter"),
  jobController.recruiterList
);

router.post(
  "/jobs",
  authMiddleware,
  roleMiddleware("recruiter"),
  jobController.create
);

router.put(
  "/jobs/:id",
  authMiddleware,
  roleMiddleware("recruiter"),
  jobController.update
);

router.delete(
  "/jobs/:id",
  authMiddleware,
  roleMiddleware("recruiter"),
  jobController.remove
);

module.exports = router;