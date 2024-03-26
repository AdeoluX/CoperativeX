const authController = require("./auth.controller")
const KycController = require("./kyc.controller")
const UserController = require("./user.controller")
const AssetController = require("./assets.controller")
const PaymentController = require("./payment.controller")
const WebhookController = require("./webhook.controller")
const AjoController = require('./ajo.controller')

module.exports = {
    authController, KycController, UserController, AssetController, PaymentController, WebhookController, AjoController
}