// pages/order/refund_list/refund_list.js
const app = getApp()
const refund = require('../../../utils/services/refund.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const no_network = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: {},
    orderId: '',
    nodata: {
      noData: false,
      imgUrl: '',
      noDataText: ''
    },
    haveData: false,
    loading: true,
    network: {
      reconnecting: false,
      noNetwork: false
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId
    })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.addData();
  },
  // 重新加载数据
  reconnect: function () {
    let that = this;
    that.setData({
      loading: true,
      'network.noNetwork': false,
    })

    that.addData();
  },
  // 重新加载数据
  noDataAction: function () {
    let that = this;
    that.setData({
      loading: true,
      'nodata.noData': false,
    })
    that.addData();
  },
  addData: function () {
    let that = this;
    refund.refundList(that.data.orderId).then(res => {
      if (res.data.code == 0) {
        that.setData({
          loading: false,
          haveData: true,
          result: res.data.result
        })
      }
      else{
        that.setData({
          loading: false,
          haveData: false,
          'nodata.noData': true,
          'nodata.imgUrl': '/images/net_nodata.png',
          'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～"
        })
      }
    },error =>{
      // 设置无网络
      that.setData({
        loading: false,
        haveData: false,
        'network.noNetwork': true,
      })
    })
  },
  refundAction: function (e) {
    if (e.currentTarget.dataset.order_item.item_refund_status == 'SUPPLIED') {
      thirdApi.showModal('提示', '该商品您已申请补发，不能再次申请退款')
    }
    else if (e.currentTarget.dataset.order_item.item_refund_status == 'EXPIRED') {
      thirdApi.showModal('提示', that.data.result.expire_msg)

    }
    else {
      appInteriorSkip.navigateToReFund(this.data.orderId, e.currentTarget.dataset.order_item.order_item_id)
    }
  },
  refundActionTwo: function (e) {
    appInteriorSkip.navigateToReFundProgress(this.data.orderId, e.currentTarget.dataset.order_item_id)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})