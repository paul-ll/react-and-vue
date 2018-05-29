//my-vip.js
//获取应用实例
const app = getApp()
const myVip = require('../../../utils/services/vip.js')
const netManager = require('../../../utils/services/net_manager.js')
const categoryService = require('../../../utils/services/categories.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const { reconnect } = require('../../../utils/templates/no_network/no_network.js')
const updateCartItem = require('../../../utils/custom/update_cart_item.js')
const utils = require('../../../utils/util.js')
const cartService = require('../../../utils/services/cart.js')
const bannerSkip = require('../../../utils/custom/banner_skip.js')
const productOperate = require('../../../utils/services/product_operate');
const addressService = require('../../../utils/services/address.js')
const thirdApi = require('../../../utils/services/third_api.js')
const requestAna = require('../../../utils/service_utils.js').requestAna

const productItemHelper = require('../../../utils/services/product_item_helper');

Page({
  data: {
    network: {
      noNetwork: false,
    },
    loading: true,
    shareDoc: '',
    shareImgUrl: '',
    nodata: {
      noData: false,
      imgUrl: '',
      noDataText: ''
    },
    haveData: false,
    showNoAddressRules: false, //是否显示无地址权限页面
    options: {},
    is_vip_user: 0,
    user_type: -1,
    userLogin: false,
    vipCardInfo: '',
    vip_rights_icon: '',
    banners: [],
    vipRedPacketInfo: '',
    save_money_list: [],
    indicatorDots: true,//显示面板指示点  
    autoplay: true,//自动播放  
    // beforeColor: "rgba(0,0,0,0.50)",//指示点颜色  
    afterColor: "rgba(0,0,0,0.50)",//当前选中的指示点颜色  
    coverView: false,
    isShowDialog: false,
    total_save_name: '',
    total_save_text: '',
    total_save_money_text: '',
    saveMoneycolor: '',//计算器金额颜色
    openVipButton: '',
    open_card_button_name: '',
    end_time_text: '',
    isShowGroup: false,
    tipShow: false,
    newVipCardButton: '',//会员button
    bannerIndex: '',
    showNoMoreProduct: false, // 是否展示"没有更多商品啦"的文案
    products: [],//会员货架
    toView: '',
    bannerIndicatorDots: false,
    bannerAutoplay: true,
    title_name: '',
  },

  isLogin: function () {
    const that = this
    myVip.vipinfo().then((res) => {
      utils.logi(res)
      if (res.data.code == 0) {
        that.setData({
          loading: false,
          haveData: true,
          user_type: res.data.user_type,
          vipCardInfo: res.data.vipCardInfo,
          vip_rights_icon: res.data.vip_rights_icon,
          vipRedPacketInfo: res.data.vipRedPacketInfo,
          save_money_list: res.data.save_money_list,
          total_save_name: res.data.total_save_name,
          total_save_text: res.data.total_save_text,
          total_save_money_text: res.data.total_save_money_text,
          openVipButton: res.data.openVipButton,
          open_card_button_name: res.data.open_card_button_name,
          end_time_text: res.data.end_time_text,
          newVipCardButton: res.data.newVipCardButton,
        })
        if (res.data.is_vip_user) {
          that.setData({
            is_vip_user: res.data.is_vip_user,
          })
        }
        if (res.data.user_type) {
          app.globalData.user_type = res.data.user_type
        }
        if (res.data.banner) {
          let bannerHeight = that.getBannerHeight(res.data.banner)
          that.setData({
            banners: res.data.banner,
            bannerHeight: bannerHeight
          })

        }
        let saveMoneycolor = utils.deciToHex(res.data.total_save_money_text.color)
        that.setData({
          saveMoneycolor: saveMoneycolor,
        })
        that.VipProduct();

      } else {
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
        if (res.data.code == 10) {
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
      // 设置无网络
      that.setData({
        loading: false,
        haveData: false,
        'network.noNetwork': true,
      })
    })
  },
  VipProduct: function () {
    const that = this;
    myVip.vipproduct().then((res) => {
      console.log(res)
      if (res.data.code == 0) {
        that.setData({
          products: res.data.products,
          title_name: res.data.title_name,
        })
      }
    })

  },
  initPage() {
    var that = this;
    console.log(app.globalData.wxappLogin)
    if (!app.globalData.wxappLogin) {
      app.getUserInfo((wxappLogin) => {
        app.getAddressInfoV2(function () {
          that.setData({
            userLogin: true
          })
          that.isLogin();
        }, (err) => {
          // 设置无网络
          that.setData({
            loading: false,
            haveData: false,
            network: {
              noNetwork: true,
            },
          })
        })
      }, (err) => {
        console.log(89787)
        // 设置无网络
        that.setData({
          loading: false,
          haveData: false,
          'network.noNetwork': true,
        })
      }, (err) => {
        that.userAuthorize()
      })
    } else if (app.getReceiveAddressInfo().id) {
      that.setData({
        userLogin: true
      })
      that.isLogin();
    } else {
      app.getAddressInfoV2(function () {
        that.setData({
          userLogin: true
        })
        that.isLogin();
      }, (err) => {
        that.userAuthorize()
      })
    }
  },
  userAuthorize: function () {
    const that = this;
    thirdApi.hideToast()
    thirdApi.wxApi('getSetting').then(function (res) {
      console.log(res)
      if (!res.authSetting["scope.userLocation"]) {
        thirdApi.hideToast()
        that.wetoast.toast({
          title: '请尝试打开微信【授权】权限',
          duration: 2000
        })
        that.setData({
          loading: false,
          haveData: false,
          showNoAddressRules: true,
        })
      } else {
        that.setData({
          userLogin: false
        })
        that.isLogin();
      }
    })
  },
  getUserInfo: function () {
    const that = this
    thirdApi.wxApi('getSetting').then(function (res) {
      console.log(res)
      if (res.authSetting["scope.userInfo"]) {
        that.setData({
          userLogin: true
        })
      }
    }).then(function () {
      setTimeout(function () {
        that.initPage();
      }, 300)
    })
  },
  vipLogin() {
    const that = this
    app.showWarningModal(() => {
      this.isLogin();
    }, () => {
      // this.isLogin();
      that.wetoast.toast({
        title: '授权失败, 部分功能不可用~'
      })

    })
  },
  noRule: function () {
    // console.log(5455656)
    let that = this;
    that.setData({
      loading: true,
      showNoAddressRules: false
    })
    that.initPage();
  },
  haveRule: function () {
    console.log(5455656)
    let that = this;
    that.setData({
      loading: true,
      showNoAddressRules: false
    })
    that.initPage();
  },
  onLoad: function (indexRes) {
    utils.logi(" ------------------------------my_vip.onload------------------------------ ")
    new app.globalData.WeToast()

    netManager.mountAuthInitData();
    productItemHelper.mountProductMethod();
    productOperate.mountProductOperateMethod();

    if (indexRes.from) {
      this.setData({
        toView: indexRes.from
      })
    }

    setTimeout(() => {
      requestAna('bottom_nav', 'member_zone_tab')
    }, 1000)
  },
  setTitle: function (titleName) {
    wx.setNavigationBarTitle({
      title: titleName
    })
  },
  onReady: function () {

  },
  onShow: function () {
    //定义that
    this.initPage();
    productOperate.syncCartCount();
  },
  onShareAppMessage: function () {
    return {
      title: '',
      desc: ' ',
      //desc: this.data.productDetail.name + '   ￥' + this.data.productDetail.vip_price_pro.price_down.price/100.0,
      path: '',
      success(res) {
        utils.logi(res)
      }
    }
  },
  //重新请求网络
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
  openCalc() {
    requestAna('click_calculator_show', 'member_role')
    // 点击计算器
    this.setData({
      coverView: true
    })
  },
  cancelPayBox() {
    this.setData({
      coverView: false
    })
  },
  closeBtnClick() {
    this.setData({
      isShowDialog: false
    })
  },
  noVip: function () {
    this.setData({
      isShowGroup: true
    })
  },
  closeBtnGroup: function () {
    this.setData({
      isShowGroup: false
    })
  },
  //邀请好友
  askFriend: function () {
    requestAna('gift_experience_card', 'member_role')
    setTimeout(function () {
      appInteriorSkip.navigateToInviteFriendVip()
    }, 300)

  },
  //免费体验
  vipLife: function () {
    requestAna('free_experience', 'member_plus')
    this.setData({
      isShowDialog: true
    })
  },
  bindScroll: function (e) {
    const that = this
    if (e.detail.scrollTop > 370) {
      if(that.data.tipShow == false){
        that.setData({
          tipShow: true
        })
      }
    } else {
      if(that.data.tipShow == true){
        that.setData({
          tipShow: false
        })
      } 
    }
  },
  tapIcon: function (e) {

    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.id
    requestAna('privileged_icon', 'member_plus', {
      pos: index,
      pay_type: id
    })
    setTimeout(function () {
      appInteriorSkip.navigateToMemberPrivileges(index)
    }, 300)

  },
  tonavigateToPackets: function (e) {
    let index = e.currentTarget.dataset.index
    requestAna('redpacket_icon', 'member_plus', {
      pos: index,
    })
    setTimeout(function () {
      appInteriorSkip.navigateToPackets()
    }, 300)

  },
  vipExperience: function () {
    //立即体验
    const that = this;
    myVip.immediateExperience().then((res) => {
      if (res.data.code == 0) {
        that.setData({
          isShowDialog: false
        })
        that.initPage()
      }
    })
  },
  openVipCard: function (e) {
    const that = this;
    const user_type = that.data.user_type
    if (user_type <= 0) {
      requestAna('start_open', 'mp_experience_popup')
    } else if (user_type == 2) {
      requestAna('click_card', 'member_plus')
    } else if (user_type == 3 || user_type == 1) {
      requestAna('click_card', 'member_plus')
    }
    setTimeout(function () {
      appInteriorSkip.navigateToOpenVip();
    }, 300)
  },
  bannerChange(event) {
    // let index = event.detail.current
    let bannerIndex = event.detail.current + 1
    // let categories = this.data.categories
    // categories[this.data.current].current = index + 1
    this.setData({
      bannerIndex
    })
  },
  /* 点击一级banner */
  clickBanner: function (event) {
    // 点击banner跳转逻辑
    // console.log("clickBanner.event", event)
    let dataset = event.currentTarget.dataset
    let bannerIndex = dataset.bannerIndex
    let bannerLevel = dataset.bannerLevel
    let bannerPromotionId = dataset.promotionId
    let bannerEntity = dataset.bannerEntity;
    let name = dataset.name;

    if (bannerLevel === "1") {
      let banners = this.data.banners
      // console.log("clickBanner", banners.length > bannerIndex)
      requestAna('banner', 'member_plus', {
        pos: bannerIndex + '',
        share_type: banners[bannerIndex].name
      })
      requestAna('banner', banners[bannerIndex].name, {
        banner_type: banners[bannerIndex].type,
      })
      if (banners.length > bannerIndex) {
        bannerSkip.bannerSkip(banners[bannerIndex])
      }
    } else if (bannerLevel === "2") {
      let products = this.data.products
      if (products.length > bannerIndex && products[bannerIndex].type === "group") {
        bannerSkip.bannerSkip(products[bannerIndex].banner[0])
      }
      if (dataset.name) {
        requestAna('banner', dataset.name)
      }
    }
    else if (bannerLevel === "3") {//新添加广告弹屏
      let banners = this.data.advert_list
      // console.log("clickBanner", banners.length > bannerIndex)
      if (banners.length > bannerIndex) {
        bannerSkip.bannerSkip(banners[bannerIndex])
      }
    }
  },
  onUnload: function () {
    productOperate.unmountProductOperateMethod();
  },
  /* 跳转商品详情页 */
  chooseProduct: function (event) {
    // 根据sku跳转到对应商品详情页
    // console.log("chooseProduct.event", event);
    let dataset = event.currentTarget.dataset
    let productSku = dataset.productSku
    let pTitle = dataset.productTitle
    // let last_page = "member_role"
    // app.globalData.lastPage  = last_page
    // requestAna('view_product', 'product_detail', {
    //     sku: productSku,
    //     p_title: pTitle,
    // })
    let dataList = {
      productSku: event.currentTarget.dataset.productSku,
    }
    appInteriorSkip.productDetail(dataList)
  },
  /* 点击订阅提醒 */
  subscribeArrivalRemind: function (event) {
    const that = this
    // console.log("subscribeArrivalRemind.event", event)
    if (!app.globalData.hasUserInfoRight) {
      app.showWarningModal(() => {
        that.initPage()
      }, () => {
        this.wetoast.toast({
          title: '授权失败, 部分功能不可用~~'
        })
      })
      return
    }
    let sku = event.currentTarget.dataset.productSku
    let formId = event.detail.formId
    let dataList = {
      sku: sku
    }
    // this.addToStorage(sku)

    cartService.subscribeArrivalRemind('WX', dataList, formId).then(function (res) {
      const resData = res.data
      // console.log("subscribeArrivalRemind.subscribeArrivalRemind.res", resData)
      if (resData.code === 0) {
        thirdApi.showModal(resData.data.title, resData.data.content, false).then(function (res) {
          if (res.confirm) {
            // console.log("subscribeArrivalRemind.showModal.event", event)
          }
        })
      } else if (resData.code === 1) {
        // thirdApi.showToast(resData.data.msg, 'sucess', 2000)
        that.wetoast.toast({ title: resData.msg, duration: 1500 })
      } else {
        thirdApi.showToast('已订阅成功！', 'sucess', 2000)
        // this.wetoast.toast({title:'已订阅成功！' , duration: 2000 })
      }
    })
  },
  getBannerHeight(banners) {
    if (banners && !banners.length) {
      return 0
    }
    let winWidth = app.globalData.systemInfo.windowWidth
    let bannerHeight
    let tempBanner = banners[0]
    let tempWidth = tempBanner.width
    let tempHeight = tempBanner.height
    if (!tempWidth || !tempHeight) {
      bannerHeight = Math.floor(28 / 75 * winWidth)
    } else {
      bannerHeight = Math.floor((tempHeight / tempWidth) * winWidth)
    }
    return bannerHeight
  },
  showToast(str) {
    //在调用该方法前，必须先为当前的Page添加一个toast成员属性
    this.wetoast.toast({ title: str, duration: 1500 })
  },
  addToCart(event) {
    let dataset = event.currentTarget.dataset
    productOperate.addToCart(dataset.productSku, dataset.seckillLimit, dataset.stock, dataset.quantity || 0);
    requestAna('add_cart', 'member_plus', {
      action: '+',
      sku: dataset.productSku,
      pos: dataset.productIndex,
    })
  },
  decrease(event) {
    let dataset = event.currentTarget.dataset
    productOperate.decrease(dataset.productSku);
    requestAna('add_cart', 'member_plus', {
      action: '-',
      sku: dataset.productSku,
      pos: dataset.productIndex,
    })
  }
})
