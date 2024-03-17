const mongoose = require("mongoose")
const genericRepo = require("../dbservices")

class WebhookService {
    static fundWallet = async ({reference, status}) => {
        const session = await mongoose.startSession()
        try{
            session.startTransaction();
            const findTransaction = await genericRepo.setOptions('Transactions', {
            condition: {reference}
            }).findOne()
            const updateTransaction = await genericRepo.setOptions('Transactions', {
                condition: {reference},
                changes: {status},
                transaction: session
            }).update()
            await genericRepo.setOptions('Wallet', {
                transaction: session,
                changes: {
                    $inc: {ledger_balance: Number(findTransaction.amount)}
                },
                condition: {
                    currency: findTransaction.currency,
                    member: findTransaction.member
                }
            }).update()
            await session.commitTransaction();
            return;
        }catch(error){
            await session.abortTransaction()
            abortIf(error, httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong!");
        }finally{
            await session.endSession();
        }
    }
}

module.exports = WebhookService