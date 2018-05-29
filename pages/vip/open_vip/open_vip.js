const {getOpenVipInfo,vipCardPrepare,vipCardGenOrder,vipCardOrderVerify,vipCardOrderPrepay, } = require("../../../utils/services/vip.js")
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const utils = require('../../../utils/util.js')
const pay = require('../../../utils/custom/pay.js')
const {requestAna} = require('../../../utils/service_utils.js')

Page({
  data: {
    // 没有授权信息、地址
    showNoAddressRules: false,
    // 没有网络
    network: {
      noNetwork: false
    },
    // 页面加载中
    loading: true,
    // 接口请求出错页面
    nodata: {
      noData: false,
      imgUrl: '/images/net_nodata.png',
      noDataText: '加载失败了，请稍后重试～'
    },
    // 当前选择的价格卡片索引
    slectedCardIndex: 0
  },
  onLoad: function(options) {
    new app.globalData.WeToast()
    // 获取来源
    if (options.scene) {
      app.globalData.fromSource = options.scene
    }
    this.initPage()
  },
  onReady: function() {
  },
  onShow: function() {
  },
  onHide: function() {
  },
  onUnload: function() {
  },
  onPullDownRefresh: function() {
  },
  onReachBottom: function() {
  },
  onShareAppMessage: function () {
    return {
      title: '快来加入，体验会员特权',
      path: '/page/vip/invite_friend/invite_friend'
    }
  },
  onPageScroll: function() {
  },
  initPage () {
    this.setData({loading: true})
    const {wxappLogin, currentAddressInfo} = app.globalData
    if (wxappLogin && !utils.gIsEmptyObject(currentAddressInfo)) {
      this.getOpenVipInfo()
      return
    }
    app.getUserInfo(() => {
      app.getAddressInfoV2(() => {
        this.getOpenVipInfo()
      }, () => {
        // 网络异常
        this.setNoNetwork()
      })
    }, () => {
      // 网络异常
      this.setNoNetwork()
    }, () => {
      // 授权失败
      this.setNoRule()
    })
  },
  // 获取邀请信息
  getOpenVipInfo () {
    getOpenVipInfo().then((res) => {
      console.log("开通会员页面数据信息：", res)

      const resData = res.data
      if (resData.code === 0) {
        const {card_details, user_member, vip_card_desc_title, vip_card_desc_url_wxapp, page_title, vip_title, promoteDoc, vip_subtitle} = resData.data
        this.setData({card_details, user_member, vip_card_desc_title, vip_card_desc_url_wxapp, page_title, vip_title, promoteDoc, vip_subtitle})
        const recommendCardItem = this.data.card_details.find((item) => {
          return !!item.recommend_icon
        })
        // 默认选中推荐vip卡片
        this.setData({
          slectedCardItem: recommendCardItem || this.data.card_details[0]
        })
        this.setHaveData()
      } else {
        // 错误的响应代码
        this.setNoData()
      }
    }, (err) => {
      this.setNoNetwork()
    })
  },
  // 选择价格卡片
  onSelectCard (evt) {
    const {cardIndex} = evt.currentTarget.dataset;
    this.setData({
      slectedCardItem: this.data.card_details[cardIndex]
    })
  },
  // 点击优享会员说明
  onVipInfoTap (evt) {
    console.log("onVipInfoTap: ", evt)
    const {href} = evt.currentTarget.dataset
    appInteriorSkip.navigateToVipInstruction(href)
  },
  onOpenCardBtnTap (evt) {
    // 判断如果正在支付  
    if (this.data.isPaying) return
    // 点击 续费/升级/开通 会员卡按钮 埋点
    const that = this
    const internal_id = this.data.slectedCardItem.card_internal_id
    that.data.isPaying = true
    vipCardPrepare({internal_id}).then((res) => {
      const pay_type = 'wxapp_wxpay'
      vipCardGenOrder({internal_id, pay_type}).then((res) => {
        const resData = res.data
        const order_tid = resData.id
        vipCardOrderVerify(order_tid).then((res) => {
          vipCardOrderPrepay({order_tid, pay_type}).then((res) => {
            const prepayData = res.data
            const {timeStamp, nonceStr, signType, sign, appId} = prepayData
            const pkg = prepayData.package
            thirdApi.requestPayment(timeStamp, nonceStr, pkg, signType, sign, appId).then(function (res) {
              // 支付成功 原路返回
              that.data.isPaying = false
              appInteriorSkip.backPage()
            }, function (err) {
              const {errMsg} = err
              if (errMsg == 'requestPayment:fail') {
                that.payFailed('支付失败:'.concat(err.err_desc))
              } else if (errMsg == 'requestPayment:fail cancel') {
                // 取消支付
                that.payFailed('取消支付')
              }
            })
          })
        }, (err) => {
          // 校验订单失败
          that.payFailed('校验订单失败')
        })
      }, (err) => {
        // 生单失败
        that.payFailed('生单失败')
      })
    }, (err) => {
      // prepare失败
      that.payFailed('支付prepare失败')
    })
  },
  payFailed(errMsg) {
    // 取消支付
    this.wetoast.toast({ title: errMsg, duration: 2000 })
    this.data.isPaying = false
  },
  // 重新授权回调
  haveRule: function () {
    this.setData({ showNoAddressRules: false })
    this.initPage();
  },
  setHaveData () {
    this.setData({ loading: false, 'nodata.noData': false })
  },
  setNoData () {
    this.setData({ loading: false, 'nodata.noData': true })
  },
  // 无网络
  setNoNetwork () {
    this.setData({
      loading: false,
      'network.noNetwork': true
    })
  },
  // 没有权限
  setNoRule () {
    this.setData({
      loading: false,
      showNoAddressRules: true
    })
  },
  // 无网络-重新连接
  reconnect() {
    this.setData({ 'network.noNetwork': false })
    this.initPage()
  }
})