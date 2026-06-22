const pool = require("../config/db");

async function uploadResume(candidateId, file) {
  if (!file) {
    const error = new Error("Resume file is required");
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `
    INSERT INTO resumes (
      candidate_id,
      file_path,
      original_name,
      mime_type,
      size_bytes
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      candidateId,
      file.path,
      file.originalname,
      file.mimetype,
      file.size,
    ]
  );

  const row = result.rows[0];

  return {
    id: row.id,
    filename: row.original_name,
    uploadedAt: row.created_at,
    analyzed: false,
  };
}

async function getMyResumes(candidateId) {
  const result = await pool.query(
    `
    SELECT *
    FROM resumes
    WHERE candidate_id = $1
    ORDER BY created_at DESC
    `,
    [candidateId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    filename: row.original_name,
    uploadedAt: row.created_at,
    analyzed: false,
  }));
}

module.exports = {
  uploadResume,
  getMyResumes,
};