const serviceUtils = require('../service_utils.js')
// 团长开团
function openGroup(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('openGroup', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 团活动详细信息
function showGroup(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('showGroup', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 团员参团
function joinGroup(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('joinGroup', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 首页是否展示拼红包入口
function showGroupIcon(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('showGroupIcon', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}
// 获取更多活动
function getMoreActivityInfo(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('getMoreActivityInfo', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

function packetTips(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('packetTips', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}


function packetShare(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('packetShare', '', 1, {}, true)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

module.exports = {
  openGroup,
  showGroup,
  joinGroup,
  showGroupIcon,
  getMoreActivityInfo,
  packetTips,
  packetShare
}