const recruiterService = require("../services/recruiterService");

async function stats(req, res, next) {
  try {
    res.json(await recruiterService.getStats(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function recentApplicants(req, res, next) {
  try {
    res.json(await recruiterService.getRecentApplicants(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function topCandidates(req, res, next) {
  try {
    res.json(await recruiterService.getTopCandidates(req.user.id));
  } catch (error) {
    next(error);
  }
}

async function topCandidatesForJob(req, res, next) {
  try {
    const limit = Number(req.query.limit || 50);
    res.json(
      await recruiterService.getTopCandidatesForJob(
        req.user.id,
        req.params.jobId,
        limit
      )
    );
  } catch (error) {
    next(error);
  }
}

async function pipeline(req, res, next) {
  try {
    res.json(await recruiterService.getPipeline(req.user.id));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  stats,
  recentApplicants,
  topCandidates,
  topCandidatesForJob,
  pipeline,
};