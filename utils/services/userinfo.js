const serviceUtils = require('../service_utils.js')

function getAccessTokenByOpenId(openId) {
  return serviceUtils.getAccessTokenByOpenId(openId);
}

function wxappLogin(loginData) {
  return serviceUtils.wxappLogin(loginData);
}

function miniStart() {
  let url = serviceUtils.getRequestUrl('miniStart')
  return serviceUtils.genPromise(url)
}

module.exports = {
  getAccessTokenByOpenId: getAccessTokenByOpenId,
  wxappLogin: wxappLogin,
  miniStart,
}