const analyticsService = require("../services/analyticsService");

async function overview(req, res, next) {
  try {
    res.json(await analyticsService.overview(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function hiringFunnel(req, res, next) {
  try {
    res.json(await analyticsService.hiringFunnel(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function applicationsOverTime(req, res, next) {
  try {
    res.json(await analyticsService.applicationsOverTime(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function job(req, res, next) {
  try {
    res.json(await analyticsService.jobAnalytics(req.user.id, req.params.jobId));
  } catch (error) {
    next(error);
  }
}

async function pipeline(req, res, next) {
  try {
    res.json(await analyticsService.pipeline(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function aiScores(req, res, next) {
  try {
    res.json(await analyticsService.aiScores(req.user.id));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  overview,
  hiringFunnel,
  applicationsOverTime,
  job,
  pipeline,
  aiScores,
};