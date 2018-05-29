
const serviceUtils = require('../service_utils');


function getRedPackets() {
	const app = getApp()
	const url = serviceUtils.getRequestUrl('vipRedPackets')
	const header = app.getAddressHeader()
	return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

function immediateExperience(){
  const app = getApp()
	const url = serviceUtils.getRequestUrl('immediateExperience')
	const header = app.getAddressHeader()
	return serviceUtils.genPromise(url, 'GET', {}, header.header);
}


function receiveRedPacket(reqList={}) {
	const app = getApp()
	const url = serviceUtils.getRequestUrl('getRedPackets','', 1, reqList, false)
	const header = app.getAddressHeader()
	return serviceUtils.genPromise(url, 'GET', {}, header.header);
}
function getMemberPrivileges() {
	const app = getApp()
	const url = serviceUtils.getRequestUrl('getMemberPrivileges')
	const header = app.getAddressHeader()
	return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

function openInviteUserVipCard(reqList={}) {
	const app = getApp()
	const url = serviceUtils.getRequestUrl('openInviteUserVipCard','', 1, reqList, false)
	const header = app.getAddressHeader()
	return serviceUtils.genPromise(url, 'GET', {}, header.header);
}
function getVipCard(reqList={}) {
	const app = getApp()
	const url = serviceUtils.getRequestUrl('getVipCard','', 1, reqList, false)
	const header = app.getAddressHeader()
	return serviceUtils.genPromise(url, 'GET', {}, header.header);
}




//会员详情
function vipinfo(param){
    const app = getApp()
    const url = serviceUtils.getRequestUrl('vipinfo', '', 1, {}, false)
    const header = app.getAddressHeader()
    return serviceUtils.genPromise(url, 'GET', param, header.header);
  }

 function vipproduct(){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('vipproduct', '', 1, {}, false)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
 }


/**
 * 获取已邀请好友列表数据
 */
function getInvitationInfo(param = {}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('getInvitationInfo')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', param, header.header);
}

/**
 * 获取已邀请好友列表数据
 */
function getOpenVipInfo(param = {}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('getOpenVipInfo')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', param, header.header);
}

function vipCardPrepare(param = {}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('vipCardPrepare')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

function vipCardGenOrder(param = {}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('vipCardGenOrder')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

function vipCardOrderVerify(orderId) {
  const app = getApp()
  const extras = '/'.concat(orderId)
  const url = serviceUtils.getRequestUrl('vipCardOrderVerify', extras)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', {}, header.header);
}

function vipCardOrderPrepay(param = {}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('vipCardOrderPrepay')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

module.exports = {
    getRedPackets,
    receiveRedPacket,
    getMemberPrivileges,
    openInviteUserVipCard,
    getVipCard,
    getInvitationInfo,
    getOpenVipInfo,
    vipCardPrepare,
    vipCardGenOrder,
    vipCardOrderVerify,
    vipCardOrderPrepay,
    vipinfo,
    immediateExperience,
    vipproduct
}
