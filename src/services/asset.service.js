const genericRepo = require("../dbservices")
const { uploadFiles } = require("../utils/cloudinary.utils")

class AssetService {
    static createAsset = async ({name, description, value, minimumAmount, images}) => {
        let createAsset = await genericRepo.setOptions('Asset', {
            data: {
                name,
                description,
                value,
                minimumAmount
            }
        }).create()
        let images_ = []
        //upload all images
        for(var item of images){
            const upload = await uploadFiles(item.tempFilePath)
            const { _id } = await genericRepo.setOptions('Attachment', {
                data: {
                    url: upload.secure_url,
                    fileName: item.name,
                    attachmentType: 'asset',
                    // asset_id: createAsset._id
                }
            }).create()
            images_.push(_id)
        }
        createAsset.images = images_
        await createAsset.save();
        return {message: 'Asset create successfully.'}
    }

    static uploadAssetDocs = async ({asset_id, files}) => {
        let asset = await genericRepo.setOptions('Asset', {
            condition: { _id: asset_id }
        }).findOne()
        let docs = []
        for(var item of files){
            const upload = await uploadFiles(item.tempFilePath)
            const { _id } = await genericRepo.setOptions('Attachment', {
                data: {
                    url: upload.secure_url,
                    fileName: item.name,
                    attachmentType: 'docs',
                    // asset_id: createAsset._id
                }
            }).create()
            docs.push(_id)
        }
        asset.docs = [...asset.docs, ...docs]
        await asset.save();
        return {message: 'Document uploaded successfully.'}
    }

    static getAllAssets = async({paginateOptions}) => {
        const allAssets = await genericRepo.setOptions('Asset', {
            condition: {},
            inclussions: ['docs', 'images'],
            paginateOptions 
        }).findAllAndPagination()
        return allAssets
    }

    static getOneAssets = async({id}) => {
        const allAssets = await genericRepo.setOptions('Asset', {
            condition: {_id: id},
            inclussions: ['images', 'docs']
        }).findOne()
        return allAssets
    }
}

module.exports = AssetService