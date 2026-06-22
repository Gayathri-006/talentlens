const express = require("express");
const passport = require("passport");
const pool = require("../config/db");
const generateToken = require("../utils/generateToken");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  async (req, res) => {
    try {
      const googleUser = req.user;

      let result = await pool.query(
        `
        SELECT id, full_name, email, role, avatar_url
        FROM users
        WHERE email = $1
        `,
        [googleUser.email.toLowerCase()]
      );

      let user;

      if (result.rows.length === 0) {
        const newUser = await pool.query(
          `
          INSERT INTO users (full_name, email, role)
          VALUES ($1, $2, 'candidate')
          RETURNING id, full_name, email, role, avatar_url
          `,
          [googleUser.fullName, googleUser.email.toLowerCase()]
        );

        user = newUser.rows[0];
      } else {
        user = result.rows[0];
      }

      const token = generateToken({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url || undefined,
      });

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
      );
    } catch (error) {
      console.error("Google OAuth Error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
      );
    }
  }
);

module.exports = router;