const serviceUtils = require('../service_utils.js')
// 团长开团
function openAssist(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('openAssist', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 团活动详细信息
function showAssist(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('showAssist', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 团员参团
function joinAssist(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('joinAssist', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 获取用户id
function zeropowerFormId(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('zeropowerFormId', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 活动是否结束
function isGoing() {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('isGoing', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', {}, header.header);
}
// 0元助力弹窗
function getTips(){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('getTips', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', {}, header.header);
}

module.exports = {
    openAssist,
    showAssist,
    joinAssist,
    isGoing,
    zeropowerFormId,
    getTips,
}