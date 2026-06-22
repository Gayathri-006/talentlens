const emailService = require("../services/emailService");

async function send(req, res, next) {
  try {
    const result = await emailService.sendEmail(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function templates(req, res, next) {
  try {
    const result = await emailService.getTemplates(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createTemplate(req, res, next) {
  try {
    const result = await emailService.createTemplate(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function history(req, res, next) {
  try {
    const result = await emailService.getHistory(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  send,
  templates,
  createTemplate,
  history,
};