const pool = require("../config/db");

function formatRankedCandidate(row, index) {
  return {
    rank: index + 1,
    applicationId: row.application_id,
    candidateName: row.full_name,
    matchScore: row.overall_match_score || 0,
    technicalFit: row.technical_match || 0,
    experienceFit: row.experience_match || 0,
    missingSkills: row.missing_skills || [],
    strengths: row.strengths || [],
    recommendation: row.recommendation || "",
  };
}

async function rankCandidates(jobId, recruiterId) {
  const jobCheck = await pool.query(
    "SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2",
    [jobId, recruiterId]
  );

  if (!jobCheck.rows.length) {
    const error = new Error("Job not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  const result = await pool.query(
    `
    SELECT
      cs.application_id,
      cs.overall_match_score,
      cs.technical_match,
      cs.experience_match,
      cs.missing_skills,
      cs.strengths,
      cs.recommendation,
      a.full_name
    FROM candidate_scores cs
    JOIN applications a ON a.id = cs.application_id
    WHERE cs.job_id = $1
    ORDER BY cs.overall_match_score DESC NULLS LAST
    LIMIT 50
    `,
    [jobId]
  );

  return {
    jobId,
    rankedCandidates: result.rows.map(formatRankedCandidate),
  };
}

module.exports = {
  rankCandidates,
};