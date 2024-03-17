const genericRepo = require("../dbservices")

class User {
    static me = async ({auth: {id}}) => {
        const user = await genericRepo.setOptions('Members', {
            condition: {_id: id},
            inclussions: ['wallets']
        }).findOne()
        return user
    }

    static myTransaction = async({auth: {id}, paginateOptions}) => {
        const myTransactions = await genericRepo.setOptions('Transactions', {
            condition: {
                member: id
            },
            paginateOptions
        }).findAllAndPagination()
        return myTransactions;
    }

    static myPortfolio = async({auth , paginateOptions}) => {
        const myPortfolio = await genericRepo.setOptions('AssetUser', {
            condition: {
                member: auth.id,
            },
            inclussions: [{ref:'asset', select: 'value amountPaid name images minimumAmount currency'}],
            paginateOptions
        }).findAllAndPagination()
        return myPortfolio
    }
}

module.exports = User