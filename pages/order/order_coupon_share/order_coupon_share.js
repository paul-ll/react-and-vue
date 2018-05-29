// pages/order/order_coupon_share/order_coupon_share.js
const app = getApp()
const orderService = require('../../../utils/services/order.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const netManager = require('../../../utils/services/net_manager');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    userId: '',
    sign: '',
    shareImg: '',
    isShareDisabled: true,
    imageHost:netManager.configs.imageHost,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置便利购传过来的订单号
    console.log("onLoad.options", options)
    new app.globalData.WeToast()
    if (options.orderId) {
      const that = this
      app.getUserInfo(function (wxappLogin) {
        console.log("onLoad.getUserInfo.wxappLogin", wxappLogin, wxappLogin != null)
        if (wxappLogin != null) {
          let params = {
            orderId: options.orderId,
            userId: wxappLogin.user_id
          }
          orderService.getRedPacketSign(params).then((res) => {
            const resData = res.data
            console.log("onLoad.getRedPacketSign.resData", resData)
            if (resData.code === 0) {
              that.setData({
                orderId: options.orderId,
                userId: wxappLogin.user_id,
                sign: resData.sign,
                shareImg: resData.shareImg,
                isShareDisabled: false
              })
            } else if (resData.code === 1) {
              that.wetoast.toast({title: resData.msg, duration: 1500})
            }
          }, (err) => {
            console.log("onLoad.getRedPacketSign.err", err)
            that.wetoast.toast({title: '登录异常', duration: 2000})
          })
        }
      })
    } else {
      that.wetoast.toast({title: '无订单', duration: 2000})
    }
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    console.log('------', app.globalData, '=======')
    requestAna('share_receive', 'redpackage')
    
    return {
      title: '每日优鲜',
      path: '/pages/order/order_coupon/order_coupon?senderId='+this.data.userId+'&orderId='+this.data.orderId+'&sign='+this.data.sign+'&last_page='+app.globalData.lastPage,
      imageUrl: this.data.shareImg,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }

  }
})