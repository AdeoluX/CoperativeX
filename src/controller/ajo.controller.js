const catchAsync = require("../utils/catchAsync");
const { AjoService } = require("../services");
const { successResponse } = require("../utils/responder");
const { paginateOptions } = require("../utils/utils.utils");

class AjoController {
    static create = catchAsync(async (req, res, next) => {
        const {auth} = req
        const create = await AjoService.create({
            auth,
            body: req.body
        })
        return successResponse(res, create);
    });

    static invite = catchAsync(async (req, res, next) => {
        const {auth} = req
        const {ajoId} = req.params
        const create = await AjoService.invite({auth, ajoId, body: req.body})
        return successResponse(res, create);
    });

    static getAllPendingInvitations = catchAsync(async (req, res, next) => {
        const {auth} = req
        const paginateOption = paginateOptions(req)
        const create = await AjoService.getAllPendingInvitations({
            paginateOptions: paginateOption,
            auth
        })
        return successResponse(res, create);
    });

    static getAllRuningAjo = catchAsync(async (req, res, next) => {
        const {auth} = req
        const paginateOption = paginateOptions(req)
        const create = await AjoService.getAllRuningAjo({auth, paginateOptions:paginateOption})
        return successResponse(res, create);
    });

    static acceptRejectInvitation = catchAsync(async (req, res, next) => {
        const {auth} = req
        const {ajoIvId, action, position} = req.body
        const create = await AjoService.acceptRejectInvitation({
            auth, 
            ajoIvId, 
            action, 
            position
        })
        return successResponse(res, create);
    });

    static updateAjo = catchAsync(async (req, res, next) => {
        const {auth} = req
        const create = await AjoService.updateAjo({
            auth, 
            updates: req.body,
            params: req.params
        })
        return successResponse(res, create);
    });

    static activateAjo = catchAsync(async (req, res, next) => {
        const {auth} = req
        const actvate = await AjoService.activateAjo({
            auth, 
            params: req.params
        })
        return successResponse(res, actvate);
    });
}

module.exports = AjoController