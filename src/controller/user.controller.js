const catchAsync = require("../utils/catchAsync");
const { UserService } = require("../services");
const { successResponse } = require("../utils/responder");

class UserController {
    static me = catchAsync(async (req, res, next) => {
        const {auth} = req
        const create = await UserService.me({auth})
        return successResponse(res, create);
    });
}

module.exports = UserController