const netManager = require('../../../utils/services/net_manager');
const storageManager = require('../../../utils/services/storage_manager');

// pages/my_info/url_config/url_config.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    asHostUrlArray: [],
    payHostUrlArray: [],
    mpsHostUrl: [],
    uploadHostUrl: [],

    selectArray: [],

    buttonName: '保存',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.data.selectArray = storageManager.getUrlConfigArray();

    this.setData({
      asHostUrlArray: netManager.asHostUrl,
      payHostUrlArray: netManager.payHostUrl,
      mpsHostUrl: netManager.mpsHostUrl,
      uploadHostUrl: netManager.uploadHostUrl,
      selectArray: this.data.selectArray,
    })


    wx.setNavigationBarTitle({
      title: '小程序访问地址配置页面'
    })
  },

  onAsHostUrlChecked: function (event) {
    this.data.selectArray[0] = event.detail.value;
  },

  onPayHostUrlChecked: function (event) {
    this.data.selectArray[1] = event.detail.value;
  },

  onMpsHostUrlChecked: function (event) {
    this.data.selectArray[2] = event.detail.value;
  },

  onUploadHostUrlChecked: function (event) {
    this.data.selectArray[3] = event.detail.value;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  save: function () {
    this.setData({
      selectArray: this.data.selectArray,
    })

    storageManager.setUrlConfigArray(this.data.selectArray);

    this.setData({
      buttonName: '已保存，重启生效'
    })
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