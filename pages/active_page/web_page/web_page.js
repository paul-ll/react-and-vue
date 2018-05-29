// pages/active_page/web_page/web_page.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    link: '',
    isImageMode: false,//是否是图片模式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let linkAddress = options.link;

    if (linkAddress.includes('image') || linkAddress.includes('jpg') || linkAddress.includes('png')) {
      this.setData({
        isImageMode: true
      })
    }

    this.setData({
      link: options.link
    })

    wx.setNavigationBarTitle({
      title: options.title
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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