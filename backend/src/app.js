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

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5174",
]
  .map((url) => url && url.replace(/\/+$/, ""))
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalized = origin.replace(/\/+$/, "");
  if (allowedOrigins.includes(normalized)) return true;
  if (normalized.endsWith(".vercel.app")) return true;
  if (/^http:\/\/localhost:\d+$/.test(normalized)) return true;

  return false;
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  }),
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