const pool = require("../config/db");
const { generateJSON } = require("./geminiService");

async function getApplicationForRecruiter(applicationId, recruiterId) {
  const result = await pool.query(
    `
    SELECT 
      a.*,
      j.title,
      j.description,
      j.required_skills,
      j.requirements,
      j.responsibilities,
      r.id AS resume_id,
      ra.analysis AS resume_analysis
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN resumes r ON r.application_id = a.id
    LEFT JOIN resume_analyses ra ON ra.resume_id = r.id
    WHERE a.id = $1 AND j.recruiter_id = $2
    `,
    [applicationId, recruiterId]
  );

  if (!result.rows.length) {
    const error = new Error("Application not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

async function scoreCandidate(applicationId, recruiterId) {
  const app = await getApplicationForRecruiter(applicationId, recruiterId);

  if (!app.resume_analysis) {
    const error = new Error("Resume analysis must be generated before scoring candidate");
    error.statusCode = 400;
    throw error;
  }

  const prompt = `
Compare this candidate with this job and return ONLY valid JSON.

Job:
Title: ${app.title}
Description: ${app.description}
Required skills: ${JSON.stringify(app.required_skills)}
Requirements: ${JSON.stringify(app.requirements)}
Responsibilities: ${JSON.stringify(app.responsibilities)}

Candidate resume analysis:
${JSON.stringify(app.resume_analysis)}

Return exactly:
{
  "overall": 0,
  "technical": 0,
  "experience": 0,
  "education": 0,
  "projects": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "riskFactors": [],
  "recommendation": "",
  "interviewQuestions": {
    "technical": [],
    "project": [],
    "behavioral": [],
    "skillGap": []
  }
}
`;

  const score = await generateJSON(prompt);

  await pool.query(
    `
    INSERT INTO candidate_scores (
      application_id,
      job_id,
      candidate_id,
      overall_match_score,
      technical_match,
      experience_match,
      education_match,
      project_match,
      strengths,
      weaknesses,
      missing_skills,
      risk_factors,
      recommendation,
      interview_questions,
      full_analysis
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    ON CONFLICT (application_id)
    DO UPDATE SET
      overall_match_score = EXCLUDED.overall_match_score,
      technical_match = EXCLUDED.technical_match,
      experience_match = EXCLUDED.experience_match,
      education_match = EXCLUDED.education_match,
      project_match = EXCLUDED.project_match,
      strengths = EXCLUDED.strengths,
      weaknesses = EXCLUDED.weaknesses,
      missing_skills = EXCLUDED.missing_skills,
      risk_factors = EXCLUDED.risk_factors,
      recommendation = EXCLUDED.recommendation,
      interview_questions = EXCLUDED.interview_questions,
      full_analysis = EXCLUDED.full_analysis,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      applicationId,
      app.job_id,
      app.candidate_id,
      score.overall || 0,
      score.technical || 0,
      score.experience || 0,
      score.education || 0,
      score.projects || 0,
      score.strengths || [],
      score.weaknesses || [],
      score.missingSkills || [],
      score.riskFactors || [],
      score.recommendation || "",
      JSON.stringify(score.interviewQuestions || {}),
      JSON.stringify(score),
    ]
  );

  return {
    applicationId,
    overall: score.overall || 0,
    technical: score.technical || 0,
    experience: score.experience || 0,
    education: score.education || 0,
    projects: score.projects || 0,
    summary: score.summary || "",
    strengths: score.strengths || [],
    weaknesses: score.weaknesses || [],
    missingSkills: score.missingSkills || [],
    riskFactors: score.riskFactors || [],
    recommendation: score.recommendation || "",
  };
}

async function getCandidateAnalysis(applicationId, recruiterId) {
  await getApplicationForRecruiter(applicationId, recruiterId);

  const result = await pool.query(
    `SELECT * FROM candidate_scores WHERE application_id = $1`,
    [applicationId]
  );

  if (!result.rows.length) {
    const error = new Error("Candidate score not found");
    error.statusCode = 404;
    throw error;
  }

  const row = result.rows[0];

  return {
    applicationId,
    overall: row.overall_match_score,
    technical: row.technical_match,
    experience: row.experience_match,
    education: row.education_match,
    projects: row.project_match,
    summary: row.full_analysis?.summary || "",
    strengths: row.strengths || [],
    weaknesses: row.weaknesses || [],
    missingSkills: row.missing_skills || [],
    riskFactors: row.risk_factors || [],
    recommendation: row.recommendation || "",
  };
}

async function getInterviewQuestions(applicationId, recruiterId) {
  await getApplicationForRecruiter(applicationId, recruiterId);

  const result = await pool.query(
    `SELECT interview_questions FROM candidate_scores WHERE application_id = $1`,
    [applicationId]
  );

  if (!result.rows.length) {
    const error = new Error("Interview questions not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0].interview_questions || {
    technical: [],
    project: [],
    behavioral: [],
    skillGap: [],
  };
}

module.exports = {
  scoreCandidate,
  getCandidateAnalysis,
  getInterviewQuestions,
};