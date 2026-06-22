const express = require("express");
const candidateController = require("../controllers/candidateController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/candidate/stats",
  authMiddleware,
  roleMiddleware("candidate"),
  candidateController.stats
);

module.exports = router;