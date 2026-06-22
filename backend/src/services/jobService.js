const pool = require("../config/db");

function formatJob(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company_name,
    location: row.location,
    jobType: row.job_type,
    experienceLevel: row.experience_level,
    salaryMin: row.min_salary ?? undefined,
    salaryMax: row.max_salary ?? undefined,
    salaryRange: row.salary_range ?? undefined,
    skills: row.required_skills || [],
    description: row.description,
    responsibilities: row.responsibilities || [],
    requirements: row.requirements || [],
    status: row.status,
    applicantsCount: Number(row.applicants_count || 0),
    avgMatchScore: row.avg_match_score ? Number(row.avg_match_score) : undefined,
    createdAt: row.created_at,
  };
}

async function listJobs(filters = {}) {
  const values = [];
  const where = ["j.status = 'active'"];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    where.push(`(j.title ILIKE $${values.length} OR j.company_name ILIKE $${values.length} OR j.description ILIKE $${values.length})`);
  }

  if (filters.location) {
    values.push(`%${filters.location}%`);
    where.push(`j.location ILIKE $${values.length}`);
  }

  if (filters.jobType) {
    values.push(filters.jobType);
    where.push(`j.job_type = $${values.length}`);
  }

  if (filters.experienceLevel) {
    values.push(filters.experienceLevel);
    where.push(`j.experience_level = $${values.length}`);
  }

  if (filters.minSalary) {
    values.push(Number(filters.minSalary));
    where.push(`j.min_salary >= $${values.length}`);
  }

  if (filters.skills) {
    const skillsArray = String(filters.skills).split(",").map(s => s.trim()).filter(Boolean);
    if (skillsArray.length) {
      values.push(skillsArray);
      where.push(`j.required_skills && $${values.length}::text[]`);
    }
  }

  const result = await pool.query(
    `
    SELECT j.*, COUNT(a.id) AS applicants_count, AVG(cs.overall_match_score) AS avg_match_score
    FROM jobs j
    LEFT JOIN applications a ON a.job_id = j.id
    LEFT JOIN candidate_scores cs ON cs.job_id = j.id
    WHERE ${where.join(" AND ")}
    GROUP BY j.id
    ORDER BY j.created_at DESC
    `,
    values
  );

  return result.rows.map(formatJob);
}

async function getRecommendedJobs() {
  const result = await pool.query(
    `
    SELECT j.*, COUNT(a.id) AS applicants_count, AVG(cs.overall_match_score) AS avg_match_score
    FROM jobs j
    LEFT JOIN applications a ON a.job_id = j.id
    LEFT JOIN candidate_scores cs ON cs.job_id = j.id
    WHERE j.status = 'active'
    GROUP BY j.id
    ORDER BY j.created_at DESC
    LIMIT 6
    `
  );

  return result.rows.map(formatJob);
}

async function getJobById(id) {
  const result = await pool.query(
    `
    SELECT j.*, COUNT(a.id) AS applicants_count, AVG(cs.overall_match_score) AS avg_match_score
    FROM jobs j
    LEFT JOIN applications a ON a.job_id = j.id
    LEFT JOIN candidate_scores cs ON cs.job_id = j.id
    WHERE j.id = $1
    GROUP BY j.id
    `,
    [id]
  );

  if (!result.rows.length) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  return formatJob(result.rows[0]);
}

async function getRecruiterJobs(recruiterId) {
  const result = await pool.query(
    `
    SELECT j.*, COUNT(a.id) AS applicants_count, AVG(cs.overall_match_score) AS avg_match_score
    FROM jobs j
    LEFT JOIN applications a ON a.job_id = j.id
    LEFT JOIN candidate_scores cs ON cs.job_id = j.id
    WHERE j.recruiter_id = $1
    GROUP BY j.id
    ORDER BY j.created_at DESC
    `,
    [recruiterId]
  );

  return result.rows.map(formatJob);
}

async function createJob(recruiterId, payload) {
  const {
    title,
    company,
    location,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    salaryRange,
    skills,
    description,
    responsibilities,
    requirements,
    status,
  } = payload;

  if (!title || !company || !description) {
    const error = new Error("Title, company, and description are required");
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `
    INSERT INTO jobs (
      recruiter_id, title, company_name, location, job_type, experience_level,
      salary_range, min_salary, max_salary, required_skills,
      responsibilities, requirements, description, status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *
    `,
    [
      recruiterId,
      title,
      company,
      location || null,
      jobType || null,
      experienceLevel || null,
      salaryRange || null,
      salaryMin || null,
      salaryMax || null,
      skills || [],
      responsibilities || [],
      requirements || [],
      description,
      status || "active",
    ]
  );

  return formatJob({ ...result.rows[0], applicants_count: 0, avg_match_score: null });
}

async function updateJob(recruiterId, id, payload) {
  const existing = await pool.query(
    "SELECT * FROM jobs WHERE id = $1 AND recruiter_id = $2",
    [id, recruiterId]
  );

  if (!existing.rows.length) {
    const error = new Error("Job not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  const old = existing.rows[0];

  const result = await pool.query(
    `
    UPDATE jobs
    SET title = $1,
        company_name = $2,
        location = $3,
        job_type = $4,
        experience_level = $5,
        salary_range = $6,
        min_salary = $7,
        max_salary = $8,
        required_skills = $9,
        responsibilities = $10,
        requirements = $11,
        description = $12,
        status = $13,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $14 AND recruiter_id = $15
    RETURNING *
    `,
    [
      payload.title ?? old.title,
      payload.company ?? old.company_name,
      payload.location ?? old.location,
      payload.jobType ?? old.job_type,
      payload.experienceLevel ?? old.experience_level,
      payload.salaryRange ?? old.salary_range,
      payload.salaryMin ?? old.min_salary,
      payload.salaryMax ?? old.max_salary,
      payload.skills ?? old.required_skills,
      payload.responsibilities ?? old.responsibilities,
      payload.requirements ?? old.requirements,
      payload.description ?? old.description,
      payload.status ?? old.status,
      id,
      recruiterId,
    ]
  );

  return formatJob({ ...result.rows[0], applicants_count: 0, avg_match_score: null });
}

async function deleteJob(recruiterId, id) {
  const result = await pool.query(
    "DELETE FROM jobs WHERE id = $1 AND recruiter_id = $2 RETURNING id",
    [id, recruiterId]
  );

  if (!result.rows.length) {
    const error = new Error("Job not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  return { ok: true };
}

module.exports = {
  listJobs,
  getRecommendedJobs,
  getJobById,
  getRecruiterJobs,
  createJob,
  updateJob,
  deleteJob,
};