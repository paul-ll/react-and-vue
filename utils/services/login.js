const serviceUtils = require('../service_utils');

function reLogin(cb, failCb, authorizationFailCb) {
    serviceUtils.login(cb, failCb, authorizationFailCb);
}

module.exports = {
    reLogin
}