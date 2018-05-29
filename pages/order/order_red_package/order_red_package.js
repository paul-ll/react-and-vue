const app = getApp()
const utils = require('../../../utils/util.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const orderService = require('../../../utils/services/order.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const thirdApi = require('../../../utils/services/third_api.js')
const addressService = require('../../../utils/services/address.js')
const categoryService = require('../../../utils/services/categories.js')
const servicesUtils = require('../../../utils/service_utils')
const netManager = require('../../../utils/services/net_manager');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageData: null,
    imageHost:netManager.configs.imageHost,
    options: null,
    isLoad: false,
    btnText:'查看更多>',
    network: {
      reconnecting: false,
      noNetwork: false
  },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    utils.logi('order_coupon.onLoad', options)
    thirdApi.showToast('加载中', 'loading', 10000)
    requestAna('goto_order_redpackage', 'order_redpackage')    
    if (options.last_page) {
      app.globalData.lastPage = options.last_page
      delete options.last_page // 埋点数据需要
    }
    this.setData({
      options: options
    })
    new app.globalData.WeToast()
    
    this.initPage()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let that = this;
    let title = "";
    if (that.data.pageData.share_invite_content.miniAppShareInfo.miniTitle) {
      title = that.data.pageData.share_invite_content.miniAppShareInfo.miniTitle
    }
    let miniImgUrl = '';
    if (that.data.pageData.share_invite_content.miniAppShareInfo.miniImgUrl) {
      miniImgUrl = that.data.pageData.share_invite_content.miniAppShareInfo.miniImgUrl
    }
    let path = '';
    if (that.data.pageData.share_invite_content.miniAppShareInfo.miniPath) {
      path = that.data.pageData.share_invite_content.miniAppShareInfo.miniPath
    }
    return {
      title: title,
      imageUrl: miniImgUrl,
      path: path,
    }
  },
  // 初始化页面信息, 包括登录验证逻辑
  initPage() {
    const that = this
    if (!app.globalData.wxappLogin) {
      app.getUserInfo(wxappLogin => {
        utils.logi(wxappLogin)
        app.globalData.wxappLogin = wxappLogin
        app.getAddressInfo(() => {
          that.getPageData()
        },false)
      })
    } else {
      this.getPageData()
    }
  },
  getPageData() {
    let params = this.data.options
    let info = {
      orderId: params.orderId,
      userId: params.userId,
      sign: params.sign,
    }
    orderService.orderRedPacket(info).then((res) => {
      let resData = res.data
      requestAna('red_envelope', 'order_redpackage')    
      // 将10进制色值转为16进制
      if (resData.code == 0) {
        for (let key in resData.color_info) {
          resData.color_info[key] = utils.deciToHex(resData.color_info[key])
        }
        resData.bgcolor = utils.deciToHex(resData.bgcolor)
        if (resData.toast) {
          this.wetoast.toast({ title: resData.toast, duration: 2000 })      
        }
        this.setData({
          pageData: resData,
          'network.noNetwork': false,
          isLoad: true,
        })
      } else {
        this.wetoast.toast({ title: resData.msg || '网络异常, 请稍后重试~', duration: 2000 }) 
        this.setData({
          'network.noNetwork': true,
          isLoad: true,
        })       
      }
      thirdApi.hideToast()      
    }, (err) => {
      thirdApi.hideToast()      
      this.wetoast.toast({ title: err.data.msg || '网络异常, 请稍后重试~', duration: 2000 })
      this.setData({
        'network.noNetwork': true,
        isLoad: true,
      })
      utils.logi(err)
    })
  },
  getStationCode: function () {
    return categoryService.getAllCategories()
  },
  productClick (event) {
    let productSku = event.currentTarget.dataset.sku
    requestAna('click_product', 'order_redpackage', {
      sku: productSku
    })    
    appInteriorSkip.productDetail({productSku})
  },
  // 重新加载数据
  reconnect: function () {
    let that = this;
    that.setData({
      isLoad: false,
    })
    that.initPage();
  },
  goToIndexPage () {
    requestAna('goto_view', 'order_redpackage')
    this.wetoast.toast({ title: '正在前往商城', duration: 1000 })
    setTimeout(function(){
      appInteriorSkip.switchTabIndex()
    },1500)
    
  },
  goToMore(){
    requestAna('goto_view', 'order_redpackage')
    appInteriorSkip.switchTabIndex()
  },
})
