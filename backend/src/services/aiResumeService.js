const pool = require("../config/db");
const { generateJSON } = require("./geminiService");
const { extractResumeText } = require("../utils/resumeTextExtractor");

async function analyzeResume(resumeId, userId) {
  const resumeResult = await pool.query(
    `
    SELECT *
    FROM resumes
    WHERE id = $1
      AND candidate_id = $2
    `,
    [resumeId, userId]
  );

  if (!resumeResult.rows.length) {
    const error = new Error("Resume not found");
    error.statusCode = 404;
    throw error;
  }

  const resume = resumeResult.rows[0];
  const resumeText = await extractResumeText(resume.file_path);

  const prompt = `
You are a senior technical recruiter, ATS reviewer, and hiring manager.

Analyze this resume as if it were submitted for:
- Software Engineering Intern
- Full Stack Developer Intern
- Web Developer Intern
- Entry-Level Software Engineer

Return ONLY valid JSON.

You must:

1. Give an ATS score (0-100).
2. Give an overall resume score (0-100).
3. Rate:
   - Technical Skills
   - Projects
   - Experience
   - Communication
   - Resume Formatting
4. Identify missing sections.
5. Identify weaknesses.
6. Identify missing technical skills.
7. Suggest concrete improvements.
8. Suggest projects that would improve employability.
9. Estimate interview readiness.
10. Explain why scores were given.

Resume:

${resumeText}

Return exactly:

{
  "summary":"",
  "candidateName":"",
  "email":"",
  "phone":"",
  "linkedin":"",
  "github":"",
  "portfolio":"",

  "atsScore":0,

  "skills":[],
  "education":[],
  "experience":[],
  "projects":[],

  "strengths":[],
  "weaknesses":[],
  "missingSkills":[],
  "missingSections":[],

  "suggestions":[],

  "projectRecommendations":[],

  "improvementPlan":[
    {
      "priority":"high",
      "issue":"",
      "fix":""
    }
  ],

  "interviewReadinessScore":0,

  "scoreReasoning":{
    "overall":"",
    "technical":"",
    "projects":"",
    "experience":"",
    "communication":""
  },

  "scores":{
    "overall":0,
    "technical":0,
    "projects":0,
    "experience":0,
    "communication":0,
    "formatting":0
  }
}
`;

  const analysis = await generateJSON(prompt);

  console.log("AI ANALYSIS:", analysis);

  await pool.query(
    `
    INSERT INTO resume_analyses (
      resume_id,
      candidate_id,
      analysis,
      overall_score
    )
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (resume_id)
    DO UPDATE SET
      analysis = EXCLUDED.analysis,
      overall_score = EXCLUDED.overall_score,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      resumeId,
      userId,
      JSON.stringify(analysis),
      analysis?.scores?.overall || null,
    ]
  );

  await pool.query(
    `
    UPDATE resumes
    SET extracted_text = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [resumeText, resumeId]
  );

  return {
    resumeId,
    ...analysis,
  };
}

async function getResumeAnalysis(resumeId) {
  const result = await pool.query(
    `
    SELECT analysis
    FROM resume_analyses
    WHERE resume_id = $1
    `,
    [resumeId]
  );

  if (!result.rows.length) {
    const error = new Error("Analysis not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    resumeId,
    ...result.rows[0].analysis,
  };
}

async function getLatestResumeAnalysis(userId) {
  const result = await pool.query(
    `
    SELECT
      ra.analysis,
      ra.resume_id
    FROM resume_analyses ra
    JOIN resumes r
      ON r.id = ra.resume_id
    WHERE r.candidate_id = $1
    ORDER BY ra.created_at DESC
    LIMIT 1
    `,
    [userId]
  );

  if (!result.rows.length) {
    const error = new Error("No analysis found");
    error.statusCode = 404;
    throw error;
  }

  return {
    resumeId: result.rows[0].resume_id,
    ...result.rows[0].analysis,
  };
}

module.exports = {
  analyzeResume,
  getResumeAnalysis,
  getLatestResumeAnalysis,
};