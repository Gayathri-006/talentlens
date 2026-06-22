const bcrypt = require("bcrypt");
const pool = require("../config/db");

function formatCandidateProfile(userRow, profileRow) {
  return {
    id: userRow.id,
    fullName: userRow.full_name,
    email: userRow.email,
    phone: profileRow?.phone || undefined,
    linkedin: profileRow?.linkedin || undefined,
    github: profileRow?.github || undefined,
    portfolio: profileRow?.portfolio || undefined,
    avatarUrl: userRow.avatar_url || undefined,
  };
}

function formatUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url || undefined,
  };
}

async function getCandidateProfile(userId) {
  const userResult = await pool.query(
    "SELECT id, full_name, email, avatar_url FROM users WHERE id = $1",
    [userId]
  );

  const profileResult = await pool.query(
    "SELECT phone, linkedin, github, portfolio FROM candidate_profiles WHERE user_id = $1",
    [userId]
  );

  return formatCandidateProfile(userResult.rows[0], profileResult.rows[0]);
}

async function updateCandidateProfile(userId, payload) {
  const { fullName, email, phone, linkedin, github, portfolio, avatarUrl } = payload;

  if (fullName || email || avatarUrl) {
    await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [fullName, email, avatarUrl, userId]
    );
  }

  await pool.query(
    `INSERT INTO candidate_profiles (user_id, phone, linkedin, github, portfolio)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       phone = COALESCE(EXCLUDED.phone, candidate_profiles.phone),
       linkedin = COALESCE(EXCLUDED.linkedin, candidate_profiles.linkedin),
       github = COALESCE(EXCLUDED.github, candidate_profiles.github),
       portfolio = COALESCE(EXCLUDED.portfolio, candidate_profiles.portfolio),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, phone, linkedin, github, portfolio]
  );

  return getCandidateProfile(userId);
}

async function getRecruiterProfile(userId) {
  const result = await pool.query(
    "SELECT id, full_name, email, role, avatar_url FROM users WHERE id = $1",
    [userId]
  );

  return formatUser(result.rows[0]);
}

async function updateRecruiterProfile(userId, payload) {
  const { fullName, email, avatarUrl } = payload;

  const result = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         avatar_url = COALESCE($3, avatar_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING id, full_name, email, role, avatar_url`,
    [fullName, email, avatarUrl, userId]
  );

  return formatUser(result.rows[0]);
}

async function changePassword(userId, currentPassword, newPassword) {
  const result = await pool.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [userId]
  );

  const user = result.rows[0];

  if (!user?.password_hash) {
    const error = new Error("Password change is not available for this account");
    error.statusCode = 400;
    throw error;
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!valid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
    [newHash, userId]
  );

  return { ok: true };
}

module.exports = {
  getCandidateProfile,
  updateCandidateProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
  changePassword,
};