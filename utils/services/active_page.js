const serviceUtils = require('../service_utils.js')

// address_code=110105&parent_banner_id=1257&parent_banner_type=1&platform=web&promotionId=201_200_203&station_code=MRYX%7Cmryx_qcl&warehouse_code=MRYXSH-QINCHUNLU
function jwebPromotion(reqList) {
    const app = getApp()
    const url = serviceUtils.getRequestUrl('jwebpromotion', '', 1, reqList)
    const header = app.getAddressHeader()
    return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

module.exports = {
  jwebPromotion:jwebPromotion
}