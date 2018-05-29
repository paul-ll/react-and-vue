const app = getApp()
const utils = require('../../../utils/util');
const service = require('../../../utils/services/cash_packet.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const serviceUtils = require('../../../utils/service_utils')
const requestAna = require('../../../utils/service_utils.js').requestAna
const netManager = require('../../../utils/services/net_manager')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nodata: {
      noData: false,
      imgUrl: '',
      noDataText: ''
    },
    network: {
      reconnecting: false,
      noNetwork: false
    },
    haveData: false,
    showBounce: false,
    showNoRules: false,
    alert: '',
    region: {},
    showExplain: false,
    showMore: false,
    newUser: false,
    cashGroupon: {},
    grouponMemberList: [],
    moreGrouponMemberList: [],
    grouponMember: {},
    redPacketDetail: {},
    share_info: {},
    code: 0,
    message: '',
    hour: '00',
    min: '00',
    second: '00',
    colon: '0',
    isCommander: 0,
    wxAppLogin: {},
    loading: true,
    ruleImg: '',
    sku_list: {},
    isActivity: 0,
    isExceedOpenLimit: 0,
    isNewUser: 0,
    grouponMemberListCount: 0,
    haveGroupOn: 0,
    isGetRed: -1,
    loadingHidden: true,
    groupEnd: '',
    endBtnText: '',
    showPage: '',
    showApp: false,
    options: {},
    goodsLoading: false,
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

    // // 进入页面埋点
    // if (options.userId) {
    //   let param = {}
    //   param.is_allow = options.userId;
    //   param.action = options.cashGrouponCode;
    //   param.share_type = options.cashGrouponCode;
    //   requestAna('event_show', 'share_money', param)
    // }
    // else{
    //   requestAna('event_show', 'share_money')

    // }



    new app.globalData.WeToast()
    that.initPage();

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
  initPage: function () {
    var that = this;
    app.getUserInfo(wxAppLogin => {
      that.setData({
        wxAppLogin: wxAppLogin
      })
      // 获取用户经纬度
      app.getAddressInfoV2(function () {
        let options = that.data.options;
        if (options.cashGrouponCode) {
          that.preShowActivity(options.cashGrouponCode);
        }
        else {
          that.preShowActivity();
        }
      }, res => {
        that.showNetErrorView();
      })

    }, res => {
      that.showNetErrorView();
    }, res => {
      that.showNoRuleView()
    })
  },
  preShowActivity: function (cashGrouponCode) {
    var that = this
    //  已经开团
    let wxAppLogin = that.data.wxAppLogin;

    // 团长开团
    var param = {
      sourceForm: 'weixin_app'
    };
    // 团id
    if (cashGrouponCode) {
      param.cashGrouponCode = cashGrouponCode;
    }
    if (wxAppLogin) {
      param.accessToken = wxAppLogin.access_token;
      param.userNickName = wxAppLogin.nick_name;
      param.userHeadImg = wxAppLogin.portrait;
    }
    service.preShowActivity(param).then(function (res) {
      that.setData({
        loadingHidden: true
      })
      if (res.data.code == 0) {
        // 团长
        if (res.data.data.isCommander == 1) {
          if (res.data.data.isShowPrePage == 1) {
            that.setData({
              showPage: 'guideOpen',
              loading: false,
            })
            // 开团引导页进入页面

            requestAna('event_show', 'share_money')

          }
          else {
            // 开团详情
            let param = {
              share_type: res.data.data.cashGroupon.cashGrouponCode,
              promotion_id: res.data.data.cashGroupon.areaName,
            }
            requestAna('event_show', 'share_money', param)

            // 加载数据
            that.reloadData(res);
            that.listSku();
          }
        }
        else {
          // 进入页面埋点
          if (that.options.userId) {
            let param = {}
            param.is_allow = that.options.userId;
            param.action = that.options.cashGrouponCode;
            param.share_type = that.options.cashGrouponCode;
            requestAna('event_show', 'share_money', param)
          }
          if (res.data.data.isShowPrePage == 1) {
            // 团员
            that.setData({
              showPage: 'guideJoin',
              loading: false,
            })
          }
          else {
            that.refreshPageContent(cashGrouponCode);
          }
        }
      }
      else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
        if (res.data.code == 1011) {
          that.setData({
            'nodata.imgUrl': '/images/net_hot.png',
            'nodata.noDataText': "活动太火爆了，请稍后重试～"
          })
        } else {
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
    }, function (error) {
      that.showNetErrorView();
    })
  },
  refreshPageContent: function (cashGrouponCode, formId) {
    var that = this
    //  已经开团
    let options = that.data.options;
    let wxAppLogin = that.data.wxAppLogin;

    // 团长开团
    var param = {
      sourceForm: 'weixin_app'
    };
    if (formId) {
      param.formId = formId;
    }
    // 团id
    if (cashGrouponCode) {
      param.cashGrouponCode = cashGrouponCode;
    }
    if (wxAppLogin) {
      param.accessToken = wxAppLogin.access_token;
      param.userNickName = wxAppLogin.nick_name;
      param.userHeadImg = wxAppLogin.portrait;
    }
    service.cashGroup(param).then(function (res) {
      that.setData({
        loadingHidden: true
      })
      if (res.data.code == 0) {
        // 进入页面
        that.reloadData(res);
        // 团长 ，新人
        if (res.data.data.isCommander == 1 || res.data.data.isCommander == 0 && res.data.data.isNewUser == 1 && res.data.data.isGetRed == 0) {
          that.listSku();
        }

      } else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
      }
    }, function (error) {
      that.showNetErrorView();
    });
  },
  // 商品列表
  listSku: function () {
    var that = this
    that.setData({
      goodsLoading: true
    })
    service.listSku().then(function (res) {
      that.setData({
        goodsLoading: false,
      })
      if (res.data.code == 0) {

        for (var i = 0; i < res.data.data.length; i++) {
          res.data.data[i].vip_price_pro = res.data.data[i].price
        }
        that.setData({
          sku_list: res.data.data,
        })
      } else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
      }
    }, function (error) {
      that.setData({
        goodsLoading: false,
      })
      // that.showNetErrorView();
    });

  },
  chooseProduct(event) {
    let productSku = event.currentTarget.dataset.productSku
    appInteriorSkip.productDetail({ productSku })
  },
  reloadData: function (res) {
    var that = this;
    let resData = res.data
    that.setData({
      loading: false
    })

    if (resData.code == 0) {
      that.setData({
        cashGroupon: resData.data.cashGroupon,
        grouponMemberList: resData.data.grouponMemberList,
        grouponMember: resData.data.grouponMember,
        share_info: resData.data.share_info,
        message: resData.message,
        isCommander: resData.data.isCommander,
        ruleImg: resData.data.ruleImg,
        isActivity: resData.data.isActivity,
        isExceedOpenLimit: resData.data.isExceedOpenLimit,
        isNewUser: resData.data.isNewUser,
        grouponMemberListCount: resData.data.grouponMemberListCount,
        haveGroupOn: resData.data.haveGroupOn,
        isGetRed: resData.data.isGetRed
      })

      if (resData.data.isActivity == 0) {
        that.setData({
          isExceedOpenLimit: 1,
        })
      }
      // if (resData.data.isExceedOpenLimit == 2 && resData.data.isCommander == 1 && !that.data.options.cashGrouponCode) {
      //   that.wetoast.toast({
      //     title: '参与次数已达上限，下次再来吧～'
      //   })
      // }
      // 没有参与过团
      if (resData.data.isActivity == 0 && resData.data.cashGroupon == null) {
        that.setData({
          showPage: 'commander'
        })
      }
      // 团长
      else if (resData.data.isCommander == 1) {
        that.setData({
          showPage: 'commander',
          showBounce: true
        })
        // 倒计时
        that.countdown();
      }
      // 新人
      else if (resData.data.isCommander == 0 && resData.data.isNewUser == 1 && resData.data.isGetRed == 0) {
        that.setData({
          showPage: 'new',
          redPacketDetail: resData.data.redPacketDetail,
        })
      }
      // 老人
      else if ((resData.data.isCommander == 0 && resData.data.isNewUser == 0) || (resData.data.isNewUser == 1 && resData.data.isGetRed != 0)) {
        that.setData({
          showPage: 'noCommander'
        })
      }
    }

    if (resData.data.cashGroupon) {
      if (resData.data.cashGroupon.extractStatus != 0 && resData.data.cashGroupon.isExtract == 0) {
        that.setData({
          groupEnd: '现金红包已可提现啦',
        })
      }
      else if (resData.data.cashGroupon.isExtract == 1 && resData.data.isExceedOpenLimit != 0) {
        that.setData({
          groupEnd: '商城今天有新品到货\n快去逛逛吧~',
        })
      }
      else if (resData.data.cashGroupon.isExtract == 1 && resData.data.isExceedOpenLimit == 0) {
        that.setData({
          groupEnd: '你还有1个现金红包\n可领取',
        })
      }
      else if (resData.data.cashGroupon.isExtract == 0) {
        that.setData({
          groupEnd: '啊哦，没有拆到现金门槛\n现金已失效'
        })
      }

    }


    // 活动失败
    if (resData.data.cashGroupon == null) {
      that.setData({
        alert: '活动已结束'
      })
    }
    else if (resData.data.cashGroupon.status == 3) {
      that.setData({
        alert: '红包已结束'
      })
    }
    // 活动进行中
    else if (resData.data.cashGroupon.status == 1) {
      that.setData({
        alert: '后红包将失效 赶紧拆哦~'
      })
    }
    //  团结束，没有提现
    else if (resData.data.cashGroupon.status == 2 && resData.data.cashGroupon.isExtract == 0) {
      that.setData({
        alert: '红包已结束,可提现'
      })
    }
    // 团结束，已提现
    else if (resData.data.cashGroupon.status == 2 && resData.data.cashGroupon.isExtract == 1) {
      that.setData({
        alert: '红包已结束,已提现'
      })
    }
    //  不支持的城市 或者团失败
    else if (resData.data.isActivity == 0) {
      that.setData({
        alert: '活动已结束'
      })
    }
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
  closeBounced: function () {
    var that = this;
    this.setData({
      showBounce: false
    })
  },
  bounced: function () {

  },
  closeRedPacket: function () {

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
  showMore: function () {
    var that = this;
    that.setData({
      showMore: true
    })
    // 已请求出来数据
    if (that.data.moreGrouponMemberList.length != 0) {
      return;
    }

    that.setData({
      loadingHidden: false
    })

    let wxAppLogin = app.globalData.wxappLogin;
    var param = {
      cashGrouponCode: that.data.cashGroupon.cashGrouponCode,
      accessToken: wxAppLogin.access_token
    };

    service.showMembers(param).then(function (res) {
      if (res.data.code == 0) {
        that.setData({
          loadingHidden: true,
          moreGrouponMemberList: res.data.data.grouponMemberList
        })
      } else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
      }
    }, function (error) {
      that.showNetErrorView();
    });

  },
  closeMore: function () {
    this.setData({
      showMore: false
    })
  },
  goIndex: function (e) {
    var that = this

    if (that.data.cashGroupon) {
      let param = {
        share_type: that.data.cashGroupon.cashGrouponCode,
        promotion_id: that.data.cashGroupon.areaName
      }
      // 页面拆一个新红包埋点
      if (e.currentTarget.dataset.type == 'new') {
        requestAna('pop_use_click', 'share_money', param)
      }
    }

    this.wetoast.toast({
      title: "正在前往商城"
    })
    setTimeout(function () {
      appInteriorSkip.switchTabIndex()
    }, 1000)
  },
  openGroup: function (e) {
    // 拆一个新红包
    let formId = e.detail.formId;
    var that = this;
    that.setData({
      loadingHidden: false
    })

    if (that.data.haveGroupOn == 1) {
      that.preShowActivity();
    }
    else {
      that.refreshPageContent(null, formId);
    }

    if (that.data.cashGroupon) {
      var anaParam = {
        share_type: that.data.cashGroupon.cashGrouponCode,
        promotion_id: that.data.cashGroupon.areaName
      }
      if (e.detail.target.dataset.type == 'bottom') {
        requestAna('page_again_click', 'share_money', anaParam)
      }
      else if (e.detail.target.dataset.type == 'bounce') {
        requestAna('pop_again_click', 'share_money', anaParam)
      }
      // 帮拆完 开新团
      else if (e.detail.target.dataset.type == 'join') {
        requestAna('help_receive_click', 'share_money', anaParam)
      }
    }

    // 开团引导页
    if (e.detail.target.dataset.type == 'guide') {
      requestAna('receive_click', 'share_money')
    }



  },
  joinAction: function () {
    var that = this;
    var anaParam = {
      share_type: that.data.options.cashGrouponCode,
    }
    requestAna('help_click', 'share_money', anaParam)
    that.setData({
      loadingHidden:false
    })
    that.refreshPageContent(that.options.cashGrouponCode);
  },
  withDrawAction: function (e) {
    var that = this;
    if (that.data.cashGroupon.isExtract == 1) {
      that.wetoast.toast({
        title: '金额已提现～'
      })
      return;
    }
    if (that.data.cashGroupon.extractStatus == 0) {
      that.wetoast.toast({
        title: '还没到提现门槛，不能提现哦～'
      })
      return;
    }

    that.setData({
      showApp: true,
    })

    let anaParam = {
      share_type: that.data.cashGroupon.cashGrouponCode,
      promotion_id: that.data.cashGroupon.areaName
    }
    // 页面提现埋点
    if (e.currentTarget.dataset.type == 'bottom') {
      requestAna('page_withdraw_click', 'share_money', anaParam)
    }
    else {
      // 弹框提现埋点
      requestAna('pop_withdraw_click', 'share_money', anaParam)
    }

  },
  closeShowApp: function () {
    this.setData({
      showApp: false,
      showBounce: false
    })
  },
  // 计算倒计时
  countdown: function () {
    var that = this;
    if (that.data.cashGroupon.status != 1) {
      return;
    }
    // if (that.data.cashGroupon.countDown <= 0) {
    //   that.refreshPageContent(that.data.cashGroupon.cashGrouponCode);
    //   return; 
    // }
    // 截止时间
    that.data.cashGroupon.countDown = that.data.cashGroupon.countDown - 100;
    var timestamp2 = that.data.cashGroupon.countDown;
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
  shareAction: function (e) {
    var that = this
    if (that.data.cashGroupon.extractStatus == 2) {
      that.wetoast.toast({
        title: '已拆到最高金额啦，快去提现吧～'
      })
    }
    else {
      that.wetoast.toast({
        title: '红包已结束，快去提现吧～'
      })
    }

  },
  ShareSubmit: function (e) {
    var that = this
    let formId = e.detail.formId;
    var param = {
      formId: formId,
    };
    let wxAppLogin = that.data.wxAppLogin;
    if (wxAppLogin) {
      param.accessToken = wxAppLogin.access_token;
    }
    // 统计formid
    service.submitFormId(param)

    var anaParam = {
      share_type: that.data.cashGroupon.cashGrouponCode,
      promotion_id: that.data.cashGroupon.areaName
    }
    // 页面分享埋点 dataset
    if (e.detail.target.dataset.type == 'bottom') {
      requestAna('page_share_click', 'share_money', anaParam)
    }
    else {
      // 弹框分享埋点
      requestAna('pop_share_click', 'share_money', anaParam)
    }
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
    let that = this;
    let title = "";
    if (that.data.share_info.miniAppShareInfo.miniTitle) {
      title = that.data.share_info.miniAppShareInfo.miniTitle
    }
    let miniImgUrl = '';
    if (that.data.share_info.miniAppShareInfo.miniImgUrl) {
      miniImgUrl = that.data.share_info.miniAppShareInfo.miniImgUrl
    }
    let path = '';
    if (that.data.share_info.miniAppShareInfo.miniPath) {
      path = that.data.share_info.miniAppShareInfo.miniPath
    }
    return {
      title: title,
      imageUrl: miniImgUrl,
      path: path,
    }
  }
})