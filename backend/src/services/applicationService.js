const pool = require("../config/db");

function formatApplication(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    company: row.company_name,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name || row.full_name,
    candidateEmail: row.email,
    resumeId: row.resume_id || undefined,
    resumeFilename: row.resume_original_name || undefined,
    status: row.status,
    matchScore: row.overall_match_score ?? undefined,
    appliedAt: row.created_at,
    interviewDate: row.interview_date || undefined,
    resumeAnalysisStatus: row.resume_analysis_status || "pending",
    topSkills: row.top_skills || [],
    missingSkillsCount: Number(row.missing_skills_count || 0),
  };
}

async function createApplication(candidateId, body, file) {
  const {
    jobId,
    fullName,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    coverLetter,
  } = body;

  if (!jobId || !fullName || !email) {
    const error = new Error("jobId, fullName, and email are required");
    error.statusCode = 400;
    throw error;
  }

  const job = await pool.query("SELECT id FROM jobs WHERE id = $1 AND status = 'active'", [jobId]);
  if (!job.rows.length) {
    const error = new Error("Job not found or inactive");
    error.statusCode = 404;
    throw error;
  }

  const appResult = await pool.query(
    `
    INSERT INTO applications (
      job_id, candidate_id, full_name, email, phone,
      linkedin, github, portfolio, cover_letter,
      resume_file_path, resume_original_name, status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'applied')
    RETURNING *
    `,
    [
      jobId,
      candidateId,
      fullName,
      email,
      phone || null,
      linkedin || null,
      github || null,
      portfolio || null,
      coverLetter || null,
      file ? file.path : null,
      file ? file.originalname : null,
    ]
  );

  let resumeId = null;

  if (file) {
    const resumeResult = await pool.query(
      `
      INSERT INTO resumes (
        candidate_id, application_id, file_path, original_name, mime_type, size_bytes
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
      `,
      [
        candidateId,
        appResult.rows[0].id,
        file.path,
        file.originalname,
        file.mimetype,
        file.size,
      ]
    );

    resumeId = resumeResult.rows[0].id;
  }

  return getApplicationById(appResult.rows[0].id, candidateId, "candidate", resumeId);
}

async function getMyApplications(candidateId) {
  const result = await pool.query(
    `
    SELECT 
      a.*,
      j.title AS job_title,
      j.company_name,
      r.id AS resume_id,
      cs.overall_match_score,
      CASE WHEN ra.id IS NOT NULL THEN 'completed' ELSE 'pending' END AS resume_analysis_status,
      cs.strengths AS top_skills,
      COALESCE(array_length(cs.missing_skills, 1), 0) AS missing_skills_count,
      i.interview_date
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN resumes r ON r.application_id = a.id
    LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    LEFT JOIN interviews i ON i.application_id = a.id
    WHERE a.candidate_id = $1
    ORDER BY a.created_at DESC
    `,
    [candidateId]
  );

  return result.rows.map(formatApplication);
}

async function getRecentMyApplications(candidateId) {
  const result = await pool.query(
    `
    SELECT 
      a.*,
      j.title AS job_title,
      j.company_name,
      r.id AS resume_id,
      cs.overall_match_score,
      CASE WHEN ra.id IS NOT NULL THEN 'completed' ELSE 'pending' END AS resume_analysis_status,
      cs.strengths AS top_skills,
      COALESCE(array_length(cs.missing_skills, 1), 0) AS missing_skills_count,
      i.interview_date
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN resumes r ON r.application_id = a.id
    LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    LEFT JOIN interviews i ON i.application_id = a.id
    WHERE a.candidate_id = $1
    ORDER BY a.created_at DESC
    LIMIT 5
    `,
    [candidateId]
  );

  return result.rows.map(formatApplication);
}

async function getApplicationById(id, userId, role) {
  let query;
  let values;

  if (role === "candidate") {
    query = `
      SELECT 
        a.*,
        j.title AS job_title,
        j.company_name,
        r.id AS resume_id,
        cs.overall_match_score,
        CASE WHEN ra.id IS NOT NULL THEN 'completed' ELSE 'pending' END AS resume_analysis_status,
        cs.strengths AS top_skills,
        COALESCE(array_length(cs.missing_skills, 1), 0) AS missing_skills_count,
        i.interview_date
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN resumes r ON r.application_id = a.id
      LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
      LEFT JOIN candidate_scores cs ON cs.application_id = a.id
      LEFT JOIN interviews i ON i.application_id = a.id
      WHERE a.id = $1 AND a.candidate_id = $2
    `;
    values = [id, userId];
  } else {
    query = `
      SELECT 
        a.*,
        j.title AS job_title,
        j.company_name,
        r.id AS resume_id,
        cs.overall_match_score,
        CASE WHEN ra.id IS NOT NULL THEN 'completed' ELSE 'pending' END AS resume_analysis_status,
        cs.strengths AS top_skills,
        COALESCE(array_length(cs.missing_skills, 1), 0) AS missing_skills_count,
        i.interview_date
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN resumes r ON r.application_id = a.id
      LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
      LEFT JOIN candidate_scores cs ON cs.application_id = a.id
      LEFT JOIN interviews i ON i.application_id = a.id
      WHERE a.id = $1 AND j.recruiter_id = $2
    `;
    values = [id, userId];
  }

  const result = await pool.query(query, values);

  if (!result.rows.length) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  return formatApplication(result.rows[0]);
}

async function getApplicationsForJob(recruiterId, jobId) {
  const ownership = await pool.query(
    "SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2",
    [jobId, recruiterId]
  );

  if (!ownership.rows.length) {
    const error = new Error("Job not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  const result = await pool.query(
    `
    SELECT 
      a.*,
      j.title AS job_title,
      j.company_name,
      r.id AS resume_id,
      cs.overall_match_score,
      CASE WHEN ra.id IS NOT NULL THEN 'completed' ELSE 'pending' END AS resume_analysis_status,
      cs.strengths AS top_skills,
      COALESCE(array_length(cs.missing_skills, 1), 0) AS missing_skills_count,
      i.interview_date
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN resumes r ON r.application_id = a.id
    LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
    LEFT JOIN candidate_scores cs ON cs.application_id = a.id
    LEFT JOIN interviews i ON i.application_id = a.id
    WHERE a.job_id = $1
    ORDER BY a.created_at DESC
    `,
    [jobId]
  );

  return result.rows.map(formatApplication);
}

async function updateApplicationStatus(recruiterId, id, status) {
  const validStatuses = [
    "applied",
    "under_review",
    "shortlisted",
    "interview",
    "selected",
    "rejected",
  ];

  if (!validStatuses.includes(status)) {
    const error = new Error("Invalid application status");
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `
    UPDATE applications a
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    FROM jobs j
    WHERE a.job_id = j.id
      AND a.id = $2
      AND j.recruiter_id = $3
    RETURNING a.*
    `,
    [status, id, recruiterId]
  );

  if (!result.rows.length) {
    const error = new Error("Application not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  return getApplicationById(id, recruiterId, "recruiter");
}

module.exports = {
  createApplication,
  getMyApplications,
  getRecentMyApplications,
  getApplicationById,
  getApplicationsForJob,
  updateApplicationStatus,
};