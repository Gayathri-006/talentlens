const pool = require("../config/db");

function formatInterview(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    candidateName: row.candidate_name || row.full_name,
    jobTitle: row.job_title,
    date: row.interview_date,
    time: row.interview_time,
    type: row.interview_type,
    meetingLink: row.meeting_link,
    interviewerName: row.interviewer_name,
    notes: row.notes || undefined,
    status: row.status,
  };
}

async function listInterviews(user) {
  const condition =
    user.role === "recruiter"
      ? "i.recruiter_id = $1"
      : "i.candidate_id = $1";

  const result = await pool.query(
    `
    SELECT i.*, a.full_name, j.title AS job_title
    FROM interviews i
    JOIN applications a ON a.id = i.application_id
    JOIN jobs j ON j.id = a.job_id
    WHERE ${condition}
    ORDER BY i.interview_date DESC, i.interview_time DESC
    `,
    [user.id]
  );

  return result.rows.map(formatInterview);
}

async function getInterviewById(id, user) {
  const condition =
    user.role === "recruiter"
      ? "i.recruiter_id = $2"
      : "i.candidate_id = $2";

  const result = await pool.query(
    `
    SELECT i.*, a.full_name, j.title AS job_title
    FROM interviews i
    JOIN applications a ON a.id = i.application_id
    JOIN jobs j ON j.id = a.job_id
    WHERE i.id = $1 AND ${condition}
    `,
    [id, user.id]
  );

  if (!result.rows.length) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }

  return formatInterview(result.rows[0]);
}

async function createInterview(recruiterId, payload) {
  const {
    applicationId,
    date,
    time,
    type,
    meetingLink,
    interviewerName,
    notes,
    status,
  } = payload;

  const appResult = await pool.query(
    `
    SELECT a.id, a.candidate_id
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.id = $1 AND j.recruiter_id = $2
    `,
    [applicationId, recruiterId]
  );

  if (!appResult.rows.length) {
    const error = new Error("Application not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  const candidateId = appResult.rows[0].candidate_id;

  const result = await pool.query(
    `
    INSERT INTO interviews (
      application_id,
      recruiter_id,
      candidate_id,
      interview_date,
      interview_time,
      interview_type,
      meeting_link,
      interviewer_name,
      notes,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
    `,
    [
      applicationId,
      recruiterId,
      candidateId,
      date,
      time,
      type || "technical",
      meetingLink || null,
      interviewerName || null,
      notes || null,
      status || "scheduled",
    ]
  );

  await pool.query(
    `
    UPDATE applications
    SET status = 'interview',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [applicationId]
  );

  return getInterviewById(result.rows[0].id, {
    id: recruiterId,
    role: "recruiter",
  });
}

async function updateInterview(id, recruiterId, payload) {
  const existing = await pool.query(
    `
    SELECT id
    FROM interviews
    WHERE id = $1 AND recruiter_id = $2
    `,
    [id, recruiterId]
  );

  if (!existing.rows.length) {
    const error = new Error("Interview not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  const current = await pool.query(
    "SELECT * FROM interviews WHERE id = $1",
    [id]
  );

  const old = current.rows[0];

  await pool.query(
    `
    UPDATE interviews
    SET interview_date = $1,
        interview_time = $2,
        interview_type = $3,
        meeting_link = $4,
        interviewer_name = $5,
        notes = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    `,
    [
      payload.date ?? old.interview_date,
      payload.time ?? old.interview_time,
      payload.type ?? old.interview_type,
      payload.meetingLink ?? old.meeting_link,
      payload.interviewerName ?? old.interviewer_name,
      payload.notes ?? old.notes,
      payload.status ?? old.status,
      id,
    ]
  );

  return getInterviewById(id, {
    id: recruiterId,
    role: "recruiter",
  });
}

async function deleteInterview(id, recruiterId) {
  const result = await pool.query(
    `
    DELETE FROM interviews
    WHERE id = $1 AND recruiter_id = $2
    RETURNING id
    `,
    [id, recruiterId]
  );

  if (!result.rows.length) {
    const error = new Error("Interview not found or not owned by recruiter");
    error.statusCode = 404;
    throw error;
  }

  return { ok: true };
}

module.exports = {
  listInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
};