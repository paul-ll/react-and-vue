const app = getApp()
const red_service = require('../../../utils/services/group_redpackage.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const no_network = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const netManager = require('../../../utils/services/net_manager');
const zero_power = require('../../../utils/services/zero_power.js')
const bannerSkip = require('../../../utils/custom/banner_skip.js')

const productOperate = require('../../../utils/services/product_operate');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isExceedOpenLimit: '',//参与活动次数限制
    hour: '00',
    min: '00',
    second: '00',
    colon: '0',
    grouponCode: "",
    redPacket: {},
    groupon: {},
    redDetail: {},
    grouponMemberList: [],
    awardList: [],
    commander: {},
    isJoin: 0,
    isCommander: 0,
    shareDoc: "",
    shareImg: "",
    loading: true,
    network: {
      reconnecting: false,
      noNetwork: false
    },
    options: {},
    isGoing: 0,
    haveGroupOn: 0,
    loadingHidden: true,
    nodata: {
      noData: false,
      imgUrl: '',
      noDataText: ''
    },
    haveData: false,
    showBounce: false,
    loadingCount: 0,
    showNoRules: false,
    limit: '',
    page: '',
    moreInfo: [],
    showExplain: false,
    ruleImg: '',
    code: 0,
    pageData: {},

    //购物车信息
    cartInfo: {
      productFromCartInfos: {},
      cartCount: 0
    },
    tipesInfo: [],
    goodsLoading: false,
    joinMessage: "",
    hiddenTop: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      options: options
    })
    if (options.scene) {
      app.globalData.fromSource = options.scene
    }
    new app.globalData.WeToast()

    productOperate.setCallback({
      onFail(error) {
        that.showToast(error.title);
      },
      onSuccess(res) {
        that.setData({
          cartInfo: res,
        })
      }
    })

    that.initPage();
  },

  showToast(str) {
    //在调用该方法前，必须先为当前的Page添加一个toast成员属性
    this.wetoast.toast({ title: str, duration: 1500 })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    productOperate.setCallback(null);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    productOperate.setCallback({
      onFail(error) {
        that.showToast(error.title);
      },
      onSuccess(res) {
        that.setData({
          cartInfo: res,
        })
      }
    })
    this.getPoductFromCartInfos();
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
  haveRule: function () {
    let that = this;
    that.setData({
      loading: true,
      showNoRules: false
    })
    that.initPage();
  },

  onPageScroll: function (e) {
    var that = this;
    var h = e.scrollTop;
    // var device = wx.getSystemInfoSync();
    // var height = device.windowHeight;
    if (h > 200) {
      that.setData({
        hiddenTop: false
      })
    }
    else {
      that.setData({
        hiddenTop: true
      })
    }
  },
  topAction: function () {
    thirdApi.pageScrollTo(0)
  },
  initPage: function () {
    var that = this;
    app.getUserInfo(wxAppLogin => {
      //  已经开团
      let options = that.data.options;
      // options.grouponCode = '443085214198005760'
      app.getAddressInfoV2(function () {
        if (options.grouponCode) {
          // 查看接口
          that.showPacket(options.grouponCode)
        }
        else {
          // 开团接口 
          that.openPacket();
        }
      }, res => {
        that.showNetErrorView();
      });
    }, res => {
      that.showNetErrorView()
    }, res => {
      // 无权限
      that.showNoRuleView();
    })
  },
  // 开团接口
  openPacket: function () {
    var that = this
    // 团长开团
    var param = {
      sourceForm: 'weixin_app'
    };
    let options = that.data.options;
    let wxAppLogin = app.globalData.wxappLogin;

    if (options.formId) {
      param.formId = options.formId;
    }
    if (wxAppLogin) {
      param.accessToken = wxAppLogin.access_token;
      param.userNickName = wxAppLogin.nick_name;
      param.userHeadImg = wxAppLogin.portrait;
    }
    red_service.openGroup(param).then(function (res) {
      if (res.data.code == 0) {
        that.reloadData(res);
        if (res.data.data.groupon) {
          that.getTips();
        }
      } else {
        if (res.data.message && res.data.code != 4) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
        if (res.data.code == 10) {
          that.setData({
            'nodata.imgUrl': '/images/net_hot.png',
            'nodata.noDataText': "活动太火爆了，请稍后重试～"
          })
        }
        else if (res.data.code == 4) {
          that.setData({
            page: 'over',
            loading: false,
            code: res.data.code
          })
          // 更多活动
          that.getMoreActivityInfo();
          that.getNewUserProducts();
          return;
        }
        else {
          that.setData({
            'nodata.imgUrl': '/images/net_nodata.png',
            'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～"
          })
        }
        that.setData({
          loading: false,
          haveData: false,
          'nodata.noData': true,
        })
      }
      // that.getNewUserProducts();
    }, function (error) {
      that.showNetErrorView()
    });
  },
  // 查看接口
  showPacket: function (grouponCode) {
    var that = this
    var param = {
      grouponCode: grouponCode,
      sourceForm: 'weixin_app'
    }
    let wxAppLogin = app.globalData.wxappLogin;

    if (wxAppLogin) {
      param.accessToken = wxAppLogin.access_token
    }

    red_service.showGroup(param).then(function (res) {
      if (res.data.code == 0) {
        that.reloadData(res);
        that.getTips();
      }
      else {
        if (res.data.message && res.data.code != 4) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
        if (res.data.code == 10) {
          that.setData({
            'nodata.imgUrl': '/images/net_hot.png',
            'nodata.noDataText': "活动太火爆了，请稍后重试～"
          })
        }
        else if (res.data.code == 4) {
          that.setData({
            page: 'over',
            loading: false,
            code: res.data.code
          })
          // 更多活动
          that.getMoreActivityInfo();
          that.getNewUserProducts();
          return;
        }
        else {
          that.setData({
            'nodata.imgUrl': '/images/net_nodata.png',
            'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～"
          })
        }
        that.setData({
          loading: false,
          haveData: false,
          'nodata.noData': true,
        })
      }
      // that.getNewUserProducts();
    }, function (error) {
      // 设置无网络
      that.showNetErrorView()

    });
  },
  getTips: function () {
    var that = this;
    var param = {
      "sourceForm": "weixin_app",
      accessToken: app.globalData.wxappLogin.access_token
    }

    if (that.data.grouponCode) {
      param.grouponCode = that.data.grouponCode
    }
    else {
      return;
    }
    red_service.packetTips(param).then(function (res) {
      if (res.data.code == 0) {
        that.setData({
          tipesInfo: res.data.data.info
        })
        setTimeout(function () {
          that.animationOne();
        }, 2000)
      } else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
      }
    }, function (error) {

    });
  },


  // 显示错误页面
  showNetErrorView: function () {
    this.setData({
      loading: false,
      haveData: false,
      loadingHidden: true,
      'network.noNetwork': true
    })
  },
  //显示没有权限页面
  showNoRuleView() {
    this.setData({
      loading: false,
      showNoRules: true
    })
  },
  goToIndex: function () {
    // 跳转到首页
    if (this.data.grouponCode){
      requestAna('go_index', 'group_page', {
        'share_type': this.data.grouponCode,
      })
    }
    this.wetoast.toast({
      title: "正在前往商城"
    })
    setTimeout(function () {
      appInteriorSkip.switchTabIndex()
    }, 1000)
  },

  goIndex: function (e) {
    // if (e.currentTarget.dataset.type == 'index' && this.data.grouponCode) {
    //   // 跳转到首页
    //   requestAna('go_index', 'group_page', {
    //     'share_type': this.data.grouponCode,
    //   })
    // }
    if (this.data.groupon && this.data.groupon.status == 2) {
      // 跳转到首页
      requestAna('success_go_use', 'group_page')
    }
    this.wetoast.toast({
      title: "正在前往商城"
    })
    setTimeout(function () {
      appInteriorSkip.switchTabIndex()
    }, 1000)
  },
  goNewPage: function () {
    this.setData({
      showBounce: false
    })
    requestAna('pop_new_use', 'group_page')
    appInteriorSkip.navigateToNewExclusive()
  },

  joinAction: function (e) {
    var that = this

    // 进入帮拆页
    requestAna('dismantle_help', 'group_page', {
      'share_type': that.data.grouponCode,
    })

    let wxAppLogin = app.globalData.wxappLogin;
    that.setData({
      loadingHidden: false
    })
    // 加入团
    var param = {
      sourceForm: 'weixin_app',
      accessToken: wxAppLogin.access_token,
      userNickName: wxAppLogin.nick_name,
      userHeadImg: wxAppLogin.portrait,
      formId: e.detail.formId,
      grouponCode: that.data.grouponCode,
    }

    red_service.joinGroup(param).then(function (res) {
      that.setData({
        loadingHidden: true
      })
      if (res.data.code == 0) {
        that.reloadData(res);
      } else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
      }
    }, function (error) {
      that.showNetErrorView()
    });
  },
  openGroup: function (e) {
    //  判断红包活动是否结束
    let formId = e.detail.formId;
    var that = this
    // 团成功，重新开团
    if (e.detail.target.dataset.type == 'success_again_click') {
      requestAna('success_again_click', 'group_page')
    }

    // 帮拆页面点击开团
    if (e.detail.target.dataset.type == 'dismantle_new') {
      // 进入帮拆页
      requestAna('dismantle_new', 'group_page', {
        'share_type': that.data.grouponCode,
      })
    }

    if (e.detail.target.dataset.type == 'dismantle_new') {
      // 进入帮拆页
      requestAna('dismantle_new', 'group_page', {
        'share_type': that.data.grouponCode,
      })
    }

    // 弹框查看更多活动
    if (e.detail.target.dataset.type == 'old') {
      requestAna('pop_more', 'group_page')
    }


    if (e.detail.target.dataset.type == 'fail') {

      if (that.data.groupon.status == 1 && that.data.isExceedOpenLimit == 1) {
        // 帮拆过
        requestAna('dismantle_finish_new', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }
      else if (that.data.groupon.status == 2) {
        // 已成团
        requestAna('dismantle_success_new', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }
      else if (that.data.groupon.status == 3) {
        // 已过期
        requestAna('dismantle_overdue_new', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }
    }
    // 更多福利
    if (e.detail.target.dataset.type == 'failMore') {
      // 到达上线
      requestAna('dismantle_limit_other', 'group_page', {
        'share_type': that.data.grouponCode,
      })
    }

    appInteriorSkip.redirectToGroupRedPacketV2(formId)
  },
  // 设置数据
  reloadData: function (res) {
    //reloadData作为成功回调的统一入口，故在此请求商品信息
    this.getNewUserProducts();

    var that = this;
    let resData = res.data
    that.setData({
      loading: false,
      redPacket: resData.data.redPacket,
      groupon: resData.data.groupon,
      redDetail: resData.data.redDetail,
      grouponMemberList: resData.data.grouponMemberList,
      awardList: resData.data.awardList,
      commander: resData.data.commander,
      isJoin: resData.data.isJoin,
      isGoing: resData.data.isGoing,
      isCommander: resData.data.isCommander,
      haveGroupOn: resData.data.haveGroupOn,
      isExceedOpenLimit: resData.data.isExceedOpenLimit,
      limit: resData.data.limit,
    })

    if (resData.data.groupon) {
      that.setData({
        grouponCode: resData.data.groupon.grouponCode,
      })
    }

    if (resData.data.joinMessage) {
      that.setData({
        joinMessage: resData.data.joinMessage
      })
    }

    if (resData.data.redPacket) {
      that.setData({
        shareImg: resData.data.redPacket.shareImg,
        shareDoc: resData.data.redPacket.shareDoc,
        ruleImg: resData.data.redPacket.ruleImg,
      })
    }

    // 团结束 ,开团失败
    if ((resData.data.isGoing == 0 && resData.data.groupon == null && (resData.data.haveGroupOn == null || resData.data.haveGroupOn == 0)) || resData.data.isOpen === 0) {
      that.setData({
        page: 'over'
      })
      if (resData.data.isOpen === 0) {
        // 友好导流页
        requestAna('friend_index', 'group_page')
      }
      else {
        // 活动结束页
        requestAna('finish_index', 'group_page')

      }
      // 更多活动
      that.getMoreActivityInfo();
      return;
    }
    else if (resData.data.isJoin == 0 && resData.data.isCommander == 0) {
      that.setData({
        page: 'unJoin'
      })
      if (resData.data.limit == 0 && resData.data.groupon.status == 1 && resData.data.isExceedOpenLimit == 0) {
        // 进入帮拆页
        requestAna('dismantle_index', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }

      if (resData.data.limit == 1) {
        // 到达上线
        requestAna('dismantle_limit', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }
      else if (resData.data.groupon.status == 1 && resData.data.isExceedOpenLimit == 1) {
        // 帮拆过
        requestAna('dismantle_finish', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }
      else if (resData.data.groupon.status == 2) {
        // 已成团
        requestAna('dismantle_success', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }
      else if (resData.data.groupon.status == 3) {
        // 已过期
        requestAna('dismantle_overdue', 'group_page', {
          'share_type': that.data.grouponCode,
        })
      }

    }
    else if (resData.data.isJoin == 1) {
      that.setData({
        page: 'open'
      })
      if (resData.data.groupon.status == 2) {
        if (resData.data.limit == 0) {
          requestAna('success_index', 'group_page', {
            'share_type': that.data.grouponCode,
            'is_allow': 'no'
          })
        }
        else {
          requestAna('success_index', 'group_page', {
            'share_type': that.data.grouponCode,
            'is_allow': 'yes'
          })
        }
      }
    }

    if (that.data.grouponCode) {
      // 进入团埋点
      requestAna('index', 'group_page', {
        'share_type': that.data.grouponCode,
      })
    }



    //  新人弹框
    if (resData.data.groupon.status == 2 && resData.data.isJoin == 1 && resData.data.newUser == 1) {
      that.setData({
        showBounce: true
      })
      requestAna('pop_new_index', 'group_page')
    }
    // 该红包已经过期 弹框
    if (resData.data.groupon.status == 3 && resData.data.isJoin == 1 && resData.data.limit == 1) {
      that.setData({
        showBounce: true
      })
      requestAna('pop_index', 'group_page')
    }

    // 默认头像
    if (that.data.grouponMemberList) {
      for (let i = 0; i < that.data.grouponMemberList.length; i++) {
        let item = that.data.grouponMemberList[i];
        item.userType = 1;
        if (item.userHeadImg) {
        }
        else {
          item.userHeadImg = '/images/red-header.png'
        }
      }
    }
    if (that.data.awardList) {
      for (let i = 0; i < that.data.awardList.length; i++) {
        let item = that.data.awardList[i];
        if (item.userHeadImg) {
        }
        else {
          item.userHeadImg = '/images/red-header.png'
        }
      }
    }

    if (resData.data.grouponMemberList.length < 4) {
      var num = 4 - resData.data.grouponMemberList.length;
      for (var i = 0; i < num; i++) {
        var groupMember = {
          userNickName: "",
          userHeadImg: "",
          userType: 2
        }
        that.data.grouponMemberList.push(groupMember);
      }
    }
    that.setData({
      grouponMemberList: that.data.grouponMemberList,
      awardList: that.data.awardList
    })
    // 倒计时
    if (resData.data.isJoin == 1 && resData.data.groupon.status == 1) {
      that.countdown();
    }
    // 进去弹
    if (resData.data.redPacket.maxAmount) {
      that.wetoast.toast({
        title: '红包已拆，最高' + resData.data.redPacket.maxAmount + '元\n快去邀请好友瓜分红包吧'
      })
    }
  },
  getMoreActivityInfo: function () {
    var that = this;
    var param = {
      "sourceForm": "weixin_app",
      accessToken: app.globalData.wxappLogin.access_token
    }

    red_service.getMoreActivityInfo(param).then(function (res) {
      if (res.data.code == 0) {
        that.setData({
          moreInfo: res.data.data
        })
      } else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
      }
    }, function (error) {

    });
  },
  // 跳转到其他页面
  goOtherAction: function (e) {
    requestAna('friend_card_click', 'group_page')

    var url = e.currentTarget.dataset.url;
    var banner = {
      'type': 'COLLECT_CARD',
      'link': url
    }
    bannerSkip.bannerSkip(banner);
  },
  // 计算倒计时
  countdown: function () {
    var that = this;
    if (that.data.groupon.status != 1) {
      return;
    }
    // 截止时间
    that.data.groupon.durationTime = that.data.groupon.durationTime - 100;
    var timestamp2 = that.data.groupon.durationTime;
    timestamp2 = timestamp2 / 100;

    var hour = parseInt((timestamp2) / (3600 * 10));
    var min = parseInt((timestamp2 - hour * 3600 * 10) / (60 * 10));
    var second = parseInt((timestamp2 - hour * 3600 * 10 - min * 60 * 10) / 10);
    var colon = parseInt((timestamp2 - hour * 3600 * 10 - min * 60 * 10 - second * 10));

    if (hour < 0) {
      hour = 0;
    }
    if (min < 0) {
      min = 0;
    }
    if (second < 0) {
      second = 0;
    }
    if (colon < 0) {
      colon = 0;
    }

    var hourstr, minstr, secondstr;
    if (hour < 10) {
      hourstr = '0' + hour;
    }
    else {
      hourstr = hour.toString();
    }
    if (min < 10) {
      minstr = '0' + min;
    }
    else {
      minstr = min.toString();
    }
    if (second < 10) {
      secondstr = '0' + second;
    }
    else {
      secondstr = second.toString();
    }

    that.setData({
      hour: hourstr,
      min: minstr,
      second: secondstr,
      colon: colon + ''
    })
    setTimeout(function () {
      that.countdown();
    }, 100)
  },

  closeBounced: function (e) {
    var that = this

    if (e.currentTarget.dataset.type == 'old') {
      requestAna('pop_now', 'group_page', {
        'share_type': this.data.grouponCode
      })
    }
    if (that.data.groupon.status == 2) {

    }
    else {
      this.setData({
        showBounce: false
      })
    }

  },
  sureCloseBounced: function () {
    if (this.data.grouponCode) {
      requestAna('pop_new_now', 'group_page', {
        'share_type': this.data.grouponCode
      })
    }

    this.setData({
      showBounce: false
    })
  },
  bounced: function () {

  },
  showExplain: function () {
    this.setData({
      showExplain: true
    })
  },
  closeExlain: function () {
    this.setData({
      showExplain: false
    })
  },
  onShareAppMessage: function (e) {
    var that = this;

    if (that.data.grouponCode) {
      // 分享
      requestAna('invite_click', 'group_page', {
        'share_type': that.data.grouponCode,
      })
    }

    const successCB = function (res) {

      if (!res.shareTickets || res.shareTickets.length == 0) {
        that.wetoast.toast({
          title: '分享到微信群\n拆开红包概率可提升58%'
        })
        return;
      }
      // 获得shareTicket
      wx.getShareInfo({
        shareTicket: res.shareTickets[0],
        success(infoRes) {
          const encryptedData = infoRes.encryptedData
          const iv = infoRes.iv
          //以下请求服务器告知分享成功一次
          that.shareSuccessCallback(encryptedData, iv);
        }
      })
    }

    const failedCB = function (res) {

    }

    const complete = function (res) { }

    // 邀请好友
    return {
      title: that.data.shareDoc,
      imageUrl: that.data.shareImg,
      path: 'pages/active_page/group_red_packet_v2/group_red_packet_v2?grouponCode=' + that.data.grouponCode,
      success: successCB,
      fail: failedCB,
      complete: complete
    }
  },

  shareSuccessCallback: function (rawData, signature) {

    let that = this;
    let requestObj = {
      grouponCode: that.data.grouponCode,
      accessToken: app.globalData.wxappLogin.access_token,
      signature: signature,
      eData: rawData,
      sourceForm: 'weixin_app'
    };
    red_service.packetShare(requestObj).then(function (res) {
      if (res.data.data.status == 0) {
        that.wetoast.toast({
          title: '已发送邀请，分享3个微信群\n拆开红包概率达98.63%'
        })
      }
      else if (res.data.data.status == 1) {
        that.wetoast.toast({
          title: '该群已经分享过了\n换个群试试哦～'
        })
      }
    });

  },
  animationOne: function () {
    var that = this;

    var device = wx.getSystemInfoSync();
    var width = device.windowWidth;
    var height = device.windowHeight;

    var scaleW = width / 375;
    var wcaleY = height / 667;

    for (var i = 0; i < that.data.tipesInfo.length; i++) {
      var animation = wx.createAnimation({})
      var item = that.data.tipesInfo[i];
      animation.translate(90 * scaleW, 0).step({
        duration: 500,
        timingFunction: "ease",
        delay: 1250 * i
      })
      animation.translate(90 * scaleW, -45 * wcaleY).step({
        duration: 500,
        timingFunction: "linear",
        delay: 500
      })
      animation.translate(90 * scaleW, -120 * wcaleY).step({
        duration: 500,
        timingFunction: "step-end",
        delay: 200
      })
      item.animation = animation
    }
    that.setData({
      tipesInfo: that.data.tipesInfo
    })
  },

  //获取新人专享商品
  getNewUserProducts: function () {
    const that = this;
    that.setData({
      goodsLoading: true
    })
    let url = netManager.buildRequestObj('newUserProduct');
    netManager.genPromise(url).then(function (res) {
      that.setData({
        goodsLoading: false
      })
      if (res.data.code == 0) {
        let prePageData = that.data.pageData;
        prePageData.products = res.data.data;
        that.setData({
          pageData: prePageData,
        })
        // 需要获取到购物车的商品, 并且将商品数量同步
        that.getPoductFromCartInfos();
      } else {
      }
    }, function (error) {
      that.setData({
        goodsLoading: false
      })
    })
  },

  addToCart: function (event) {
    let dataset = event.currentTarget.dataset
    productOperate.addToCart(dataset.productSku, dataset.seckillLimit, dataset.stock, dataset.quantity || 0);
  },
  decrease: function (event) {
    let dataset = event.currentTarget.dataset
    productOperate.decrease(dataset.productSku);

  },
  /* 更新购物车数据 */
  updateCartItem: function (productId, quantity, addType) {
    productOperate.updateCartItem(productId, quantity, addToCart);
  },
  /* 同步购物车信息 */
  getPoductFromCartInfos: function () {
    productOperate.getPoductFromCartInfos();
  },
  reloadCartItems: function (cartItems) {
    productOperate.reloadCartItems(cartItems);
  },
  onItemClick: function (event) {
    let dataList = {
      productSku: event.currentTarget.dataset.sku,
    }
    appInteriorSkip.productDetail(dataList)
  }

})