const express = require("express");
const resumeController = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const uploadResume = require("../middleware/resumeUploadMiddleware");

const router = express.Router();

router.post(
  "/resumes/upload",
  authMiddleware,
  roleMiddleware("candidate"),
  uploadResume.single("file"),
  resumeController.upload
);

router.get(
  "/resumes/my",
  authMiddleware,
  roleMiddleware("candidate"),
  resumeController.mine
);

module.exports = router;