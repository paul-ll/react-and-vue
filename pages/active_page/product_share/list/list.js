// pages/active_page/product_share/list/list.js
const app = getApp();
const utils = require('../../../../utils/util');
const thirdApi = require('../../../../utils/services/third_api.js')
const serviceUtils = require('../../../../utils/service_utils');
const netManager = require('../../../../utils/services/net_manager');
const categoryService = require('../../../../utils/services/categories.js')
const appInteriorSkip = require('../../../../utils/services/app_interior_skip');
const bannerSkip = require('../../../../utils/custom/banner_skip');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //=============================== 公共部分 ===============================
    showNoAddressRules: false,//是否显示无地址权限页面
    network: {
      noNetwork: false,
    },
    loading: true,
    //=============================== 公共部分 ===============================

    //页面数据
    pageData: {},

    coverView: false,
    isShowMask: true,
    no_activity: false,
    sys_updating: false,

    isFirstStart: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //=============================== 公共部分 ===============================
    //Toast成员初始化
    new app.globalData.WeToast()
    //=============================== 公共部分 ===============================

    if (options.scene && !app.globalData.fromSource) {
      app.globalData.fromSource = options.scene;
    } else if(!app.globalData.fromSource) {
      app.globalData.fromSource = 'mryx';
    } 

    this.showLoadingView();
    this.initView();

    serviceUtils.requestAna('list_show', 'cooperate_red_packet');

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

  showUpdatingView: function () {
    this.setData({
      no_activity: false,
      sys_updating: true,
      loading: false
    })
  },
  showNoActiveView: function () {
    this.setData({
      no_activity: true,
      sys_updating: false,
      loading: false
    })
  },
  initView: function () {

    const that = this;
    app.getUserInfo(function (res) {
      that.requestPosition();
    }, function (err) {
      that.showNetErrorView();
    }, function (err) {
      that.showNoRuleView();
    });
  },
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
          that.refreshPageContent();
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
  refreshPageContent: function () {

    const that = this;

    const data = {
      accessToken: app.globalData.wxappLogin.access_token
    }

    let url = netManager.getRequestUrlWithMps('productShareList');
    netManager.genPromise(url, 'POST', data).then(function (res) {

      if (res.data.code == 0) {
        that.setData({
          pageData: res.data.data,
        })

        that.data.isFirstStart = false;
        that.showContentView();
      } else if (res.data.code == 17) {
        that.showNoActiveView();
      } else {
        that.showNetErrorView();
        that.showToast(res.data.message);
      }

    }, function (error) {
      that.showNetErrorView();
    });
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
    if (!this.data.isFirstStart) {
      this.refreshPageContent();
    }
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
  },

  onItemClick: function (event) {
    let index = event.currentTarget.dataset.index;
    const obj = this.data.pageData.activityList[index];
    if (obj.canClick == 0) {
      this.showToast('今天参与活动机会已用完，明天再来吧～');
      return;
    }

    appInteriorSkip.navigateToProductShare(obj.activityId);
    serviceUtils.requestAna('product_card_click', 'cooperate_red_packet', {
      promotion_id: obj.activityId,
      pos: index,
    });
  },
  toActiveRule: function () {
    this.setData({
      coverView: true
    })
  },
  cancelPayBox: function () {
    this.setData({
      coverView: false,
    })
  },
})