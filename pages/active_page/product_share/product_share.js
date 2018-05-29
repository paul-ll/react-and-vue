
const app = getApp();
const utils = require('../../../utils/util');
const thirdApi = require('../../../utils/services/third_api.js')
const serviceUtils = require('../../../utils/service_utils');
const netManager = require('../../../utils/services/net_manager');
const categoryService = require('../../../utils/services/categories.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip');
const bannerSkip = require('../../../utils/custom/banner_skip');

// pages/active_page/product_share/product_share.js
Page({

  /**
   * 页面的初始数据
   */
  data: {



    imageHost: netManager.configs.imageHost,

    //区域信息
    region: {

    },
    topImageHeight: 0,
    isShowProductTickerDialog: false,
    mainShareButtonEnable: false,
    mainShareButtonIsGrey: false,
    showNewUserDialog: false,//是否展示的是新人的弹窗样式
    showPlayAgainButton: true,//是否展示再玩一次的按钮
    isActive: true,
    dialog: {
      showAlertDialog: false,
      content: '抱歉，该活动仅限华南用户参加~',
      showNativeButton: true,
      nativeContent: '我知道了',
      comfirmContent: '好的',
    },

    //页面数据
    pageData: {

    },
    //分享码，此次活动码
    shareCode: '',
    //分享人的UserID,用于埋点
    user_id: '',

    //分享成功后回调数据
    shareSuccessData: {

    },
    //商品券图片
    productImage: '',


    //活动规则
    hasCloseBtn: true,
    coverView: false,
    isShowMask: true,

    //分享成功登录重试次数
    loginCount: 0,

    // 活动其它区域码
    otherAreaName: '',

    //展示新人红包
    showRedPackage: false,

    //红包信息
    redPackageInfo: {},

    //商品券信息
    couponTicketInfo: {},

    //是否第一次进入
    isFirstTime: true,
    isFirstTimeAntherFlag: true,

    //弹屏
    showPopup: false,

    //活动ID
    activityId: 0,

    //倒计时文字
    countDown: '00：00：00：0 已结束',
    countDownFlag: false,

    //再玩一次按钮
    showPlayAgainBtn: false,

    buttonNameArray: [],

    //是否倒计时后刷新
    countDownShouldBeRefresh: false,
  },
  cancelPayBox: function () {
    this.setData({
      coverView: false,
    })
  },


  initDialog: function () {
    let dialogObj = this.data.dialog;
    this.setData({
      dialog: dialogObj,
    })
  },
  nativeCB: function () {
    utils.logi(' --- nativeCB --- ');
    let dialogObj = this.data.dialog;
    dialogObj.showAlertDialog = false;
    this.setData({
      dialog: dialogObj
    })
    //将分享码清楚，默认走当前活动
    this.data.shareCode = '';
    let otherAreaName = this.data.pageData.otherActivity;
    this.setData({
      mainShareButtonIsGrey: false,
      areaName: otherAreaName,
      otherAreaName: otherAreaName
    })
    this.refreshPageContent();
  },
  comfirmCB: function () {
    utils.logi(' --- comfirmCB --- ');

    let dialogObj = this.data.dialog;
    dialogObj.showAlertDialog = false;

    let currentAreaName = this.data.pageData.currentActivity;

    this.data.shareCode = '';
    this.setData({
      dialog: dialogObj,
      areaName: currentAreaName,
      otherAreaName: currentAreaName
    })
    this.refreshPageContent();
    utils.logi(' --- comfirmCB finish --- ');
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //=============================== 公共部分 ===============================
    //Toast成员初始化
    new app.globalData.WeToast()
    //=============================== 公共部分 ===============================
    this.data.shareCode = options.shareCode;
    this.data.user_id = options.userID;
    this.data.activityId = options.activityId;

    //以下代码用于处理小程序码扫描情况，小程序码只支持一个参数，需要专门处理
    if (options.scene && options.scene.match(/%/g) && options.scene.match(/%/g).length > 0) {
      const params = unescape(options.scene);
      if (params.indexOf(',') != -1) {

        const paramsArray = params.split(',');

        let newParamsObj = {
        };
        const paramsArrayLength = paramsArray.length;
        if (paramsArrayLength > 1) {
          newParamsObj.activityId = paramsArray[0];
          newParamsObj.scene = paramsArray[1];
        }

        if (newParamsObj.scene) {
          if (newParamsObj.scene && !app.globalData.fromSource) {
            app.globalData.fromSource = newParamsObj.scene;
          }
        }

        if (newParamsObj.activityId) {
          this.data.activityId = newParamsObj.activityId;
        }
      }

    } else if (options.scene && !app.globalData.fromSource) {
      app.globalData.fromSource = options.scene;
    } else if (!app.globalData.fromSource) {
      app.globalData.fromSource = 'mryx';
    }


    wx.showShareMenu({
      withShareTicket: true,
    })

    this.initView();
    this.showLoadingView();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  initView: function () {
    const that = this;
    app.getUserInfo(function (res) {
      //登录完毕之后，开始获取经纬度
      that.requestPosition();
    }, function (err) {
      that.showNetErrorView();
    }, function (err) {
      that.showNoRuleView();
    });
  },

  //=============================== 公共部分 ===============================
  //显示加载页面
  showLoadingView() {
    this.setData({
      showNoAddressRules: false,
      network: {
        noNetwork: false,
      },
      loading: true
    })
  },
  //显示错误页面
  showNetErrorView() {
    this.setData({
      loading: false,
      network: {
        noNetwork: true,
      },
      showNoAddressRules: false,
    })
  },
  //显示没有权限页面
  showNoRuleView() {
    this.setData({
      network: {
        noNetwork: false
      },
      showNoAddressRules: true,
      loading: false
    })
  },
  //显示内容页面
  showContentView() {
    this.setData({
      network: {
        noNetwork: false
      },
      showNoAddressRules: false,
      loading: false
    })
  },
  showToast(str) {
    //在调用该方法前，必须先为当前的Page添加一个toast成员属性
    this.wetoast.toast({ title: str, duration: 1500 })
  },
  //重新加载
  reconnect: function () {
    this.showLoadingView();
    this.initView();
  },
  //获得权限
  haveRule: function () {
    this.showLoadingView();
    utils.logi('权限已开启，正在刷新');
    this.initView();
  },
  noRule: function () {
    utils.logi('权限未开启');
  },
  //=============================== 公共部分 ===============================

  requestPosition: function () {
    const that = this
    let currentAddressType = 0
    thirdApi.showToast('定位中', 'loading', 10000)
    // 调用第三方定位系统
    thirdApi.getLocation().then(function (loacationRes) {
      serviceUtils.getGeoLocation(loacationRes.latitude, loacationRes.longitude, 150).then(function (geoRes) {
        thirdApi.hideToast()
        if (!utils.gIsEmptyObject(geoRes.data) && geoRes.data.status === 0) {
          app.setCurrentAddressInfo(currentAddressType, geoRes.data.data[0])
          //然后获得所在大区，传给mps系统，获得营销活动
          that.queryAreaByLatlng();
        } else {
          that.showNetErrorView();
        }
      }, function () {
        thirdApi.hideToast()
        that.showNetErrorView();
      })


    }, function (err) {
      thirdApi.hideToast()
      that.wetoast.toast({ title: '请尝试打开微信【位置】权限', duration: 2000 })
      that.showNoRuleView();
    })
  },
  //根据经纬度获取所在大区
  queryAreaByLatlng() {
    this.refreshPageContent();
  },
  showNotSupportView() {
    this.showContentView();

    this.setData({
      isActive: false
    })
  },
  //==================================================

  //异步查询红包接口
  requestRedDetail: function () {
    if (!this.data.isFirstTimeAntherFlag) {
      return;
    }
    this.data.isFirstTimeAntherFlag = false;

    const that = this;
    let url = netManager.getRequestUrl('redPackageDetail', '', 1, {}, true);
    let params = {
      'accessToken': app.globalData.wxappLogin.access_token ? app.globalData.wxappLogin.access_token : ''
    }
    netManager.genPromise(url, 'POST', params).then(function (res) {
      if (res.data.data) {
        that.setData({
          redPackageInfo: res.data.data
        })
      }
      that.checkoutPopupShow();
    }, function (error) {
      that.checkoutPopupShow();
    });
  },

  //处理其它非0的状态
  dealOtherStatus: function (error) {
    let code = error.data.code;
    let msg = error.data.msg;

    //11作弹窗处理
    if (msg && (code != 11 && code != 18 && code != 7 && code != 12 && code != 74 && code != 75 && code != 76)) {
      this.showToast(msg);
    }
    let prePageData;
    if (error.data.data) {
      prePageData = error.data.data;
    } else {
      prePageData = this.data.pageData;
    }
    switch (code) {
      //网络异常处理
      case -1:
      case -2:
      case 1:
      case 2:
      case 3:
      case 4:
      case 13:
      case 16:
      case 20:

      case 89:
      case 88:
      case 87:
      case 86:
      case 85:
        this.showNetErrorView();
        break;
      case 5:
      case 6:
      case 8:
      case 9:
      case 10:
      case 14:

      case 99:
      case 98:
      case 97:
      case 96:
      case 95:
      case 94:
        // 不作任何处理  
        break;



      case 18:
      case 79:
      case 78:
      case 77:
      case 76:
      case 75:
      case 74:
      case 12:
      case 11:
      case 7:
        let pretDialogData = this.data.dialog;
        pretDialogData.content = msg;
        pretDialogData.showAlertDialog = true;
        pretDialogData.showNativeButton = false;

        if (prePageData.otherActivity == 1) {
          pretDialogData.comfirmContent = '看看其它活动';
          this.comfirmCB = function () {
            appInteriorSkip.redirectToProductShareList();
          };
          pretDialogData.comfirmCB = this.comfirmCB;
        } else {
          pretDialogData.comfirmContent = '知道了';
          this.comfirmCB = function () {
            this.setData({
              dialog: {
                showAlertDialog: false,
              }
            })
          }
          pretDialogData.comfirmCB = this.comfirmCB;
        }

        let oa = prePageData.otherActivity;

        this.setData({
          dialog: pretDialogData,
          pageData: prePageData,
          mainShareButtonIsGrey: oa ? true : false,
          mainShareButtonEnable: false
        })
        this.showContentView();
        break;
      //以下预留状态码，47,57,67
      case 47:
      case 57:
      case 67:
        // 参与次数已满
        prePageData.buttonName = "已获得商品券，去商城买买买";

        this.setData({
          showPlayAgainButton: false,
          pageData: prePageData,
          mainShareButtonEnable: false,
        })
        this.showContentView();

        //参与次数满，不再允许分享
        wx.hideShareMenu();
        break;

      //预留状态码
      case 52:
      case 42:
      case 32:
        this.setData({
          mainShareButtonIsGrey: true
        })
      //预留状态码
      case 35:
      case 45:
      case 55:
      case 15:
        //显示背景内容  
        this.setData({
          pageData: error.data.data
        })
        this.showContentView();
        break;
      //当前地区无活动
      //预留状态码
      case 37:
      case 47:
      case 57:
      case 17:
        this.setData({
          mainShareButtonIsGrey: true
        })
        this.showNotSupportView();
        break;
    }
  },
  //获取活动页面数据
  refreshPageContent: function () {
    let that = this;
    //关闭上一次的倒计时执行动作
    this.setData({
      countDownFlag: false
    })
    let requestObj = {
      areaName: that.data.otherAreaName ? that.data.otherAreaName : that.data.region.regionDesc,
      userNickName: app.globalData.wxappLogin.nick_name,
      userHeadImg: app.globalData.wxappLogin.portrait,
      formId: '',
      shareCode: that.data.shareCode,
      accessToken: app.globalData.wxappLogin.access_token,
      activityId: that.data.activityId,
    };

    let requestUrl = netManager.getRequestUrl('productShareMain', '', 1, {}, true);
    // let requestUrl = netManager.getRequestUrl('productShareMain');

    netManager.genPromise(requestUrl, "POST", requestObj).then(function (res) {
      if (res.data.code == 0) {

        const buttonName = res.data.data.buttonName;
        let buttonNameArray = '';
        if (buttonName.indexOf(',') > 0) {
          buttonNameArray = buttonName.split(',');
        } else if (buttonName.indexOf('，') > 0) {
          buttonNameArray = buttonName.split('，');
        } else {
          buttonNameArray = [buttonName, ''];
        }

        that.setData({
          pageData: res.data.data,
          mainShareButtonEnable: true,
          buttonNameArray: buttonNameArray,
        })

        //第一次请求完毕请求红包信息接口，展示弹窗
        if (that.data.isFirstTime) {
          that.data.isFirstTime = false;

          if (res.data.data) {
            //进入页面埋点
            serviceUtils.requestAna('event_show', 'cooperate_red_packet', {
              promotion_id: res.data.data.activityId,
              is_allow: res.data.code != 17,
              path: that.data.user_id,
              invite_code: that.data.shareCode
            })
          }
        }
        that.setData({
          shareCode: res.data.data.shareCode,
          showPlayAgainBtn: false,
        })

        //处理倒计时时间
        let endTime = res.data.data.countdown;

        //FIXME修复
        that.data.countDownFlag = true;

        if (endTime) {
          that.letCountDown(endTime * 1000);
        }
        that.showContentView();
      } else {
        that.dealOtherStatus(res);
      }
      //请求红包信息
      that.requestRedDetail();
    }, function () {
      that.showNetErrorView();
    });
  },

  //检查是否应该展示弹屏
  checkoutPopupShow: function () {

    //仅展示一次弹屏
    if (this.data.redPackageInfo.isNewUser == 1 && !this.data.showPopup && this.data.pageData.newUserPopup) {
      this.setData({
        showRedPackage: true,
      })
    } else if (!this.data.showRedPackage && this.data.pageData && this.data.pageData.screenPopup) {
      this.setData({
        showPopup: true
      })
    }
  },
  //开始倒计时
  letCountDown: function (startWhere) {
    let countDownStr = '';

    if (startWhere > 0) {
      this.data.countDownShouldBeRefresh = true;

      var hours = parseInt(startWhere / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
      var minutes = parseInt(startWhere / 1000 / 60 % 60, 10);//计算剩余的分钟 
      var seconds = parseInt(startWhere / 1000 % 60, 10);//计算剩余的秒数 

      countDownStr = hours + ': ' + minutes + ': ' + seconds + ': ' + parseInt(startWhere % 1000 / 100) + ' 后将结束';

      if (this.data.countDownFlag) {
        setTimeout(() => {
          this.letCountDown(startWhere -= 100);
        }, 100);
      }

    } else {
      countDownStr = '00：00：00：0 已结束';
      this.data.showPlayAgainBtn = true;

      //倒计时结束，刷新页面
      if (this.data.countDownShouldBeRefresh) {
        this.refreshPageContent();
      }
    }

    this.setData({
      countDown: countDownStr,
      showPlayAgainBtn: this.data.showPlayAgainBtn,
    })

  },

  //分享成功回调接口
  shareSuccessCallback: function (rawData, signature) {
    let that = this;
    let requestObj = {
      shareCode: that.data.shareCode,
      wxGroupId: "36973f54d564aa31e46137753394ab6f" + app.globalData.wxappLogin.wxLoginRes + signature,
      accessToken: app.globalData.wxappLogin.access_token,
      signature: signature,
      eData: rawData
    };

    let url = netManager.getRequestUrl('productShareSuccess', '', 1, {}, true);
    // let url = netManager.getRequestUrl('productShareSuccess');
    netManager.genPromise(url, 'POST', requestObj).then(function (res) {
      if (res.data.code == 0) {
        that.setData({
          shareSuccessData: res.data.data,
          couponTicketInfo: res.data.data.productDetailVO,
          redPackageInfo: res.data.data.redDetailVO ? res.data.data.redDetailVO : {},
        })

        //点击分享按钮,只有在这时才能获得GID
        serviceUtils.requestAna('click_phb_inviting_friend', 'group_page', {
          promotion_id: that.data.pageData.activityId,
          group_id: that.data.shareSuccessData.openGid,
          invite_code: that.data.shareCode,
        })

        that.showToast('分享成功');

        //如果是2，则代表分享已达成
        if (that.data.shareSuccessData.status == 2) {
          that.setData({
            isShowProductTickerDialog: true,
            showNewUserDialog: that.data.redPackageInfo.coupon ? true : false,
            mainShareButtonEnable: false,
            showPopup: false,
          })

          //利用商品券的SKU通过商品详情接口获取图片地址
          categoryService.getSkuDetail(that.data.couponTicketInfo.productSku).then(function (res) {
            that.setData({
              productImage: res.data.cart_image
            });
          });

          serviceUtils.requestAna('success_show', 'cooperate_red_packet', {
            promotion_id: that.data.pageData.activityId,
            share_type: '',
            action: that.data.redPackageInfo.isNewUser,
            is_allow: ''
          })
        } else {
          //刷新
          that.refreshPageContent();
        }

      } else {
        that.dealOtherStatus(res);
      }
    }, function (error) {
      that.showToast('网络遇到问题，请稍后重试');
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    thirdApi.checkSession(
      function () {
        netManager.login
      }
    );

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
  onShareAppMessage: function (options) {

    const that = this;
    const successCB = function (res) {

      if (!res.shareTickets || res.shareTickets.length == 0) {
        that.showToast('分享给微信群才有效哦～');
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

    const failedCB = function (err) {
      that.showToast('分享失败');
      //以下不作处理
    }

    const complete = function (res) {

    }

    return {
      title: that.data.pageData.share_info.miniAppShareInfo.miniDesc,
      imageUrl: that.data.pageData.share_info.miniAppShareInfo.miniImgUrl,
      path: '/pages/active_page/product_share/product_share?shareCode=' + that.data.shareCode + "&userID=" + app.globalData.wxappLogin.user_id +
        "&scene=" + app.globalData.fromSource,
      success: successCB,
      fail: failedCB,
      complete: complete
    }

  },
  //关闭领券弹窗
  closeProductTickerDialog: function () {
    let prePageData = this.data.pageData;
    prePageData.buttonName = "已获得商品券，去商城买买买";
    this.setData({
      isShowProductTickerDialog: false,
      mainShareButtonEnable: false,
      pageData: prePageData
    })
  },
  //立即使用
  useRightNow: function () {
    this.closeProductTickerDialog();
    let that = this;
    serviceUtils.requestAna('use_click', 'cooperate_red_packet', {
      invite_code: that.data.shareCode
    })

    //2018年05月18日 如果是新人，则去新人专享页面
    if (this.data.pageData.newUser == 1) {
      appInteriorSkip.navigateToNewExclusive();
    } else {
      appInteriorSkip.switchTabIndex();
    }
  },
  //再玩一次
  playGameAgain: function () {
    this.closeProductTickerDialog();
    let that = this;
    serviceUtils.requestAna('again_click', 'cooperate_red_packet', {
      invite_code: that.data.shareCode
    })
    this.refreshPageContent();
  },
  setMainShareButtonEnable: function () {
    this.setData({
      mainShareButtonEnable: true
    })
  },
  setMainShareButtonDisable: function () {
    this.setData({
      mainShareButtonEnable: false
    })
  },
  share: function () {

    if (this.data.mainShareButtonIsGrey) {
      return;
    }

    const that = this;
    if (!this.data.mainShareButtonEnable) {
      //2018年05月18日 如果是新人，则去新人专享页面
      if (this.data.pageData.newUser == 1) {
        appInteriorSkip.navigateToNewExclusive();
      } else {
        appInteriorSkip.switchTabIndex();
      }

      serviceUtils.requestAna('use_click', 'cooperate_red_packet', {
        invite_code: that.data.shareCode
      })
    }
  },
  banner1Click: function () {
    serviceUtils.requestAna('banner_click', 'cooperate_red_packet', {
      pos: '0'
    });
    this.onBottomBannerClick(0);
  },
  banner2Click: function () {
    serviceUtils.requestAna('banner_click', 'cooperate_red_packet', {
      pos: '1'
    });
    this.onBottomBannerClick(1);
  },
  onFormIdClick: function (res) {
    utils.logi(res);
  },
  onBottomBannerClick: function (position) {
    let pageUrl;

    switch (position) {
      case 0:
        pageUrl = this.data.pageData.productShareConfDto.directUrl1;
        break;
      case 1:
        pageUrl = this.data.pageData.productShareConfDto.directUrl2;
        break;
    }

    if (!pageUrl || pageUrl.startsWith('http')) {
      this.showToast('传入的地址有误,不作处理');
      return;
    }

    let reqData = {
      url: pageUrl
    }
    return thirdApi.wxGenPromise('navigateTo', reqData);
  },
  toActiveRule: function () {
    // appInteriorSkip.navigateToWebPage('https://p-h5.missfresh.cn/h5_file/993CD2182FD5F0FC15E928600414B7A2/index.html', '活动规则');

    this.setData({
      coverView: true
    })
  },
  closeRedPackage: function () {
    this.setData({
      showRedPackage: false
    })
  },
  nothing: function () {

  },
  useRightNowRed: function () {
    this.useRightNow();
    serviceUtils.requestAna('click', 'pop_invite');
  },
  closePopup: function () {
    this.setData({
      showPopup: false
    })
  },
  onPopupClick: function () {
    const that = this;
    serviceUtils.requestAna('pop_share_click', 'cooperate_red_packet', {
      invite_code: that.data.shareCode,
      promotion_id: that.data.pageData.activityId
    });
  }
})