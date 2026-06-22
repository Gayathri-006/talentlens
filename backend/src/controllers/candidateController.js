const candidateService = require("../services/candidateService");

async function stats(req, res, next) {
  try {
    const result = await candidateService.getCandidateStats(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { stats };