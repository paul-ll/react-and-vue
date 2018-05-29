//detail.js
const app = getApp()
const orderService = require('../../../utils/services/order.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const pay = require('../../../utils/custom/pay.js')
const { reconnect } = require('../../../utils/templates/no_network/no_network.js')
const { countdown } = require('../../../utils/custom/over_time.js')
const util = require('../../../utils/util.js')
const countTimeCanvas = require('../../../utils/templates/count_time_canvas/count_time_canvas.js')
const requestAna = require('../../../utils/service_utils').requestAna
const storageManager = require('../../../utils/services/storage_manager')
const { flodUp } = require('../../../utils/templates/display_list/display_list')
const sha512 = require('../../../utils/external/sha512.min.js')

Page({
    data: {
        actionSheetItems: ['400-991-1977'],
        coverView: 0,
        inputLength: 0,
        inputContent: '',
        orderPrepayData: {},
        orderDetail: {},
        receiverAddress: '',
        nationWideList: ['', '全国送', '2小时达', '次日达', '明日送达'],
        network: {
            reconnecting: false,
            noNetwork: false
        },
        orderId: '',
        isLoad: false,
        orderStatusName: '',
        orderStatus: '',
        shippingCode: '',
        orderExpressMsg: [],
        // overTimeList: {},
        hideDiscountCard: false,
        totalMS: 7200,
        countTimer: null,
        isOverTime: false,
        paying: false,
        isPaySuccess: false,
        isGoPay: false,
        // overTimeListAgent: true,
        orderChromeInfo: {},
        totalOverTime: 7200,
        orderCount: 0, // 订单商品总数
        isShowDisplayDetail: false,
        fromPage: '',
        vipCardInfo: null,
    },
    reconnect,
    flodUp,
    countDownCanvas: countTimeCanvas.countDownCanvas,
    isOverTime: countTimeCanvas.isOverTime,
    cancelPayBox: function () {
        this.setData({
            coverView: 0,
            inputLength: 0,
            inputContent: ''
        })
    },
    //联系客服
    showActionSheet: function (event) {
        // 集卡页入口
        // bannerSkip.bannerSkip({type: 'COLLECT_CARD'})
        // return
        const that = this
        thirdApi.showActionSheet(that.data.actionSheetItems).then(function (res) {
            console.log("showActionSheet.res", res.tapIndex)
            if (!res.cancel) {
                thirdApi.makePhoneCall(that.data.actionSheetItems[res.tapIndex])
            }
        })
    },
    handleInput: function (event) {
        let inputContent = event.detail.value;
        console.log('handleInput.inputContent', inputContent)
        this.setData({
            inputLength: inputContent.length,
            inputContent: inputContent
        })
        if (inputContent.length == 6) {
            this.setData({
                paying: true
            })
            let passwordV2 = sha512.sha512(inputContent)
            pay.mryxPay(this.data.orderPrepayData.trade_order_no, inputContent, this.data.orderDetail.id, passwordV2)
            // pay.mryxPay(this.data.orderPrepayData.trade_order_no, inputContent, this.data.orderDetailDataId)
            // pay.mryxPay(this.data.orderPrepayData.trade_order_no, inputContent, this.data.orderDetailDataId)
            // let passwordV2 = sha512.sha512(inputContent)
            // pay.mryxPay(this.data.orderPrepayData.trade_order_no, inputContent, this.data.orderDetail.id, passwordV2)
        }
    },
    //跳转到快递列表
    goToIfo: function () {
        const orderExpressMsg = JSON.stringify(this.data.orderExpressMsg);
        console.log(orderExpressMsg)
        appInteriorSkip.orderAdressList(orderExpressMsg)
    },
    cancelPay: function (event) {
        console.log("cancelPay.formEvent", event)
        const that = this
        let orderDetail = this.data.orderDetail
        let formId = event.detail.formId
        let cancelReasonsList = orderDetail.cancel_reasons.map(function (obj) {
            return obj.content
        })
        thirdApi.showActionSheet(cancelReasonsList).then(function (res) {
            console.log("cancelPay.showActionSheet.res", res, !res.cancel)
            if (!res.cancel) {
                console.log(that.data.orderDetail.id, that.data.orderDetail.cancel_reasons[res.tapIndex])
                if (orderDetail.status === 'PENDING') {
                    orderService.cancelOrder(orderDetail.id, orderDetail.cancel_reasons[res.tapIndex], formId).then(function () {
                        that.wetoast.toast({ title: '订单取消成功', duration: 1000 })
                        setTimeout(function () {
                            appInteriorSkip.backPage()
                        }, 1000)
                    })
                } else if (orderDetail.status === 'PAID') {
                    orderService.paidCancelOrder(orderDetail.id, orderDetail.cancel_reasons[res.tapIndex], formId).then(function (res) {
                        const resData = res.data
                        if (resData.code != 0) {
                            thirdApi.showModal('优鲜提醒', resData.msg)
                        } else {
                            that.wetoast.toast({ title: '订单取消成功', duration: 1000 })
                            setTimeout(function () {
                                appInteriorSkip.backPage()
                            }, 1000)
                        }
                    })
                }
            }
        })
    },
    goPay: function () {
        this.setData({
            isGoPay: true
        })
        let orderDetail = this.data.orderDetail
        thirdApi.showToast('正在加载', 'loading', 10000)
        let checkoutDataPayType = orderDetail.pay_type
        let orderDetailDataOrderNo = orderDetail.order_no
        let orderDetailDataId = orderDetail.id
        pay.goPayByType(checkoutDataPayType, orderDetailDataOrderNo, orderDetailDataId)
    },
    forgetPasswd: function () {
        this.setData({
            inputLength: 0,
            inputContent: ''
        })
        appInteriorSkip.checkPhone()
    },
    contactCustomer: function () {
        const that = this
        thirdApi.showModal(that.data.orderDetail.customer_phone_info.customer_phone_button_text,
            that.data.orderDetail.customer_phone_info.customer_phone_num, true).then(function (res) {
                if (res.confirm) {
                    // console.log("order.detail.contactCustomer.event", event)
                    let tmp = that.data.orderDetail.customer_phone_info.customer_phone_num.toString()
                    thirdApi.makePhoneCall(tmp)
                }
            })
    },
    setPaySuccess: function () {
        this.setData({
            isPaySuccess: true
        })
    },
    setTitle: function () {
        wx.setNavigationBarTitle({
            title: "订单详情"
        })
    },
    discountCardIsHide: function (orderStatus, chromeInfo) {
        const that = this
        if (util.gIsEmptyObject(chromeInfo) || orderStatus === 'PAID_CANCELED') {
            that.setData({
                hideDiscountCard: true,
            })
        } else if (orderStatus === 'FINISHED') {
            that.setData({
                hideDiscountCard: true,
            })
        } else if (chromeInfo.over_time > 0) {
            that.setData({
                hideDiscountCard: false,
            })
        } else if (orderStatus === 'SHIPPED' && chromeInfo.over_time > 0) {
            that.setData({
                hideDiscountCard: false,
            })
        } else if (orderStatus === 'PAID' && chromeInfo.over_time > 0) {
            that.setData({
                hideDiscountCard: false,
            })
        } else {
            that.setData({
                hideDiscountCard: true,
            })
        }
    },
    goRefund: function (e) {
        let that = this;
        if (that.data.orderDetail.refund_expire != 0) {
            thirdApi.showModal('提示', that.data.orderDetail.expire_msg)
        }
        else {
            appInteriorSkip.navigateToReFundList(e.currentTarget.dataset.order_id)
        }

    },
    onShow: function () {
        requestAna('view_order', 'order_list')
    },
    onUnload: function () {
        let cvs = wx.createCanvasContext("countDown")
        this.countDownCanvas(cvs, true, this.data.orderDetail)
        if (this.data.countTimer != null) {
            clearInterval(this.data.countTimer)
            this.setData({
                countTimer: null
            })
        }
        this.setData({
            // overTimeList: null
        })
    },
    onHide: function () {
        // if(this.data.countTimer != null){
        //     clearInterval(this.data.countTimer)
        //     this.setData({
        //         countTimer: null
        //     })
        // }
        // this.setData({
        //     overTimeList: null,
        //     overTimeListAgent: true
        // })
    },
    onLoad: function (res) {
        console.log(" ------------------------------order.detail.onload------------------------------ ")
        let nationWideList = this.data.nationWideList
        let userMemberType = app.globalData.userMemberType
        console.log(res)
        nationWideList[2] = userMemberType > 0 ? '1小时达' : '2小时达'
        this.setData({
            orderId: res.orderId,
            isLoad: false,
            nationWideList
        })
        if (res.page) {
            this.setData({
                fromPage: res.page
            })
        }

        new app.globalData.WeToast()
        const that = this
        // let cvs = wx.createCanvasContext("countDown")
        // let countTimer
        orderService.getOrderDetail(this.data.orderId).then(function (res) {
            const resData = res.data;
            storageManager.setActiveOrderItemList(resData.order_items)
            let orderNo = resData.order_no
            console.log("onShow.getOrderDetail.res", resData)
            let orderChromeInfo = resData.chrome_info
            let address = resData.receiver_province + resData.receiver_city + resData.receiver_area + resData.receiver_address
            let orderStatus = resData.status == 'PAID_CANCELED' ? "CANCELED" : resData.status
            let orderCount = that.getOrderCount(resData.order_items)
            //对含有余额支付的情况做一下处理，最后一行不再需要有分割线，PS:2017-12-13 17:00:02，后端没有实现这个功能，暂先注释

            if (resData.vip_card) {
                const cardDoc = resData.vip_card.card_doc;
                if (cardDoc && cardDoc.indexOf('#_$') != -1) {
                    const cardDocTextArray = cardDoc.split('#_$');
                    resData.vip_card.cardDocTextArray = cardDocTextArray;
                }
            }

            that.setData({
                orderDetail: resData,
                receiverAddress: address,
                'network.noNetwork': false,
                isLoad: true,
                orderStatusName: resData.status_msg,
                orderStatus: orderStatus,
                shippingCode: resData.shipping_code,
                orderNo: orderNo,
                orderChromeInfo: orderChromeInfo,
                shippedTime: resData.shipped_time,
                createdTime: resData.created_time,
                totalMS: orderChromeInfo.over_time,
                totalOverTime: orderChromeInfo.delivery_time,
                orderCount,
                vipCardInfo: util.gIsEmptyObject(resData.vip_card) ? null : resData.vip_card,
            })
            that.isOverTime(resData)
            if (that.data.fromPage == 'checkout') {
                that.goPay();
            }

            if (that.data.shippingCode) {
                orderService.orderTrace(that.data.shippingCode, that.data.orderId).then(function (res) {
                    let orderData = res.data instanceof Array ? res.data : []
                    that.setData({
                        orderExpressMsg: orderData
                    })
                })
            }
            that.discountCardIsHide(resData.status, orderChromeInfo)
            // console.log("countdown Funciton is running", that, that.data.orderNo, orderChromeInfo.over_time * 1000)
            // if(that.data.overTimeListAgent){
            // that.setData({
            //     overTimeList: null
            // })
            // }
            countdown(that, that.data.orderNo, orderChromeInfo.over_time * 1000)
            if (orderChromeInfo.over_time > 0) {
                let cvs = wx.createCanvasContext("countDown")
                that.countDownCanvas(cvs, false, resData)
            }
        }, function () {
            that.setData({
                'network.noNetwork': true
            })
        });

        this.setTitle()
    },
    onReady: function () {
        this.setTitle()
    },
    getOrderCount(orders) {
        let count = 0
        if (orders && orders.length) {
            for (let i = 0; i < orders.length; i++) {
                let orderItem = orders[i]
                count += orderItem.quantity
            }
        }
        return count
    },
    openOrderList(event) {
        console.log(event)

        let activeOrderList = storageManager.getActiveOrderItemList()
        if (activeOrderList == null || activeOrderList.length == 0) {
            util.logi('没有设置商品跳转,请检查')
            return
        }

        appInteriorSkip.navigateToOrderItemList({ from: 'orderDetail' })
    }
})
