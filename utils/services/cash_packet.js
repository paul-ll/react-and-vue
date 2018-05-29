const serviceUtils = require('../service_utils.js')
// 团长开团
function cashGroup(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('cashGroup', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

// 提现
function withDraw(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('withDraw', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}


// 商品列表
function listSku() {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('listSku', '', 1, {}, false)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

//  更多的人数
function showMembers(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('showMembers', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}


//  formId
function submitFormId(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('submitFormId', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

// 分享得现金活动预处理
function preShowActivity(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('preShowActivity', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}




module.exports = {
  cashGroup,
  withDraw,
  listSku,
  showMembers,
  submitFormId,
  preShowActivity
}