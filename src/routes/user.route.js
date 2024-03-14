const express = require("express");
const {validate, validateReq} = require('../middleware/validate')
const {authValidators: {signInValidator, signUpValidator, verifyEmailValidator}} = require('../validations/index')
const {
  UserController
} = require("../controller");
const { verify } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/me", verify('user'), UserController.me);

module.exports = router; 