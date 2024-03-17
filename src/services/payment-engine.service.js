const httpStatus = require("http-status")
const genericRepo = require("../dbservices")
const { generateRandomString } = require("../utils/utils.utils")
const mongoose = require("mongoose")
const { abortIf } = require("../utils/responder")

class PaymentEngineService{
    static fundWallet = async({auth, amount, currency}) => {
        const {id} = auth
        const wallet = await genericRepo.setOptions('Wallet', {
            condition: {
                currency,
                member: id
            },
            inclussions: ['member']
        }).findOne()
        const reference = `FW-${generateRandomString(10, 'alpha')}`
        const transaction = await genericRepo.setOptions('Transactions', {
            data: {
                wallet_id: wallet.id,
                member: id,
                amount,
                type: 'CR',
                currency,
                description: 'Wallet Funding',
                reference
            }
        }).create()
        return {
            amount,
            reference,
            email: wallet?.member?.email
        }
    }
    static buyToken = async({auth, tokens, asset_id, currency}) => {
        const session = await mongoose.startSession()
        try{
            session.startTransaction()
            const { id } = auth
            const user = (await genericRepo.setOptions('Members', {
                condition: {_id: id},
                inclussions: ['wallets']
            }).findOne()).toJSON()
            const wallet = user.wallets.find((item) => item.currency === currency)
            const {availableBalance} = wallet
            const walletId = wallet.id
            const asset = await genericRepo.setOptions('Asset', {
                condition: {_id:asset_id}
            }).findOne()
            const amount = Number(tokens * asset.minimumAmount)
            abortIf(amount > availableBalance, httpStatus.BAD_REQUEST, 'Insufficient Funds.')
            
            const {availableTokens} = asset;
            abortIf(tokens > availableTokens, httpStatus.BAD_REQUEST, 'Not Enough Tokens available.')
            //increment amountPaid
            await genericRepo.setOptions('Asset', {
                condition: {_id: asset_id},
                changes: {
                    $inc: {amountPaid: amount }
                },
                transaction: session
            }).update()
            const reference = `AP-${generateRandomString(10, 'alpha')}`
            await genericRepo.setOptions('Transactions', {
                data: {
                    wallet_id: walletId,
                    member: id,
                    amount: Number(tokens * asset.minimumAmount),
                    type: 'DR',
                    currency,
                    description: 'Asset Purchase',
                    reference,
                    status: 'success'
                },
                transaction: {session}
            }).create()
            //decrement wallet of User
            await genericRepo.setOptions('Wallet', {
                condition: {_id: walletId},
                changes: {
                    $inc: {ledger_balance: -Number(tokens * asset.minimumAmount)}
                },
                transaction: session
            }).update()
            //check AssetUser table
            const assetUser = await genericRepo.setOptions('AssetUser', {
                condition: {member: id, asset: asset_id},
            }).findOne()
            if(!assetUser){
                await genericRepo.setOptions('AssetUser', {
                    data: {member: id, asset: asset_id, tokenOwned: tokens},
                    transaction: {session}
                }).create()
            } else {
                await genericRepo.setOptions('AssetUser', {
                    condition: {member: id, asset: asset_id},
                    changes: {
                        $inc: {tokenOwned: Number(tokens)}
                    },
                    transaction: session
                }).update()
            }
            await session.commitTransaction();
            return {message: 'Asset Bought Successfully!'}
        }catch(error){
            await session.abortTransaction()
            abortIf(error, httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong!");
        }finally{
            await session.endSession();
        }
    }
    
}

module.exports = PaymentEngineService