
const authRoutes = require("./auth.route")
const userRoutes = require("./user.route")
const assetRoutes = require("./assets.route")
const paymentRoutes = require('./payment.route')
const webhookRoutes = require("./webhook.routes")
const ajoRoutes = require("./ajo.route")

module.exports = {
    authRoutes,
    userRoutes,
    assetRoutes,
    paymentRoutes,
    webhookRoutes,
    ajoRoutes
}