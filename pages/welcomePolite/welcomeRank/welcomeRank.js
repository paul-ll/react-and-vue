// pages/welcomePolite/welcomeRank/welcomeRank.js
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const welcomePolite = require('../../../utils/services/welcomePolite.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    countryInfo: {},
    friendInfo: {},
    countryRankList: {},
    friendRankList: {},
    loading: false,
    friendMore: true,
    countryMore: true,
    select: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      select: options.type
    })
    this.addData();
  },
  addData: function () {
    var that = this;
    // 邀请好友接口
    that.showLoading();
    welcomePolite.getRank(that.data.page).then(function (res) {
      console.log(res);
      that.hideLoading();
      if (res.data.tab.length > 0) {

        let array = res.data.tab[0].rankList;
        if (array.length < 10) {
          that.setData({
            countryMore: false
          })
        }

        that.setData({
          countryInfo: res.data.tab[0],
          countryRankList: array
        })
      }
      if (res.data.tab.length > 1) {
        let array = res.data.tab[1].rankList;
        if (array.length < 10) {
          that.setData({
            friendMore: false
          })
        }
        that.setData({
          friendInfo: res.data.tab[1],
          friendRankList: array
        })
      }

    }, function (error) {
      that.hideLoading();
      console.log(error);
    });
  },
  showLoading() {
    this.setData({
      loading: true
    })
  },
  hideLoading() {
    this.setData({
      loading: false
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
  loadMore: function () {
    //分页加载
    const that = this;
    that.showLoading();
    welcomePolite.getRank(++that.data.page).then(function (res) {
      that.hideLoading();
      console.log(res);

      if (res.data.tab.length > 0) {
        let newArray = res.data.tab[0].rankList;
        if (!newArray || newArray.length == 0) {
          return;
        }

        if (newArray.length < 10) {
          that.setData({
            countryMore: false
          })
        }

        let countryRankList = that.data.countryRankList.concat(newArray);
        that.setData({
          countryRankList: countryRankList
        })
      }
      if (res.data.tab.length > 1) {
        let newArray = res.data.tab[1].rankList;
        if (!newArray || newArray.length == 0) {
          return;
        }

        if (newArray.length < 10) {
          that.setData({
            friendMore: false
          })
        }

        let friendRankList = that.data.friendRankList.concat(newArray);
        that.setData({
          friendRankList: friendRankList
        })
      }

    }, function (error) {
      that.hideLoading();
      console.log(error);
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  countryAction: function () {
    let that = this;
    that.setData({
      select: 'country'
    })

  },
  friendAction: function () {
    let that = this;
    that.setData({
      select: 'friend'
    })
  }
})