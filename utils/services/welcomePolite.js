const serviceUtils = require('../service_utils')

function getWelcomePolite() {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('welcomePolite')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header)
}
/**
 * 邀请有礼落地页
 * @param 
 * @returns {*}
 */
function gitActiveWelcomePolite(inviteCode,inviteId){
  const data = {
    inviteCode:inviteCode,
    inviteId:inviteId
  }
  const app = getApp()
  const url = serviceUtils.getRequestUrl('activeWelcomePolite')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', data, header.header)
}

/**
 * 邀请有礼落地页领奖入口
 * @param 
 * @returns {*}
 */
function gitActiveWelcomePoliteEnter(inviteCode,inviteId,openid){
  const data = {
    inviteCode:inviteCode,
    inviteId:inviteId,
    openid:openid
  }
  const app = getApp()
  const url = serviceUtils.getRequestUrl('activeWelcomePoliteEnter')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', data, header.header)
}


function getMyFriend(page) {
  const app = getApp()
  const strData = "?page=" + page
  const url = serviceUtils.getRequestUrl('myFriend') + strData
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header)
}

function getRank(page) {
  const app = getApp()
  const strData = "?pageSize=10&pageNo=" + page
  const url = serviceUtils.getRequestUrl('welcomeRank') + strData
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header)
}




module.exports = {
  getWelcomePolite,
  getMyFriend,
  getRank,
  gitActiveWelcomePolite,
  gitActiveWelcomePoliteEnter,
}