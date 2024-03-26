const express = require("express");
const {validate, validateReq} = require('../middleware/validate')
const {authValidators: {signInValidator, signUpValidator, verifyEmailValidator}} = require('../validations/index')
const {
  AjoController
} = require("../controller");
const { verify } = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", verify('user'), AjoController.getAllRuningAjo)
router.post("/create", verify('user'), AjoController.create);
router.post("/invite/:ajoId", verify('user'), AjoController.invite);
router.post("/accept-invitation", verify('user'), AjoController.acceptRejectInvitation);
router.get("/all-invitations", verify('user'), AjoController.getAllPendingInvitations);
router.patch("/update/:ajoId", verify('user'), AjoController.updateAjo);
router.patch("/activate/:ajoId", verify('user'), AjoController.activateAjo)

module.exports = router; 