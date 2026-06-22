const bcrypt = require("bcrypt");
const pool = require("../config/db");
const generateToken = require("../utils/generateToken");

function formatUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url || undefined,
  };
}

async function registerUser({ fullName, email, password, role }) {
  if (!fullName || !email || !password || !role) {
    const error = new Error("Full name, email, password and role are required");
    error.statusCode = 400;
    throw error;
  }

  if (!["candidate", "recruiter"].includes(role)) {
    const error = new Error("Role must be candidate or recruiter");
    error.statusCode = 400;
    throw error;
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);

  if (existing.rows.length > 0) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, role, avatar_url`,
    [fullName, email.toLowerCase(), passwordHash, role]
  );

  const user = formatUser(result.rows[0]);
  const token = generateToken(user);

  return { token, user };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `SELECT id, full_name, email, password_hash, role, avatar_url
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const row = result.rows[0];

  if (!row.password_hash) {
    const error = new Error("Please login using Google");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, row.password_hash);

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = formatUser(row);
  const token = generateToken(user);

  return { token, user };
}

async function getUserById(id) {
  const result = await pool.query(
    `SELECT id, full_name, email, role, avatar_url
     FROM users
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  return formatUser(result.rows[0]);
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  formatUser,
};