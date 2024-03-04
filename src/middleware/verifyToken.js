const httpStatus = require('http-status');
const { abortIf } = require('../utils/responder');
const { verifyToken } = require('../utils/tokenManagement');

const verify = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    abortIf(!token || token == '', httpStatus.FORBIDDEN, 'You shall not pass');
    const data = verifyToken(token);
    abortIf(!data, httpStatus.FORBIDDEN, 'You shall not pass');
    res.locals.auth = data;
    next();
};

const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    abortIf(!token || token == '', httpStatus.FORBIDDEN, 'You shall not pass');
    const data = verifyToken(token);
    abortIf(!data, httpStatus.FORBIDDEN, 'You shall not pass');
    abortIf(data.role !== 'admin', httpStatus.FORBIDDEN, 'You shall not pass')
    res.locals.auth = data;
    next();
};

module.exports = {
    verify,
    verifyAdmin
};
