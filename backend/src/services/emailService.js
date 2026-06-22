const { Resend } = require("resend");
const pool = require("../config/db");

const resend = new Resend(process.env.RESEND_API_KEY);

function replaceVariables(text = "", variables = {}) {
  let output = text;
  for (const [key, value] of Object.entries(variables)) {
    output = output.replaceAll(`{{${key}}}`, value);
  }
  return output;
}

async function sendEmail(recruiterId, payload) {
  const { to, templateId, subject, body, variables = {} } = payload;

  let finalSubject = subject;
  let finalBody = body;
  let emailType = "custom";

  if (templateId) {
    const templateResult = await pool.query(
      "SELECT * FROM email_templates WHERE id = $1 AND recruiter_id = $2",
      [templateId, recruiterId]
    );

    if (!templateResult.rows.length) {
      const error = new Error("Email template not found");
      error.statusCode = 404;
      throw error;
    }

    const template = templateResult.rows[0];
    finalSubject = template.subject;
    finalBody = template.body;
    emailType = template.event_type || template.template_name;
  }

  finalSubject = replaceVariables(finalSubject, variables);
  finalBody = replaceVariables(finalBody, variables);

  if (!to || !finalSubject || !finalBody) {
    const error = new Error("to, subject and body are required");
    error.statusCode = 400;
    throw error;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: finalSubject,
    html: finalBody.replace(/\n/g, "<br/>"),
  });

  await pool.query(
    `
    INSERT INTO email_history (
      recruiter_id,
      email_type,
      recipient_email,
      subject,
      body,
      status
    )
    VALUES ($1,$2,$3,$4,$5,'sent')
    `,
    [recruiterId, emailType, to, finalSubject, finalBody]
  );

  return { ok: true };
}

async function getTemplates(recruiterId) {
  const result = await pool.query(
    `
    SELECT id, template_name, subject, body
    FROM email_templates
    WHERE recruiter_id = $1
    ORDER BY created_at DESC
    `,
    [recruiterId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.template_name,
    subject: row.subject,
    body: row.body,
  }));
}

async function createTemplate(recruiterId, payload) {
  const { name, subject, body } = payload;

  if (!name || !subject || !body) {
    const error = new Error("name, subject and body are required");
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `
    INSERT INTO email_templates (
      recruiter_id,
      template_name,
      subject,
      body,
      event_type
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, template_name, subject, body
    `,
    [recruiterId, name, subject, body, name]
  );

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.template_name,
    subject: row.subject,
    body: row.body,
  };
}

async function getHistory(recruiterId) {
  const result = await pool.query(
    `
    SELECT *
    FROM email_history
    WHERE recruiter_id = $1
    ORDER BY created_at DESC
    `,
    [recruiterId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    candidate: row.recipient_email,
    type: row.email_type,
    sentAt: row.created_at,
    status: row.status,
    opened: false,
  }));
}

module.exports = {
  sendEmail,
  getTemplates,
  createTemplate,
  getHistory,
};