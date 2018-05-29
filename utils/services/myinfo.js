const serviceUtils = require('../service_utils.js')

//获取余额
function getBalance(){
	const app = getApp()
	const url = serviceUtils.getRequestUrl('balance')
  const header = app.getAddressHeader()
  	return serviceUtils.genPromise(url, 'GET', {}, header.header)
}

//获取余额账单记录信息
function getSearch(){
	const url = serviceUtils.getRequestUrl('search')
  	return serviceUtils.genPromise(url)
}

//获取个人信息
function myInfo() {
	const url = serviceUtils.getRequestUrl('info')
	return serviceUtils.genPromise(url)
}

module.exports = {
	getBalance:getBalance,
	getSearch:getSearch,
	myInfo: myInfo
}