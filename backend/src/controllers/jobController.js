const jobService = require("../services/jobService");

async function list(req, res, next) {
  try {
    const jobs = await jobService.listJobs(req.query);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

async function recommended(req, res, next) {
  try {
    const jobs = await jobService.getRecommendedJobs();
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

async function byId(req, res, next) {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json(job);
  } catch (error) {
    next(error);
  }
}

async function recruiterList(req, res, next) {
  try {
    const jobs = await jobService.getRecruiterJobs(req.user.id);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const job = await jobService.createJob(req.user.id, req.body);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const job = await jobService.updateJob(req.user.id, req.params.id, req.body);
    res.json(job);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await jobService.deleteJob(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  recommended,
  byId,
  recruiterList,
  create,
  update,
  remove,
};