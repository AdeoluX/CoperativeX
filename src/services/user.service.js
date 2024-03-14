const genericRepo = require("../dbservices")

class User {
    static me = async ({auth: {id}}) => {
        const user = await genericRepo.setOptions('Members', {
            condition: {_id: id}
        }).findOne()
        return user
    }
}

module.exports = User