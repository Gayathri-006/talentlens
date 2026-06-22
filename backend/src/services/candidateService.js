const pool = require("../config/db");

async function getCandidateStats(candidateId) {
  const result = await pool.query(
    `
    SELECT
      COUNT(DISTINCT a.id)::int AS applications_submitted,
      COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'shortlisted')::int AS shortlisted,
      COUNT(DISTINCT i.id)::int AS interviews_scheduled,
      COALESCE(MAX(ra.overall_score), 0)::int AS resume_strength_score
    FROM users u
    LEFT JOIN applications a ON a.candidate_id = u.id
    LEFT JOIN interviews i ON i.candidate_id = u.id AND i.status = 'scheduled'
    LEFT JOIN resumes r ON r.candidate_id = u.id
    LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
    WHERE u.id = $1
    GROUP BY u.id
    `,
    [candidateId]
  );

  const row = result.rows[0];

  return {
    applicationsSubmitted: row?.applications_submitted || 0,
    shortlisted: row?.shortlisted || 0,
    interviewsScheduled: row?.interviews_scheduled || 0,
    resumeStrengthScore: row?.resume_strength_score || 0,
  };
}

module.exports = { getCandidateStats };