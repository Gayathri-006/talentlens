const pool = require("../config/db");

function formatApplication(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    company: row.company_name,
    candidateId: row.candidate_id,
    candidateName: row.full_name,
    candidateEmail: row.email,
    resumeId: row.resume_id || undefined,
    resumeFilename: row.resume_original_name || undefined,
    status: row.status,
    matchScore: row.overall_match_score ?? undefined,
    appliedAt: row.created_at,
    interviewDate: row.interview_date || undefined,
    resumeAnalysisStatus: row.resume_analysis_status || "pending",
    topSkills: row.strengths || [],
    missingSkillsCount: Number(row.missing_skills_count || 0),
  };
}

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

async function getStats(recruiterId) {
  const result = await pool.query(
    `
    SELECT
      COUNT(DISTINCT j.id) FILTER (WHERE j.status = 'active')::int AS active_jobs,
      COUNT(DISTINCT a.id)::int AS total_applicants,
      COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'shortlisted')::int AS shortlisted,
      COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'scheduled')::int AS interviews_scheduled,
      COALESCE(ROUND(AVG(cs.overall_match_score)), 0)::int AS avg_match_score
    FROM jobs j
    LEFT JOIN applications a ON a.job_id = j.id
    LEFT JOIN interviews i ON i.application_id = a.id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    WHERE j.recruiter_id = $1
    `,
    [recruiterId]
  );

  const row = result.rows[0];

  return {
    activeJobs: row.active_jobs || 0,
    totalApplicants: row.total_applicants || 0,
    shortlisted: row.shortlisted || 0,
    interviewsScheduled: row.interviews_scheduled || 0,
    avgMatchScore: row.avg_match_score || 0,
  };
}

async function getRecentApplicants(recruiterId) {
  const result = await pool.query(
    `
    SELECT
      a.*,
      j.title AS job_title,
      j.company_name,
      r.id AS resume_id,
      cs.overall_match_score,
      cs.strengths,
      COALESCE(array_length(cs.missing_skills, 1), 0) AS missing_skills_count,
      CASE WHEN ra.id IS NOT NULL THEN 'completed' ELSE 'pending' END AS resume_analysis_status,
      i.interview_date
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN resumes r ON r.application_id = a.id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
    LEFT JOIN interviews i ON i.application_id = a.id
    WHERE j.recruiter_id = $1
    ORDER BY a.created_at DESC
    LIMIT 10
    `,
    [recruiterId]
  );

  return result.rows.map(formatApplication);
}

async function getTopCandidates(recruiterId, limit = 10) {
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
    JOIN jobs j ON j.id = cs.job_id
    WHERE j.recruiter_id = $1
    ORDER BY cs.overall_match_score DESC NULLS LAST
    LIMIT $2
    `,
    [recruiterId, limit]
  );

  return result.rows.map(formatRankedCandidate);
}

async function getTopCandidatesForJob(recruiterId, jobId, limit = 50) {
  const jobCheck = await pool.query(
    "SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2",
    [jobId, recruiterId]
  );

  if (!jobCheck.rows.length) {
    const error = new Error("Job not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  const rankedCandidates = await getTopCandidatesByJob(jobId, limit);

  return {
    jobId,
    rankedCandidates,
  };
}

async function getTopCandidatesByJob(jobId, limit) {
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
    LIMIT $2
    `,
    [jobId, limit]
  );

  return result.rows.map(formatRankedCandidate);
}

async function getPipeline(recruiterId) {
  const result = await pool.query(
    `
    SELECT
      a.*,
      j.title AS job_title,
      j.company_name,
      r.id AS resume_id,
      cs.overall_match_score,
      cs.strengths,
      COALESCE(array_length(cs.missing_skills, 1), 0) AS missing_skills_count,
      CASE WHEN ra.id IS NOT NULL THEN 'completed' ELSE 'pending' END AS resume_analysis_status,
      i.interview_date
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN resumes r ON r.application_id = a.id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
    LEFT JOIN interviews i ON i.application_id = a.id
    WHERE j.recruiter_id = $1
    ORDER BY a.created_at DESC
    `,
    [recruiterId]
  );

  const pipeline = {
    applied: [],
    under_review: [],
    shortlisted: [],
    interview: [],
    selected: [],
    rejected: [],
  };

  for (const row of result.rows) {
    const app = formatApplication(row);
    if (!pipeline[app.status]) pipeline[app.status] = [];
    pipeline[app.status].push(app);
  }

  return pipeline;
}

module.exports = {
  getStats,
  getRecentApplicants,
  getTopCandidates,
  getTopCandidatesForJob,
  getPipeline,
};