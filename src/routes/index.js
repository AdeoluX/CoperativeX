
const authRoutes = require("./auth.route")
const userRoutes = require("./user.route")
const assetRoutes = require("./assets.route")
const paymentRoutes = require('./payment.route')
const webhookRoutes = require("./webhook.routes")

module.exports = {
    authRoutes,
    userRoutes,
    assetRoutes,
    paymentRoutes,
    webhookRoutes
}