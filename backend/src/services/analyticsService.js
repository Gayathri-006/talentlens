const pool = require("../config/db");

async function overview(recruiterId) {
  const result = await pool.query(
    `
    SELECT
      COUNT(a.id)::int AS total_applications,
      COALESCE(ROUND(AVG(cs.overall_match_score)), 0)::int AS avg_match_score,
      COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'shortlisted') / NULLIF(COUNT(a.id), 0)), 0)::int AS shortlist_rate,
      COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'interview') / NULLIF(COUNT(a.id), 0)), 0)::int AS interview_conversion_rate,
      COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'selected') / NULLIF(COUNT(a.id), 0)), 0)::int AS selection_rate
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    WHERE j.recruiter_id = $1
    `,
    [recruiterId]
  );

  const row = result.rows[0];

  return {
    totalApplications: row.total_applications,
    avgMatchScore: row.avg_match_score,
    shortlistRate: row.shortlist_rate,
    interviewConversionRate: row.interview_conversion_rate,
    selectionRate: row.selection_rate,
    avgTimeToShortlistDays: 0,
  };
}

async function hiringFunnel(recruiterId) {
  const result = await pool.query(
    `
    SELECT a.status, COUNT(a.id)::int AS count
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE j.recruiter_id = $1
    GROUP BY a.status
    `,
    [recruiterId]
  );

  const labels = {
    applied: "Applied",
    under_review: "Under Review",
    shortlisted: "Shortlisted",
    interview: "Interview",
    selected: "Selected",
    rejected: "Rejected",
  };

  return result.rows.map((row) => ({
    stage: labels[row.status] || row.status,
    count: row.count,
  }));
}

async function applicationsOverTime(recruiterId) {
  const result = await pool.query(
    `
    SELECT DATE(a.created_at)::text AS date, COUNT(a.id)::int AS count
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE j.recruiter_id = $1
    GROUP BY DATE(a.created_at)
    ORDER BY DATE(a.created_at)
    `,
    [recruiterId]
  );

  return result.rows;
}

async function jobAnalytics(recruiterId, jobId) {
  const result = await pool.query(
    `
    SELECT
      j.id,
      j.title,
      COUNT(a.id)::int AS total_applications,
      COALESCE(ROUND(AVG(cs.overall_match_score)), 0)::int AS avg_match_score,
      COUNT(*) FILTER (WHERE a.status = 'shortlisted')::int AS shortlisted,
      COUNT(*) FILTER (WHERE a.status = 'interview')::int AS interviews,
      COUNT(*) FILTER (WHERE a.status = 'selected')::int AS selected
    FROM jobs j
    LEFT JOIN applications a ON a.job_id = j.id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    WHERE j.id = $1 AND j.recruiter_id = $2
    GROUP BY j.id
    `,
    [jobId, recruiterId]
  );

  if (!result.rows.length) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

async function pipeline(recruiterId) {
  return hiringFunnel(recruiterId);
}

async function aiScores(recruiterId) {
  const result = await pool.query(
    `
    SELECT
      CASE
        WHEN cs.overall_match_score >= 90 THEN '90-100'
        WHEN cs.overall_match_score >= 80 THEN '80-89'
        WHEN cs.overall_match_score >= 70 THEN '70-79'
        WHEN cs.overall_match_score >= 60 THEN '60-69'
        ELSE '0-59'
      END AS bucket,
      COUNT(cs.id)::int AS count
    FROM candidate_scores cs
    JOIN jobs j ON j.id = cs.job_id
    WHERE j.recruiter_id = $1
    GROUP BY bucket
    ORDER BY bucket DESC
    `,
    [recruiterId]
  );

  return result.rows;
}

module.exports = {
  overview,
  hiringFunnel,
  applicationsOverTime,
  jobAnalytics,
  pipeline,
  aiScores,
};