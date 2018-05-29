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

// pages/order/order_coupon/order_coupon.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageData: null,
    options: null,
    imageHost:netManager.configs.imageHost,
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
    // this.getPageData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
  // 初始化页面信息, 包括登录验证逻辑
  initPage() {
    const that = this
    if (!app.globalData.wxappLogin) {
      app.getUserInfo(wxappLogin => {
        utils.logi(wxappLogin)
        app.globalData.wxappLogin = wxappLogin
        app.getAddressInfo(() => {
          that.getPageData()
        })
      })
    } else {
      this.getPageData()
    }
  },
  getPageData() {
    let params = this.data.options
    let info = {
      orderId: params.orderId,
      userId: params.senderId,
      sign: params.sign
    }
    orderService.orderRedPacket(info).then((res) => {
      let resData = res.data
      requestAna('red_envelope', 'order_redpackage')    
      // 测试数据
      /* resData = {
        skus_type: 0,
        msg: '  ',
        receive_hist: [{
          date: '04/24 20:12',
          nick_name: '于帅',
          balance_text: '8元',
          comment: '373293782997329378',
          avatar: 'http://wx.qlogo.cn/mmopen/ajNVdqHZLLDnBErtnUQk3D1Sv8QheGazRQ9lGO26ibaL8kfAH3ouibzyG6mqB3xdnTCqVZvAAO1jfFib00dwibZtsQ/0'
        }],
        code: 0,
        sender_info: {
          sender_user_head: 'http://missfresh-asschool-develop-common.ufile.ucloud.com.cn/img_20161213223043173.jpg',
          sender_word: '我从每日优鲜领导的20哥大红包,送给最懂吃的你',
          sender_nick_name: 'xxx',
          sender_taste: '爱吃的,推荐你也尝尝'
        },
        show_receive_hist: '1',
        banner: {
          path: 'https://j-image.missfresh.cn/img_20171101172927631.jpg',
          share_invite_content: {
            origin_image_url: '',
            image_url: '',
            sina_url: '',
            wx_url: '',
            title: '',
            friend_url: '',
            content: ''
          },
          link: '',
          name: '         ',
          type: 'vipcard'
        },
        radpack_list: [{
          msg: 'ok',
          code: 0,
          weeks: '周二',
          vocher_type_name: '',
          voucher_name: '红包金额显示测试',
          ordering: '0',
          end_time: '2017-01-31',
          user_voucher_id: 2226,
          preferential_price: 800,
          content: '1、无消费金额限制\n2、可用券价，会员价通用',
          product_sku: '',
          expire_voucher_flag: 0,
          voucher_type: 'packet',
          voucher_description: '',
          tag: '已失效',
          differ_days: '-84',
          status: 2
        }],
        receive_hist_title: '看看朋友们手气如何',
        receive_status: 1,
        color_info: {
          frame_back_c: '16777215',
          ord_c: '#000000',
          price_c: '11222332',
          p_stc_c: '11522332',
          biger_c: '#262626',
          btn_txt_c: '13223322',
          btn_bg_c: '10234412'
        },
        ad_banner: 'http://missfresh-asschool-develop-common.ufile.ucloud.com.cn/img_20161213223043173.jpg',
        toast: '            ~',
        share_invite_content: {
          origin_image_url: '',
          wx_share_type: '0',
          image_url: 'https://j-image.missfresh.cn/img_20171101204315282.jpg',
          sina_url: '',
          wx_url:
            'https://as-vip.missfresh.cn/ug/order-coupon.html?m=1&orderid=30554800&userid=3532934&sign=aeb3806f',
          order_redpack_icon_url:
            'https://j-image.missfresh.cn/img_20170214111549273.png',
          friend_share_type: '1',
          title: '          ...',
          content: '                                   ',
          friend_url:
            'https://as-vip.missfresh.cn/ug/order-coupon.html? m=1&orderid=30554800&userid=3532934&sign=aeb3806f',
          order_redpack_img_url:
            'https://j-image.missfresh.cn/ img_20170806223814025.jpg'
        },
        bgcolor: '#FFECE0',
        success: true,
        action_rule_pic: '1. 本活动只限中国公民参于，优惠券会自动发送到你的微信商城，请进入微信商城查看\n2. 本活动参于人参于时间待定\n3. 本活动3天内有效，红包不找零速度还是读书读书读书的教科书的塑交会对接可是那都是倒计时还是觉得很世界很大',
        button_text: '去微信商城 买买买www111',
        status_text: '红包已放至你的{微信账户}',
        recommend_p: [
          {
            sku: 'xxx',
            image: 'http://wx.qlogo.cn/mmopen/ajNVdqHZLLDnBErtnUQk3D1Sv8QheGazRQ9lGO26ibaL8kfAH3ouibzyG6mqB3xdnTCqVZvAAO1jfFib00dwibZtsQ/0',
            name: '越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果',
            subtitle: '',
            price: {
              price_down: {
                price: 1920
              }
            }
          },
          {
            sku: 'xxx',
            image: 'http://wx.qlogo.cn/mmopen/ajNVdqHZLLDnBErtnUQk3D1Sv8QheGazRQ9lGO26ibaL8kfAH3ouibzyG6mqB3xdnTCqVZvAAO1jfFib00dwibZtsQ/0',
            name: '越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果',
            subtitle: '',
            price: {
              price_down: {
                price: 1920
              }
            }
          },
          {
            sku: 'xxx',
            image: 'http://wx.qlogo.cn/mmopen/ajNVdqHZLLDnBErtnUQk3D1Sv8QheGazRQ9lGO26ibaL8kfAH3ouibzyG6mqB3xdnTCqVZvAAO1jfFib00dwibZtsQ/0',
            name: '越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果越南火龙果',
            subtitle: '',
            price: {
              price_down: {
                price: 1920
              }
            }
          }
        ],
        sender_user_type: 0,
      } */
      // 将10进制色值转为16进制
      if (resData.code == 0) {
        for (let key in resData.color_info) {
          resData.color_info[key] = utils.deciToHex(resData.color_info[key])
        }
        resData.bgcolor = utils.deciToHex(resData.bgcolor)
        if (resData.status_text) {
          this.wetoast.toast({ title: resData.status_text, duration: 2000 })      
        }
        this.setData({
          pageData: resData
        })
      } else {
        this.wetoast.toast({ title: resData.msg || '网络异常, 请稍后重试~', duration: 2000 })        
      }
      thirdApi.hideToast()      
    }, (err) => {
      thirdApi.hideToast()      
      this.wetoast.toast({ title: err.data.msg || '网络异常, 请稍后重试~', duration: 2000 })
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
  goToIndexPage () {
    requestAna('goto_view', 'order_redpackage')
    appInteriorSkip.switchTabIndex()
  }
})
