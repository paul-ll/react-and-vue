/**
 * Created by Flame on 2016/12/27.
 */
const orderService = require('../services/order.js')
const thirdApi = require('../services/third_api.js')
const appInteriorSkip = require('../services/app_interior_skip.js')

/**
 * 获取当前页面
 */
function getPage(){
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    return page
}

/**
 * 根据类型选择支付方式
 * @param checkoutDataPayType
 * @param orderDetailDataOrderNo
 * @param orderDetailDataId
 */
function goPayByType(checkoutDataPayType, orderDetailDataOrderNo, orderDetailDataId) {
    if (checkoutDataPayType === 'mryx_pay') {
        goMryxPay(checkoutDataPayType, orderDetailDataOrderNo)
    } else if(checkoutDataPayType === 'wxapp_wxpay_plus') {
        goMryxPayPlus(checkoutDataPayType, orderDetailDataOrderNo, orderDetailDataId)
    } else {
        goWeixinAppPay(orderDetailDataOrderNo, orderDetailDataId)
    }
}

/**
 * 余额支付设置参数
 * @param checkoutDataPayType
 * @param orderDetailDataOrderNo
 */
function goMryxPay(checkoutDataPayType, orderDetailDataOrderNo) {
    const page = getPage()
    orderService.rechargePwd().then(function (res) {
        const rechargePwdData = res.data
        if(rechargePwdData.check_code == 1) {
            orderService.orderPrepay(orderDetailDataOrderNo, checkoutDataPayType).then(function (res) {
                let orderPrepayData = res.data
                thirdApi.hideToast()
                page.setData({
                    orderPrepayData: orderPrepayData,
                    coverView: 1,
                    isGoPay: false
                })
            })
        }else if(rechargePwdData.check_code == 0){
            page.setData({
                isGoPay: false
            })
            appInteriorSkip.checkPhone()
        }
    }, function(error) {
        console.log("支付失败", error)
        payToast(page, '支付失败', 2000)
    }).catch(function() {
        console.log("支付失败", error)
        payToast(page, '支付失败', 2000)
    })
}

/**
 * 组合支付获取参数
 * @param checkoutDataPayType
 * @param orderDetailDataOrderNo
 * @param orderDetailDataId
 */
function goMryxPayPlus(checkoutDataPayType, orderDetailDataOrderNo, orderDetailDataId) {
    const page = getPage()
    orderService.orderPrepay(orderDetailDataOrderNo, checkoutDataPayType).then(function (res) {
        let orderPrepayData = res.data
        console.log('-------orderPrepayData, mryx_pay_plus--------------------------', orderPrepayData)
        thirdApi.hideToast()
        thirdApi.requestPayment(orderPrepayData.timeStamp, orderPrepayData.nonceStr, orderPrepayData.package,
            orderPrepayData.signType, orderPrepayData.sign, orderPrepayData.appId).then(function (res) {
                console.log('-------pay OK---------------------------', res)
                page.setData({
                    isGoPay: false
                })
                appInteriorSkip.finishPay(orderDetailDataId)
            }, function () {
                console.log('--cancel pay--');
                page.cancelPayBox();
            })
    }, function(error) {
        console.log("支付失败", error)
        payToast(page, '支付失败', 2000)
    }).catch(function() {
        console.log("支付失败", error)
        payToast(page, '支付失败', 2000)
    })
}

/**
 * 微信支付
 * @param orderDetailDataOrderNo
 * @param orderDetailDataId
 */
function goWeixinAppPay(orderDetailDataOrderNo, orderDetailDataId) {
    const page = getPage()
    orderService.orderPrepay(orderDetailDataOrderNo, 'wxapp_wxpay').then(function (res) {
        let orderPrepayData = res.data
        console.log('-------orderPrepayData, wxapp_wxpay--------------------------', orderPrepayData)
        thirdApi.hideToast()
        page.setData({
            isGoPay: false
        })
        thirdApi.requestPayment(orderPrepayData.timeStamp, orderPrepayData.nonceStr, orderPrepayData.package,
            orderPrepayData.signType, orderPrepayData.sign, orderPrepayData.appId).then(function (res) {
                console.log('-------pay OK---------------------------', res)
                appInteriorSkip.finishPay(orderDetailDataId)
            }, function () {
                console.log('----cancel pay----');
                page.cancelPayBox();
            })
    }, function(error) {
        console.log("支付失败", error)
        payToast(page, '支付失败', 2000)
    }).catch(function() {
        console.log("支付失败", error)
        payToast(page, '支付失败', 2000)
    })
}

/**
 * 每日优鲜余额支付
 * @param interOrderNo
 * @param password
 * @param orderDetailDataId
 */
function mryxPay(interOrderNo, password, orderDetailDataId, passwordV2) {
    const page = getPage()
    orderService.mryxPayCheckout(interOrderNo, password, passwordV2).then(function(res){
        console.log('-------mryxpay res.data---', res.data, res.data.status == 0)
        if(res.data.status == 0){
            page.setData({
                coverView: 0,
                inputLength: 0,
                paying:false,
                isGoPay: false
            })
            appInteriorSkip.finishPay(orderDetailDataId)
        } else {
            //密码错误等
            console.log('-------mryxpay 错误---',res.data.error_msg)
            page.setData({
                inputLength:0,
                inputContent:'',
                paying:false
            })
            payToast(res.data.error_msg, 2000)
        }
    }, err => {
        payToast(err.data.error_msg, 2000)
    }).catch(err => {
        page.setData({
            paying: false,
            coverView: 0
        })
        payToast('网络异常, 请稍后重试', 2000)
    })
}

function payToast(title, duration=2000) {
    const page = getPage()
    page.wetoast.toast({title: title, duration: duration })
    page.setData({
        isGoPay: false
    })
}

function payModel(title, content, showCancel=false, confirmText="确定", confirmColor="#3CC51F", cancelText="取消", cancelColor="#000000") {
    const page = getPage()
    thirdApi.showModal(title, content, showCancel, confirmText, confirmColor, cancelText, cancelColor)
    page.setData({
        isGoPay: false
    })
}

module.exports = {
    goPayByType: goPayByType,
    mryxPay: mryxPay,
    payToast: payToast,
    payModel: payModel
}