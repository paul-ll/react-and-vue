//my_order.js
const app=getApp()
const orderService = require('../../../utils/services/order.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const utils = require('../../../utils/util.js')
const overTime = require('../../../utils/custom/over_time.js')
const {reconnect} = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils').requestAna

Page({
    data: {
        overTimeList: {},
        myOrderItems: [],
        pages: 0,
        pageNo: 0,
        opacityShow: {
            CANCELED: 0.4,
            PAID_CANCELED: 0.4,
            PENDING: 1,
            SHIPPED: 1,
            FINISHED: 1,
            DECLINED: 0.4,
            PAID: 1
        },
        statusImageIndexs: [0, 1, 2, 3],
        //状态图，四排，各排对应图形，索引0:取消或者拒收图（灰色X），1:正常色（粉色），2:灰色，3:深灰色
        statusImages: [
            [
                '/images/commit.png',
                '/images/commit.png',
                '/images/commit.png',
                '/images/commit.png'
            ],
            [
                '/images/canceled.png',
                '/images/paid.png',
                '/images/paid.png',
                '/images/paid.png'
            ],
            [
                '/images/canceled.png',
                '/images/shipped.png',
                '/images/no-shipped.png',
                '/images/shipped.png'
            ],
            [
                '/images/rejection.png',
                '/images/signed.png',
                '/images/no-signed.png',
                '/images/signed.png'
            ]
        ],
        allImage :  [
            [
                '/images/commit.png',
                '/images/commit.png',
                '/images/commit.png',
                '/images/commit.png'
            ],
            [
                '/images/canceled.png',
                '/images/paid.png',
                '/images/paid.png',
                '/images/paid.png'
            ],
            [
                '/images/canceled.png',
                '/images/shipped.png',
                '/images/no-shipped.png',
                '/images/shipped.png'
            ],
            [
                '/images/rejection.png',
                '/images/signed.png',
                '/images/no-signed.png',
                '/images/signed.png'
            ]
        ],
        statusShow: {
            CANCELED: {
                imageIndex: [3, 0],
                statusText: ['已提交', '已取消']
            },
            PAID_CANCELED:{
                imageIndex: [3, 0],
                statusText: ['已提交', '已取消']
            },
            PENDING:{
                 imageIndex: [1, 1, 2, 2],
                 statusText: ['已提交', '未支付', '配送中', '已签收']
            },
            SHIPPED:{
                imageIndex: [1, 1, 1, 2],
                statusText: ['已提交', '已支付', '配送中', '已签收']
            },
            FINISHED:{
                imageIndex: [1, 1, 1, 1],
                statusText: ['已提交', '已支付', '配送中', '已签收']
            },
            DECLINED:{
                imageIndex: [3, 3, 3, 1],
                statusText: ['已提交', '已支付', '配送中', '已拒收']
            },
            PAID:{
                 imageIndex: [1, 1, 2, 2],
                 statusText: ['已提交', '已支付', '配送中', '已签收']
            }
        },
        network: {
            noNetwork: false,
            reconnecting: false
        },
        totalMSList: {},
        isLoad: false
    },
    reconnect,
    openDetail: function (event) {
        utils.logi("openDetail.event", event)
        appInteriorSkip.orderDetail(event.currentTarget.dataset.myOrderItemId)
    },
    setTitle: function () {
        wx.setNavigationBarTitle({
            title: "我的订单"
        })
    },
    isNoExistOverTime: function(overTime) {
        return overTime === undefined || overTime === null
    },
    loadOrderItems: function (pageNo=0) {
        const that = this
        let reqList = {}
        if(pageNo != 0){
            reqList = {
                page: pageNo
            }
        }
        orderService.getAllOrderItems(reqList).then(function(res) {
            const resData = res.data;
            console.log(resData)
            const resOrderItems = resData.results
            let resOrderNum = resOrderItems.length
            let myOrderItems = []
            console.log(resData)
            if(pageNo != 0) {
                myOrderItems = that.data.myOrderItems
                let myOrderNum = myOrderItems.length
                for(let i=myOrderNum; i<myOrderNum+resOrderNum; ++i){
                    myOrderItems[i] = resOrderItems[i-myOrderNum]
                }
            }else {
                myOrderItems = resOrderItems
            }
            utils.logi("loadOrderItems.getAllOrderItems.res", resData, that.data.overTimeList)
            let overTimeList = that.data.overTimeList
            for(let i=0; i<myOrderItems.length; ++i){
                let myOrderItem = myOrderItems[i]
                if(!utils.gIsEmptyObject(myOrderItem.chrome_info) && myOrderItem.chrome_info.over_time>0){
                    if( that.isNoExistOverTime(overTimeList[myOrderItem.order_no]) && myOrderItem.status != 'PAID_CANCELED'){
                        let totalMicroSecond = myOrderItem.chrome_info.over_time * 1000
                        overTime.countdown(that, myOrderItem.order_no, totalMicroSecond)
                    }
                }
            }
            that.setData({
                myOrderItems: myOrderItems,
                pages: resData.pages,
                pageNo: resData.page_no,
                'network.noNetwork': false,
                isLoad: true
            });
        }, function(res) {
            that.setData({
                'network.noNetwork': true,
                isLoad: true
            });
        }).catch(res => utils.logi("my_order.loadOrderItems.exception", res));
    },
    goRefund:function(e){
      appInteriorSkip.navigateToReFundList(e.currentTarget.dataset.order_id)

    },
    onLoad: function () {
        utils.logi(" ------------------------------order.my_order.onload------------------------------ ")

        //countdown(this, this.data.totalMicroSecond);

    },
    onUnload: function (){
        this.setData({
            overTimeList: null
        })
    },
    onShow: function(){
        requestAna('view_all_orders', 'n_individual_center')
        this.setTitle()
        this.loadOrderItems()
        this.setData({
            overTimeList: {}
        })
    },
    onHide: function () {
        this.setData({
            overTimeList: null
        })
    },
    onReady: function () {
        this.setTitle()
    },
    onPullDownRefresh: function (event) {
        this.setTitle()
        this.loadOrderItems()
        wx.stopPullDownRefresh()
    },
    onReachBottom: function (event) {
        this.setTitle()
        let pages = this.data.pages
        let pageNo = this.data.pageNo + 1
        if(pageNo<=pages){
            this.loadOrderItems(pageNo)
        }
    }
})