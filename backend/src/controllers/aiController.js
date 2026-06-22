const aiResumeService = require("../services/aiResumeService");
const candidateScoringService = require("../services/candidateScoringService");
const candidateRankingService = require("../services/candidateRankingService");

async function analyzeResume(req, res, next) {
  try {
    const result = await aiResumeService.analyzeResume(
      req.params.resumeId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function resumeAnalysis(req, res, next) {
  try {
    const result = await aiResumeService.getResumeAnalysis(req.params.resumeId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function latestResumeAnalysis(req, res, next) {
  try {
    const result = await aiResumeService.getLatestResumeAnalysis(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function scoreCandidate(req, res, next) {
  try {
    const result = await candidateScoringService.scoreCandidate(
      req.params.applicationId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function candidateAnalysis(req, res, next) {
  try {
    const result = await candidateScoringService.getCandidateAnalysis(
      req.params.applicationId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function interviewQuestions(req, res, next) {
  try {
    const result = await candidateScoringService.getInterviewQuestions(
      req.params.applicationId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function rankCandidates(req, res, next) {
  try {
    const result = await candidateRankingService.rankCandidates(
      req.params.jobId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeResume,
  resumeAnalysis,
  latestResumeAnalysis,
  scoreCandidate,
  candidateAnalysis,
  interviewQuestions,
  rankCandidates,
};