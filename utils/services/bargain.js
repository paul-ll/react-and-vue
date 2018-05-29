/**
 * 砍价相关请求方法
 */
const serviceUtils = require('../service_utils.js')
 /**
  * 获取砍价商品列表
  */
function getBargainGoods() {
  const app = getApp()
  const header = app.getAddressHeader()
  const url = serviceUtils.getRequestUrl('cutGroupIndex', '', 1, {}, true)
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

 /**
  * 获取我的砍价商品列表
  */
function getMyBargainGoods(params={}) {
  const app = getApp()
  const header = app.getAddressHeader()
  const url = serviceUtils.getRequestUrl('cutGroupList', '', 1, {}, true)
  return serviceUtils.genPromise(url, 'GET', params, header.header);
}

// 开团
function cutCreat(params = {}){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('cutCreat', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', params, header.header);
}

// 砍价
function cutGroup(params){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('cutGroup', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', params, header.header);
}

// 获取用户id
function uploadFormId(formId) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('submitFormId', '', 1, {}, true)
  const header = app.getAddressHeader()
  const param = {
    formId,
    type: 0,
    accessToken: app.globalData.wxappLogin.access_token
  };
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

module.exports = {
  getBargainGoods,
  getMyBargainGoods,
  cutCreat,
  cutGroup,
  uploadFormId
}