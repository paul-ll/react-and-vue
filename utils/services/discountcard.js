const serviceUtils = require('../service_utils.js')

function discountCard(){
		const app = getApp()
		const url = serviceUtils.getRequestUrl('discountcard','',1,{dis_type: 'cx'})
  	const header = app.getAddressHeader()
  	return serviceUtils.genPromise(url, 'POST', {}, header.header);
}

module.exports = {
	discountCard:discountCard
}