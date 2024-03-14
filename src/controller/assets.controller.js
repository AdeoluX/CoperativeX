const catchAsync = require("../utils/catchAsync");
const { AssetService } = require("../services");
const { successResponse } = require("../utils/responder");
const { paginateOptions } = require("../utils/utils.utils");

class AssetController {
    static create = catchAsync(async (req, res, next) => {
        const {auth} = req
        const {files: {images}} = req
        const create = await AssetService.createAsset({ ...req.body, auth, images })
        return successResponse(res, create);
    });

    static uploadDocs = catchAsync(async (req, res, next) => {
        const { auth } = req
        const { asset_id } = req.params
        const {files: {files}} = req
        const uploadDocs = await AssetService.uploadAssetDocs({
            asset_id,
            files,
        })
        return successResponse(res, uploadDocs);
    });

    static getOneAsset = catchAsync(async (req, res, next) => {
        const { id } = req.params
        const assets = await AssetService.getOneAssets({ id })
        return successResponse(res, assets);
    });

    static getAllAssets = catchAsync(async (req, res, next) => {
        const { auth } = req
        const paginateOption = paginateOptions(req)
        const assets = await AssetService.getAllAssets({ paginateOptions: paginateOption })
        return successResponse(res, assets);
    });

    static uploadAssetDocs = catchAsync(async (req, res, next) => {
        const { auth } = req
        const assets = await AssetService.getAllAssets({ paginateOptions: paginateOption })
        return successResponse(res, assets);
    });

}

module.exports = AssetController