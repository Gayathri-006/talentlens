const interviewService = require("../services/interviewService");

async function list(req, res, next) {
  try {
    const interviews = await interviewService.listInterviews(req.user);
    res.json(interviews);
  } catch (error) {
    next(error);
  }
}

async function byId(req, res, next) {
  try {
    const interview = await interviewService.getInterviewById(
      req.params.id,
      req.user
    );
    res.json(interview);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const interview = await interviewService.createInterview(
      req.user.id,
      req.body
    );
    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const interview = await interviewService.updateInterview(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json(interview);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await interviewService.deleteInterview(
      req.params.id,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  byId,
  create,
  update,
  remove,
};