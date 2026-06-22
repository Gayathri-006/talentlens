require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connection test successful");

    app.listen(PORT, () => {
      console.log(`TalentLens backend running on http://localhost:${PORT}`);
    });
    } catch (error) {
    console.error("Failed to start server:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    process.exit(1);
  }
}

startServer();