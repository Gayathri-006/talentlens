const resumeService = require("../services/resumeService");

async function upload(req, res, next) {
  try {
    const resume = await resumeService.uploadResume(
      req.user.id,
      req.file
    );

    res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
}

async function mine(req, res, next) {
  try {
    const resumes = await resumeService.getMyResumes(req.user.id);
    res.json(resumes);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload,
  mine,
};