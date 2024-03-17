const catchAsync = require("../utils/catchAsync");
const { UserService } = require("../services");
const { successResponse } = require("../utils/responder");
const { paginateOptions } = require("../utils/utils.utils");

class UserController {
    static me = catchAsync(async (req, res, next) => {
        const {auth} = req
        const create = await UserService.me({auth})
        return successResponse(res, create);
    });

    static myTransaction = catchAsync(async (req, res, next) => {
        const {auth} = req
        const paginateOption = paginateOptions(req)
        const create = await UserService.myTransaction({auth, paginateOptions: paginateOption})
        return successResponse(res, create);
    });

    static myPortfolio = catchAsync(async (req, res, next) => {
        const {auth} = req
        const paginateOption = paginateOptions(req)
        const create = await UserService.myPortfolio({auth, paginateOptions: paginateOption})
        return successResponse(res, create);
    });
}

module.exports = UserController