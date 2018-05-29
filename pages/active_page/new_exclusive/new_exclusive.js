// pages/active_page/new_exclusive/new_exclusive.js
const app = getApp();
const utils = require('../../../utils/util');
const thirdApi = require('../../../utils/services/third_api.js')
const serviceUtils = require('../../../utils/service_utils');
const netManager = require('../../../utils/services/net_manager');
const categoryService = require('../../../utils/services/categories.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip');
const bannerSkip = require('../../../utils/custom/banner_skip');

const productOperate = require('../../../utils/services/product_operate');

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
    imageHost: netManager.configs.imageHost,
    loading: true,
    //=============================== 公共部分 ===============================

    pageData: {},

    productInfo: { products: [] },

    //购物车信息
    cartInfo: {
      productFromCartInfos: {},
      cartCount: 0
    },
    bannerImage: '',

    hiddenTop: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //=============================== 公共部分 ===============================
    //Toast成员初始化
    new app.globalData.WeToast()
    //=============================== 公共部分 ===============================
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

    this.initView();
    this.showLoadingView();

  },

  initView: function () {
    const that = this;
    app.getUserInfo(function (res) {
      //登录完毕之后，开始获取经纬度
      that.refreshPageContent();

      app.getAddressInfoV2(function () {
        that.getNewUserProducts();
        // 需要获取到购物车的商品, 并且将商品数量同步
        that.getPoductFromCartInfos();
      });

    }, function (err) {
      that.showNetErrorView();
    }, function (err) {
      that.showNoRuleView();
    });
  },

  refreshPageContent: function () {
    const that = this;
    let url = netManager.buildRequestObj('newExclusive');
    netManager.genPromise(url).then(function (res) {
      utils.logi(res);
      if (res.data.code == 0) {
        that.setData({
          pageData: res.data
        })
        that.getExclusiveBanner();
        that.showContentView();
      } else {
        that.showNetErrorView();
      }
    }, function (error) {
      that.showNetErrorView();
    });
  },


  getExclusiveBanner: function () {
    const that = this;
    let url = netManager.getRequestUrl('exclusiveBanner', '', 1, {}, true);
    netManager.genPromise(url, 'POST').then(function (res) {
      if (res.data.code == 0) {
        that.setData({
          bannerImage: res.data.data.banner,
        })
      }
    }, function (error) {
    })
  },

  //获取新人专享商品
  getNewUserProducts: function () {
    const that = this;
    let url = netManager.buildRequestObj('newUserProduct');
    netManager.genPromise(url).then(function (res) {
      utils.logi(res);
      if (res.data.code == 0) {
        that.setData({
          productInfo: {
            products: res.data.data
          },
        })
      } else {
      }
    }, function (error) {
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


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    productOperate.setCallback(null);
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


  toShopcart: function () {
    appInteriorSkip.switchTabCart();
  },
  toMainPage: function () {
    appInteriorSkip.switchTabIndex();
  },
  onItemClick: function (event) {
    let dataList = {
      productSku: event.currentTarget.dataset.sku,
    }
    appInteriorSkip.productDetail(dataList)
  },

  onPageScroll: function (e) {
    var that = this;
    var h = e.scrollTop;
    if (h > 200) {
      that.setData({
        hiddenTop: false
      })
    } else {
      that.setData({
        hiddenTop: true
      })
    }
  },
  topAction: function () {
    thirdApi.pageScrollTo(0)
  },
  goToIndex: function () {
    this.wetoast.toast({
      title: "正在前往商城"
    })
    setTimeout(function () {
      appInteriorSkip.switchTabIndex()
    }, 1000)
  },
})