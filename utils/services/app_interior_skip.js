const serviceUtils = require('../service_utils.js')
const utils = require('../util.js')
const thrid_api = require('../services/third_api');

/**
 * 一级页面切换到首页
 * @returns {*}
 */
function switchTabIndex() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('index')
    }
    return thrid_api.wxGenPromise('switchTab', reqData)
}

/**
 * 一级页面切换到购物车页面
 * @returns {*}
 */
function switchTabCart() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('cart')
    }
    return thrid_api.wxGenPromise('switchTab', reqData)
}

/**
 * 一级页面切换到我的信息页面
 * @returns {*}
 */
function switchTabMyInfo() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('myinfo')
    }
    return thrid_api.wxGenPromise('switchTab', reqData)
}

/**
 * 一级页面切换到会员页面
 * @returns {*}
 */
function switchTabVip() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('vip') 
    }
    return thrid_api.wxGenPromise('switchTab', reqData)
}

/**
 * 跳转到商品详情
 * @param productSku [商品的sku]
 * @param selectCategoryId [商品所在频道id]
 * @returns {*}
 */
function productDetail(dataList) {
    let strData = ""
    let i = 0
    for (let key in dataList) {
        if (i === 0) {
            strData = strData + "?" + key + '=' + dataList[key]
        } else {
            strData = strData + "&" + key + '=' + dataList[key]
        }
        i++
    }
    //let strData = "?productSku=" + productSku + "&selectCategoryId=" + selectCategoryId
    utils.logi("productDetail", strData)
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('productdetail') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到结算页
 * @returns {*}
 */
function checkout(params = null) {
    let queryStr = ''
    if (params && !utils.gIsEmptyObject(params)) {
        queryStr = '?' + utils.buildQuery(params)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('checkout') + queryStr
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * redirect到结算页
 * 2018年05月22日14:52:16 记录已废弃
 * @returns {*}
 */
function redirectToCheckout(params = null) {
    let queryStr = ''
    if (params && !utils.gIsEmptyObject(params)) {
        queryStr = '?' + utils.buildQuery(params)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('checkout') + queryStr
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}

/**
 * 跳转到关于我们
 * @returns {*}
 */
function aboutUs() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('aboutus')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到绑定或者校验手机页
 * @returns {*}
 */
function checkPhone() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('checkphone')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到我的订单页面
 * @returns {*}
 */
function myOrder() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('myorder')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 设置余额支付密码
 * @param accessToken [服务端返回]
 * @param spNo [服务端返回]
 * @param phoneNumber [手机号码]
 * @returns {*}
 */
function setPasswd(accessToken, spNo, phoneNumber) {
    const strData = "?accessToken=" + accessToken + "&spNo=" + decodeURIComponent(spNo) + "&phoneNumber=" + phoneNumber
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('setpasswd') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到我的订单，并关闭当前页面
 * @returns {*}
 */
function redirectToMyOrder() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('myorder')
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}

/**
 * 跳转到订单详情
 * @param orderId
 * @returns {*}
 */
function orderDetail(orderId) {
    const strData = "?orderId=" + orderId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('orderdetail') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 重定向到订单详情，用于填单页取消支付用：取消支付后，跳转到订单详情页，订单详情返回到购物车
 * @param orderId
 * @returns {*}
 */
function redirectToOrderDetail(orderId, fromPage = '') {
    let strData = "?orderId=" + orderId
    if (fromPage) {
        strData = strData + '&page=' + fromPage
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('orderdetail') + strData
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}

/** 跳转到快递列表
 * @param orderExpressMsg
 * @returns {*}
 */
function orderAdressList(orderExpressMsg) {
    const strData = "?orderExpressMsg=" + orderExpressMsg
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('orderlistinfo') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}
/**
 * 跳转到我的余额页面
 * @returns {*}
 */
function balanceDetail() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('balancedetail')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到折扣卡页面
 * @returns {*}
 */
function discountDetail() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('discountdetail')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * navgite到红包页面
 * @returns {*}
 */
function navigateToMyRedpackageList(params = null) {
    let queryStr = ''
    if (params && !utils.gIsEmptyObject(params)) {
        queryStr = '?' + utils.buildQuery(params)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('myredpackagelist') + queryStr
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * redirect到红包页面
 * @returns {*}
 */
function redirectToMyRedpackageList(params = null) {
    let queryStr = ''
    if (params && !utils.gIsEmptyObject(params)) {
        queryStr = '?' + utils.buildQuery(params)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('myredpackagelist') + queryStr
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}

/**
 * 跳转到订单详情页面，并关闭当前页面
 * @param orderId
 * @returns {*}
 */
// function redirectToOrderDetail(orderId) {
//     const strData = "?orderId=" + orderId
//     let reqData = {
//         url: serviceUtils.getAppInteriorUrl('orderdetail') + strData
//     }
//     return thrid_api.wxGenPromise('redirectTo', reqData)
// }

/**
 * 跳转到我的地址
 * @param isShow [是否能选择地址并返回,0:不能选择,1:能选择]
 * @returns {*}
 */
function myAddress(isShow = 0, isFromMyInfo) {
    const strData = "?isShow=" + isShow + (isFromMyInfo ? `&isFromMyInfo=${isFromMyInfo}` : '')
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('myaddress') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到编辑地址页面
 * @param operationType [操作类型,EDIT:编辑地址，ADD:添加地址]
 * @param myAddressItemId [地址ID]
 * @returns {*}
 */
function editAddress(operationType, myAddressItemId = "") {
    let strData = "?operationType=" + operationType
    if (myAddressItemId != "") {
        strData = strData + "&myAddressItemId=" + myAddressItemId
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('editaddress') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到城市定位搜索页面
 * @param cityName [城市名字]
 * @param isShow [是否显示城市名字,0:不展示,1:展示]
 * @returns {*}
 */
function locatorAddress(cityName, isShow = 0) {
    const strData = "?cityName=" + cityName + "&isShow=" + isShow
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('locatoraddress') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到城市分布页面
 * @returns {*}
 */
function distributionCity() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('distributioncity')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 按照页面栈返回
 * @param delta [返回页面数量]
 * @returns {*}
 */
function backPage(delta = 1) {
    let reqData = {
        delta: delta
    }
    return thrid_api.wxGenPromise('navigateBack', reqData)
}

/**
 * 跳转到支付完成页面
 * @param orderId
 * @returns {*}
 */
function finishPay(orderId) {
    const strData = "?orderId=" + orderId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('finishpay') + strData
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}

/**
 * 跳转到红包说明页面
 * @param 
 * @returns {*}
 */
function navigateToActiveInstruction() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('activeinstruction')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到活动页
 */
function webPromotion(dataList) {
    let strData = ""
    let i = 0
    for (let key in dataList) {
        if (i === 0) {
            strData = strData + "?" + key + '=' + encodeURIComponent(dataList[key])
        } else {
            strData = strData + "&" + key + '=' + encodeURIComponent(dataList[key])
        }
        i++
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('webpromotion') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到集卡页
 * @param 
 * @returns {*}
 */
// function navigateToCardCollect() {
//     let reqData = {
//         url: serviceUtils.getAppInteriorUrl('cardcollect')
//     }
//     return thrid_api.wxGenPromise('navigateTo', reqData)
// }

/**
 * 广告弹屏跳转活动
 * @param 
 * @returns {*}
 */
function navigateToWxAppLink(reqListLink) {
    wx.navigateTo({
        url: reqListLink, //url跳转地址
        success: function (res) {
            console.log(res)
        },
        fail: function (res) {
            console.log(res)
        }
    })
}

/**
 * 跳转到0元助力
 * @param 
 * @returns {*}
 */
function navigateToZeroPower() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('zeropower')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到社群导流页
 * @param 
 * @returns {*}
 */
function navigateToGroupScan() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('groupscan')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到集卡页
 * @param 
 * @returns {*}
 */
// function navigateToCardCollect() {
//     let reqData = {
//         url: serviceUtils.getAppInteriorUrl('cardcollect')
//     }
//     return thrid_api.wxGenPromise('navigateTo', reqData)
// }

/**
 * 跳转到社群导流页
 * @param 
 * @returns {*}
 */
function navigateToGroupScan() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('groupscan')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转到社群导流页
 * @param 
 * @returns {*}
 */
function navigateToGroupRedPacket({
    formId
}) {
    let queryStr = ''
    if (formId) {
        queryStr += ('?formId=' + formId)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('groupredpacket') + queryStr
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

function redirectToGroupRedPacket({
    formId
}) {
    let queryStr = ''
    if (formId) {
        queryStr += ('?formId=' + formId)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('groupredpacket') + queryStr
    }

    return thrid_api.wxGenPromise('redirectTo', reqData)
}


function navigateToGroupRedPacketV2(formId) {
    let queryStr = ''
    if (formId) {
        queryStr += ('?formId=' + formId)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('groupredpacketv2') + queryStr
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}


function redirectToGroupRedPacketV2(formId) {
    let queryStr = ''
    if (formId) {
        queryStr += ('?formId=' + formId)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('groupredpacketv2') + queryStr
    }

    return thrid_api.wxGenPromise('redirectTo', reqData)
}

function navigateToOrderItemList({
    from = ''
}) {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('orderitemlist') + '?from=' + from
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 跳转邀请有礼
 */

function navigateToWelcomePolite() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('welcomePolite')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)

}

/**
 * 跳转邀请有礼
 */

function navigateToWelcomePolite() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('welcomePolite')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)

}

/**
 * 已邀请的好友列表
 */

function navigateToMyFriend() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('myFriend')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)

}

/**
 * 邀请有礼规则
 */

function navigateToWelcomeRule(imgUrl) {
    const strData = "?imgUrl=" + imgUrl

    let reqData = {
        url: serviceUtils.getAppInteriorUrl('welcomeRule') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}

/**
 * 邀请有礼排行榜
 */

function navigateToWelcomeRank(selectType) {
    const strData = "?type=" + selectType
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('welcomeRank') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)

}
/**
 * 跳转到0元助力
 * @param 
 * @returns {*}
 */
function redirectToZeroPower({
    formId
}) {
    let queryStr = ''
    if (formId) {
        queryStr += ('?formId=' + formId)
    }
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('zeropower') + queryStr
    }

    return thrid_api.wxGenPromise('redirectTo', reqData)
}


/**跳转集卡页面 */


function navigateToProductShare(activityId) {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('productshare') + "?activityId=" + activityId,
    }
    return thrid_api.wxGenPromise('navigateTo', reqData);
}

/**跳转搜索页面 */
function navigateToSearchPage() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('search')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData);
}

function navigateToReFundList(orderId) {
    const strData = "?orderId=" + orderId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('refundList') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)

}

function navigateToReFund(orderId, orderItemId) {
    const strData = "?orderId=" + orderId + "&orderItemId=" + orderItemId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('refund') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)

}

function navigateToReFundProgress(orderId, orderItemId) {
    const strData = "?orderId=" + orderId + "&orderItemId=" + orderItemId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('refundProgress') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)

}

function redirectToReFundProgress(orderId, orderItemId) {
    const strData = "?orderId=" + orderId + "&orderItemId=" + orderItemId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('refundProgress') + strData
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}

function navigateToWebPage(linkAddress, title) {
    const strData = "?link=" + linkAddress + "&title=" + title;
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('webPage') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}
/**
 * 跳转到地址配置页面
 */
function navigateToUrlConfigPage() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('urlConfig')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData);
}

/**
 * 跳转到分享有礼列表页
 */
function navigateToProductShareList() {
    return thrid_api.wxGenPromise('navigateTo', {
        url: serviceUtils.getAppInteriorUrl('productShareList')
    });
}

function redirectToCashPacket(formId) {
    const strData = "?formId=" + formId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('cashPacket') + strData
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}


/**
 * 重定向到上级页面
 */
function redirectToProductShareList() {
    return thrid_api.wxGenPromise('redirectTo', {
        url: serviceUtils.getAppInteriorUrl('productShareList')
    });
}
/**  
 * 新人专享页
 */
function navigateToNewExclusive() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('newExclusive')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData);
}

/**
 * 跳转其他小程序
 */

function navigateToOtherApp(appId, path) {
    let reqData = {
        appId: appId,
        path: path
    }
    return thrid_api.wxGenPromise('navigateToMiniProgram', reqData);
}
/**
 * 砍价相关路由跳转
 */

// 跳转到砍价商品页
function navigateToBargainGoods() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('bargainGoods')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}
// 重定向
function redirectToBargainGoods() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('bargainGoods')
    }
    return thrid_api.wxGenPromise('redirectTo', reqData)
}
// 跳转到砍价详情页
function navigateToBargainDetail(groupId) {
    let strData = "?groupId=" + groupId
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('bargainDetail') + strData
    }
    return thrid_api.wxGenPromise('navigateTo', reqData)
}
/**
 * 跳转会员专享红包
 */

function navigateToMemberPackets() {
    let reqData = {
        url: serviceUtils.getAppInteriorUrl('openInviteUserVipCard')
    }
    return thrid_api.wxGenPromise('navigateTo', reqData);

 }   
// 邀请好友体验会员
function navigateToInviteFriendVip() {
    const strData = "";
    return thrid_api.wxGenPromise('navigateTo',  {
        url: serviceUtils.getAppInteriorUrl('inviteFriendVip') + strData
    })
}

// 开通会员
function navigateToOpenVip() {
    const strData = "";
    return thrid_api.wxGenPromise('navigateTo',  {
        url: serviceUtils.getAppInteriorUrl('openVip') + strData
    })
}

// 开通会员 - 优享会员说明
function navigateToVipInstruction(href) {
    const strData = `?href=${href}`;
    return thrid_api.wxGenPromise('navigateTo',  {
        url: serviceUtils.getAppInteriorUrl('vipInstruction') + strData
    })
}

// 会员页跳到tab对应页面
function navigateToMemberPrivileges(index) {
    const strData = `?index=${index}`;
    return thrid_api.wxGenPromise('navigateTo',  {
        url: serviceUtils.getAppInteriorUrl('memberPrivileges') + strData
    })
}
//跳到会员红包页
function navigateToPackets() {
    const strData = "";
    return thrid_api.wxGenPromise('navigateTo',  {
        url: serviceUtils.getAppInteriorUrl('memberPackets') + strData
    })
}

module.exports = {
    switchTabVip:switchTabVip,
    switchTabIndex: switchTabIndex,
    switchTabCart: switchTabCart,
    switchTabMyInfo: switchTabMyInfo,
    productDetail: productDetail,
    checkout: checkout,
    aboutUs: aboutUs,
    checkPhone: checkPhone,
    myOrder: myOrder,
    setPasswd: setPasswd,
    redirectToMyOrder: redirectToMyOrder,
    orderDetail: orderDetail,
    redirectToOrderDetail: redirectToOrderDetail,
    myAddress: myAddress,
    editAddress: editAddress,
    locatorAddress: locatorAddress,
    distributionCity: distributionCity,
    backPage: backPage,
    balanceDetail: balanceDetail,
    discountDetail: discountDetail,
    finishPay: finishPay,
    webPromotion: webPromotion,
    navigateToMyRedpackageList,
    redirectToCheckout,
    redirectToMyRedpackageList,
    navigateToActiveInstruction,
    navigateToGroupScan,
    redirectToZeroPower,
    navigateToGroupRedPacket,
    navigateToWelcomePolite,
    navigateToMyFriend,
    navigateToWelcomeRule,
    navigateToWelcomeRank,
    redirectToGroupRedPacket,
    redirectToOrderDetail,
    navigateToOrderItemList,
    orderAdressList: orderAdressList,
    navigateToZeroPower,
    navigateToReFundList,
    navigateToReFund,
    navigateToReFundProgress,
    redirectToReFundProgress,
    navigateToProductShare,
    navigateToWxAppLink,
    navigateToWebPage,
    navigateToUrlConfigPage,
    redirectToCashPacket,
    navigateToProductShareList,
    redirectToProductShareList,
    redirectToGroupRedPacketV2,
    navigateToNewExclusive,
    navigateToGroupRedPacketV2,
    navigateToOtherApp,
    navigateToBargainGoods,
    redirectToBargainGoods,
    navigateToBargainDetail,
    navigateToSearchPage,
    navigateToMemberPackets,
    navigateToInviteFriendVip,
    navigateToOpenVip,
    navigateToVipInstruction,
    navigateToMemberPrivileges,
    navigateToPackets
}