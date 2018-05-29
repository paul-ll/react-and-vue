// pages/welcomePolite/welcomePolite.js
const app = getApp()
const appInteriorSkip = require('../../utils/services/app_interior_skip.js')
const welcomePolite = require('../../utils/services/welcomePolite.js')
const no_network = require('../../utils/templates/no_network/no_network.js')
const requestAna = require('../../utils/service_utils.js').requestAna

Page({

  /**
   * 页面的初始数据
   */
  data: {
    select: 'country',
    // idx: 1,
    banner: [],
    rule_pic_url: '', // 详细规则
    image_url: '',
    invate_info: {},
    invate_charts: [],
    countryInfo: {},
    friendInfo: {},
    swiperHeight: 0,
    loading: false,
    network: {
      reconnecting: false,
      noNetwork: false
    },
    haveData: false,
    share_invite_content: {},
    invate_message:{},
    hiddenWindow:true,
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
    // 邀请好友接口
    welcomePolite.getWelcomePolite().then(function (res) {
        console.log(res)
      // res.data.invate_info.invate_num = 3;
      if (res.statusCode == 200) {
        that.setData({
          loading: false,
          haveData: true,
          banner: res.data.banner,
          invite_rule_url: res.data.rule_pic_url,
          image_url: res.data.image_url,
          invate_info: res.data.invate_info,
          invate_charts: res.data.invate_charts,
          share_invite_content: res.data.share_invite_content,
          invate_message: res.data.invate_message
        })
        if (res.invate_message){
          that.setData({
            hiddenWindow: false,
          })
        }

        if (res.data.invate_charts.length > 0) {
          that.setData({
            countryInfo: res.data.invate_charts[0]
          })
        }
        if (res.data.invate_charts.length > 1) {
          that.setData({
            friendInfo: res.data.invate_charts[1]
          })
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
          'nodata.imgUrl': '/images/net_nodata.png',
          'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～",
          'nodata.noData': true,
        })
      }

    }, function (error) {
      // 设置无网络
      that.setData({
        loading: false,
        haveData: false,
        'network.noNetwork': true,
      })
    });
  },

  bindImageLoad: function (e) {
    this.setData({
      swiperHeight: e.detail.height
    })
  },
  countryAction: function () {

    requestAna('switch_nationwide_share_top', 'invite_page')

    let that = this;
    that.setData({
      select: 'country'
    })

  },
  friendAction: function () {
    requestAna('switch_friend_share_top', 'invite_page')
    let that = this;
    that.setData({
      select: 'friend'
    })
  },
  myFrend: function () {
    requestAna('invites_courtesy', 'invited_friends_list')

    appInteriorSkip.navigateToMyFriend()
  },
  ruleAction: function () {
    // 埋点
    requestAna('invite_detail_rule', 'invite_page')

    appInteriorSkip.navigateToWelcomeRule(this.data.rule_pic_url)
  },
  moreAction: function () {
    if (this.data.select == 'country'){
      requestAna('bottom_more_top', 'invite_page')
    }
    else{
      requestAna('invite_top_page', 'invite_page')
    }

    appInteriorSkip.navigateToWelcomeRank(this.data.select)
  },
  closeRedPacket:function(){
    this.setData({
      hiddenWindow: true,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    requestAna('invite_friend_btn', 'invite_page')

    let that = this;
    let title = "";
    if (that.data.share_invite_content.miniAppShareInfo.miniTitle) {
      title = that.data.share_invite_content.miniAppShareInfo.miniTitle
    }
    let miniImgUrl = '';
    if (that.data.share_invite_content.miniAppShareInfo.miniImgUrl) {
      miniImgUrl = that.data.share_invite_content.miniAppShareInfo.miniImgUrl
    }
    let path = '';
    if (that.data.share_invite_content.miniAppShareInfo.miniPath) {
      path = that.data.share_invite_content.miniAppShareInfo.miniPath
    }
    return {
      title: title,
      imageUrl: miniImgUrl,
      path: path,
    }
  }
})