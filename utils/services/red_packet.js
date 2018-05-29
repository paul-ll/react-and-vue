const serviceUtils = require('../service_utils.js')
const utils = require('../util');

function showRedPacket(orderId) {
    let url = serviceUtils.getRequestUrl('cxminiStart')
    utils.logi("showRedPacket", orderId, orderId!=0)
    if (orderId!=undefined && orderId!=0) {
        url = serviceUtils.getRequestUrl('cxminiStart', '', 1, { orderId: orderId })
    }
    return serviceUtils.genPromise(url)
}

function newUserRedPacket(orderId) {
    let url = serviceUtils.getRequestUrl('cxminiGuideStart')
    utils.logi("showRedPacket", orderId, orderId!=0)
    if (orderId!=undefined && orderId!=0) {
        url = serviceUtils.getRequestUrl('cxminiGuideStart', '', 1, { orderId: orderId })
    }
    return serviceUtils.genPromise(url)
}

function getRedPacket(formId, orderId) {
    let url = serviceUtils.getRequestUrl('cxGetRedPacket', '', 1, { form_id:formId })
    utils.logi("getRedPacket", orderId, orderId!=0)
    if (orderId!=undefined && orderId!=0) {
        url = serviceUtils.getRequestUrl('cxGetRedPacket', '', 1, { form_id:formId, orderId: orderId })
    }
    return serviceUtils.genPromise(url)
}

//首页弹屏-1红包，2广告，3资产
function getAdvertInfo(isShow) {
    let url = serviceUtils.getRequestUrl('advertInfo')
    utils.logi("getAdvertInfo", isShow, isShow!=0)
    if (isShow!=undefined && isShow!=0) {
        url = serviceUtils.getRequestUrl('advertInfo', '', 1, { isShow: isShow })
    }
    return serviceUtils.genPromise(url)
}

module.exports = {
    showRedPacket: showRedPacket,
    getRedPacket: getRedPacket,
    newUserRedPacket,
    getAdvertInfo
}
