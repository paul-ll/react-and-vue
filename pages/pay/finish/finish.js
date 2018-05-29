//finish.js
const app = getApp()
const orderService = require('../../../utils/services/order.js')
const redPacketService = require('../../../utils/services/red_packet.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const countTimeCanvas = require('../../../utils/templates/count_time_canvas/count_time_canvas.js')
const utils = require('../../../utils/util.js')
const { countdown } = require('../../../utils/custom/over_time.js')
const redPacket = require('../../../utils/templates/red_packet/red_packet.js')
const {reconnect} = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna

Page({
    data: {
        orderId: 0,
        orderSuccessRes: {},
        overTimeList: {},
        hideDiscountCard: false,
        totalMS: 7200,
        totalOverTime: 7200,
        countTimer: null,
        isOverTime: false,
        isLoad: false,
        network: {
            reconnecting: false,
            noNetwork: false
        },
        scene: 0,
        productId: 0,
        hidenCancel:true,
        riskStatus:'',
        tip:''
    },
    reconnect,
    closeRedPacket: function() {
        redPacket.closeRedPacket()
    },
    getRedPacket: function(event) {
        redPacket.getRedPacket(event.detail.formId, this.data.orderId)
    },
    discountCardIsHide: function(chromeInfo) {
        const that = this
        if (utils.gIsEmptyObject(chromeInfo)) {
            that.setData({
                hideDiscountCard: true
            })
        } else if (chromeInfo.over_time > 0) {
            that.setData({
                hideDiscountCard: false
            })
        }
    },
    countDownCanvas: countTimeCanvas.countDownCanvas,
    isOverTime: countTimeCanvas.isOverTime,
    goIndex: function() {
        appInteriorSkip.switchTabIndex()
        // let pages = getCurrentPages()
        // let prePage = pages[pages.length - 2]
        // prePage.setPaySuccess()
        // appInteriorSkip.backPage(1);
    },
    checkOrder: function() {
        appInteriorSkip.redirectToOrderDetail(this.data.orderId)
    },
    onLoad: function(resData) {
        utils.logi("--------------------------------------pay.finish.onLoad-----------------------------------")
        let orderId = resData.orderId
        this.setData({
            orderId: orderId,
            productId: app.globalData.productId,
            scene: app.globalData.scene
        })
        utils.logi('onLoad.resData', resData)
    },
    onShow: function() {
        const that = this
        const orderId = this.data.orderId
        setTimeout(function() {
            orderService.orderSuccess(orderId).then(function(res) {
                 that.setData({
                   riskStatus:res.data.status,
                   tip:res.data.prompt_document
                })
                utils.logi('onShow.orderSuccess.res', res)
                return orderService.getOrderDetail(orderId)
            }).then(function(payRes) {
                let skus = []
                if (payRes.data.order_items && payRes.data.order_items.length) {
                    payRes.data.order_items.forEach((item, index) => {
                        skus.push(item.sku)
                    })
                }
                requestAna('success', 'payment_success_page', {
                    skus: skus,
                    type: app.globalData.productId + ''
                })
                utils.logi('onShow.getOrderDetail.res', payRes)
                let orderItems = payRes.data.order_items
                let cartInfos = app.globalData.productFromCartInfos
                orderItems.forEach((item) => {
                    delete cartInfos[item.sku]
                })
                app.setProductFromCartInfos(cartInfos)        
                let payData = payRes.data
                let orderChromeInfo = payData.chrome_info
                let orderNo = payData.order_no
                that.setData({
                    orderChromeInfo: orderChromeInfo,
                    orderNo: orderNo,
                    totalMS: orderChromeInfo.over_time,
                    totalOverTime: orderChromeInfo.delivery_time
                })
                that.isOverTime(payData)
                that.discountCardIsHide(orderChromeInfo)
                if (orderChromeInfo.over_time > 0) {
                    let cvs = wx.createCanvasContext("countDown")
                    that.countDownCanvas(cvs, false, payData)
                }

                let overTimeList = that.data.overTimeList
                if (overTimeList[orderId] === undefined || overTimeList[orderId] === null) {
                    let totalMicroSecond = orderChromeInfo.over_time * 1000
                    if (that.data.overTimeListAgent) {
                        that.setData({
                            overTimeList: {}
                        })
                        countdown(that, that.data.orderNo, totalMicroSecond)
                    } else {
                        countdown(that, that.data.orderNo, totalMicroSecond)
                    }
                }
                // let pages = getCurrentPages()
                // let prePage = pages[pages.length - 2]
                // prePage.setPaySuccess()

                redPacketService.showRedPacket(orderId).then(res => {
                    that.setData({
                        redPacket: res.data,
                        isShowPop: res.data.is_show_pop,
                        isLoad: true,
                        'network.reconnecting': false,
                        'network.noNetwork': false
                    })

                    setTimeout(function() {
                        that.setData({
                            'redPacket.bigger': 'bigger'
                        })
                    }, 500)
                }, function (){
                    that.setData({
                        'network.reconnecting': false,
                        'network.noNetwork': true,
                        isLoad: true
                    })
                }).catch(function(res) {
                    that.setData({
                    })
                })
            }, function (){
                that.setData({
                    'network.reconnecting': false,
                    'network.noNetwork': true,
                    isLoad: true
                })
            }).catch(function(res) {
            })
        }, 2000)
    },
    onUnload: function() {
        let cvs = wx.createCanvasContext("countDown")
        this.countDownCanvas(cvs, true, this.data.orderDetail)
        if (this.data.countTimer != null) {
            clearInterval(this.data.countTimer)
        }
        this.setData({
            overTimeList: null
        })
    },
    onHide: function() {
        this.setData({
            overTimeList: null,
            overTimeListAgent: true
        })
    },
    goToBuy: function() {
        this.goIndex()
    }
})
