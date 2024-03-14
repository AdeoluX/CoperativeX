const express = require("express");
const {validate, validateReq} = require('../middleware/validate')
const {authValidators: {signInValidator, signUpValidator, verifyEmailValidator}} = require('../validations/index')
const {
  AssetController
} = require("../controller");
const { verify } = require("../middleware/verifyToken");

const router = express.Router();

router.post("/", verify('admin'), AssetController.create);
router.get("/", AssetController.getAllAssets)
router.get("/:id", AssetController.getOneAsset)
router.patch("/upload-docs/:asset_id", verify('admin'), AssetController.uploadDocs)

module.exports = router; 