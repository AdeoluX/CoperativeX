const catchAsync = require("../utils/catchAsync");
const { WebhookService } = require("../services");
const { successResponse } = require("../utils/responder");
const { paginateOptions } = require("../utils/utils.utils");

class WebhookController {
    static fundWallet = catchAsync(async (req, res, next) => {
        const create = await WebhookService.fundWallet(req.body)
        return successResponse(res, create);
    });
}

module.exports = WebhookController