const catchAsync = require("../utils/catchAsync");
const {
  authService
} = require("../services");
const { successResponse, abortIf } = require("../utils/responder");
const httpStatus = require("http-status");

const signUp = catchAsync(async (req, res, next) => {
  const create = await authService.userSignUp(req.body);
  return successResponse(res, create);
});

const logIn = catchAsync(async (req, res, next) => {
  const log_in = await authService.login({...req.body});
  return successResponse(res, log_in);
});

const activateAccount = catchAsync(async (req, res, next) => {
  const log_in = await authService.activateAccount({...req.body});
  return successResponse(res, log_in);
});

const authenticate2FA = catchAsync(async (req, res, next) => {
  const log_in = await authService.authenticate2FA({...req.body});
  return successResponse(res, log_in);
});


module.exports = {
  signUp,
  logIn,
  activateAccount,
  authenticate2FA
};
