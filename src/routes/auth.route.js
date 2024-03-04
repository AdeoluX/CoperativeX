const express = require("express");
const {validate, validateReq} = require('../middleware/validate')
const {authValidators: {signInValidator, signUpValidator, verifyEmailValidator}} = require('../validations/index')
const {
  authController
} = require("../controller");
const router = express.Router();

router.post("/sign-up", validateReq(signUpValidator), authController.signUp);
router.post("/login", validateReq(signInValidator), authController.logIn);
router.post("/verify-email", validateReq(verifyEmailValidator), authController.activateAccount)
router.post("/authenticate-2fa", authController.authenticate2FA)

module.exports = router; 