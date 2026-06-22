const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function googleAuth(req, res) {
  res.status(501).json({
    success: false,
    message: "Google OAuth is not implemented yet",
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
  googleAuth,
};