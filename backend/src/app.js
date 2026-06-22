const express = require("express");
const cors = require("cors");
require("dotenv").config();

const passport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const aiRoutes = require("./routes/aiRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const emailRoutes = require("./routes/emailRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");

const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TalentLens backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API health check successful",
  });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", googleAuthRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", resumeRoutes);
app.use("/api", aiRoutes);
app.use("/api", interviewRoutes);
app.use("/api", emailRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", candidateRoutes);
app.use("/api", recruiterRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;