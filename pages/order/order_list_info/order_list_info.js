// pages/order/order_coupon_share/order_coupon_share.js
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderExpressMsg: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置便利购传过来的订单号
    console.log("onLoad.options", options)
    const orderExpressMsg = JSON.parse(options.orderExpressMsg)
    this.setData({
        orderExpressMsg:orderExpressMsg
    })
  },
  onShow: function (){
    wx.setNavigationBarTitle({
      title: "订单进度"
  })
  },

})