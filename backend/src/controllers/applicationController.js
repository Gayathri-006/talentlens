const applicationService = require("../services/applicationService");

async function create(req, res, next) {
  try {
    const application = await applicationService.createApplication(
      req.user.id,
      req.body,
      req.file
    );
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
}

async function mine(req, res, next) {
  try {
    const applications = await applicationService.getMyApplications(req.user.id);
    res.json(applications);
  } catch (error) {
    next(error);
  }
}

async function recentMine(req, res, next) {
  try {
    const applications = await applicationService.getRecentMyApplications(req.user.id);
    res.json(applications);
  } catch (error) {
    next(error);
  }
}

async function byId(req, res, next) {
  try {
    const application = await applicationService.getApplicationById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json(application);
  } catch (error) {
    next(error);
  }
}

async function forJob(req, res, next) {
  try {
    const applications = await applicationService.getApplicationsForJob(
      req.user.id,
      req.params.jobId
    );
    res.json(applications);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const application = await applicationService.updateApplicationStatus(
      req.user.id,
      req.params.id,
      req.body.status
    );
    res.json(application);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  mine,
  recentMine,
  byId,
  forJob,
  updateStatus,
};