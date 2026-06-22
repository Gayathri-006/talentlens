const profileService = require("../services/profileService");

async function getCandidate(req, res, next) {
  try {
    const profile = await profileService.getCandidateProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateCandidate(req, res, next) {
  try {
    const profile = await profileService.updateCandidateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function getRecruiter(req, res, next) {
  try {
    const profile = await profileService.getRecruiterProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateRecruiter(req, res, next) {
  try {
    const profile = await profileService.updateRecruiterProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await profileService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCandidate,
  updateCandidate,
  getRecruiter,
  updateRecruiter,
  changePassword,
};