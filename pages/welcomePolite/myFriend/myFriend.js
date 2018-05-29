// pages/welcomePolite/myFriend/myFriend.js
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const welcomePolite = require('../../../utils/services/welcomePolite.js')
const no_network = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    invite_tips: '',
    invited_users: [],
    loading: false,
    network: {
      reconnecting: false,
      noNetwork: false
    },
    haveData: false,
    nodata: {
      noData: false,
      imgUrl: '',
      noDataText: ''
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new app.globalData.WeToast()
    this.setData({
      loading: true,
    })
    this.initPage();
  },
  // 重新加载数据
  reconnect: function () {
    let that = this;
    that.setData({
      loading: true,
      'network.noNetwork': false,
    })
    that.initPage();
  },
  // 重新加载数据
  noDataAction: function () {
    let that = this;
    that.setData({
      loading: true,
      'nodata.noData': false,
    })
    that.initPage();
  },
  initPage: function () {
    var that = this;
    that.addData();
  },
  addData: function () {
    var that = this;
    // 邀请好友接口
    welcomePolite.getMyFriend(that.data.page).then(function (res) {
      console.log(res);

      if (res.statusCode == 200) {
        // 正确
        if (res.data.invited_users.length > 0) {
          that.data.page = that.data.page + 1;
          for (var i = 0; i < res.data.invited_users.length; i++) {
            res.data.invited_users[i].income_text_color = res.data.invited_users[i].income_text_color.toString(16)
          }
        }

        that.setData({
          loading: false,
          haveData: true,
        })

        if (res.data.invited_users.length > 0) {
          if (that.data.page == 0) {
            that.setData({
              invite_tips: res.data.invite_tips,
              invited_users: res.data.invited_users
            })
          }
          else {
            that.setData({
              invited_users: that.data.invited_users.concat(res.data.invited_users)
            })
          }
        }
      } else {
        if (res.errMsg) {
          that.wetoast.toast({
            title: res.errMsg
          })
        }
        that.setData({
          loading: false,
          haveData: false,
        })
        if (that.data.invited_users.length == 0) {
          that.setData({
            'nodata.imgUrl': '/images/net_nodata.png',
            'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～",
            'nodata.noData': true,
          })
        }

      }
    }, function (error) {
      // 设置无网络
      that.setData({
        loading: false,
        haveData: false,
      })
      if (that.data.invited_users.length == 0) {
        that.setData({
          'network.noNetwork': true,
        })
      }
    });
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    this.addData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})