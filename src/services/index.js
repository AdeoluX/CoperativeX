const authService = require("./auth.service")
const KycService = require("./kyc.service")
const UserService = require("./user.service")
const AssetService = require("./asset.service")
const PaymentService = require("./payment-engine.service")
const WebhookService = require("./webhook.service")
const AjoService = require("./ajo.service")

module.exports = {
    authService,
    KycService,
    UserService,
    AssetService,
    PaymentService,
    WebhookService,
    AjoService
}