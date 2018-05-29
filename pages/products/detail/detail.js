//detail.js
//获取应用实例
const app = getApp()
const cartService = require('../../../utils/services/cart.js')
const categoryService = require('../../../utils/services/categories.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const { reconnect } = require('../../../utils/templates/no_network/no_network.js')
const updateCartItem = require('../../../utils/custom/update_cart_item.js')
const utils = require('../../../utils/util.js')
const addressService = require('../../../utils/services/address.js')
const thirdApi = require('../../../utils/services/third_api.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const redPacket = require('../../../utils/services/red_packet.js')
const compressImageUtils = require('../../../utils/services/compress_image_utils.js')
const userInfoService = require('../../../utils/services/userinfo.js')
const productOperate = require('../../../utils/services/product_operate');
const netManager = require('../../../utils/services/net_manager');
const getVisibleAna = require('../../../utils/custom/get_visible_Ana.js');
Page({
  data: {
    productSku: '',
    productDetail: [],
    totalPrice: 0,
    productFromCartInfos: {},
    network: {
      noNetwork: false,
      reconnecting: false
    },
    indexRes: {},
    isAddToCart: false,
    productId: 0,
    cartCount: 0, // 购物车商品总数
    miniStartInfo: null,
    productInfo: { products: [] },

    //购物车信息
    // cartInfo: {
    //   productFromCartInfos: {},
    //   cartCount: 0
    // },
    promotionTags: [],
  },
  reconnect,
  back: function (e) {
    wx.redirectTo({
      url: "../../index/index"
    })
  },
  swipeCategory: function (event) {
    utils.logi("swipeCategory.event", event.detail);
  },
  aboutUs: function (event) {
    utils.logi(event.detail);
    appInteriorSkip.aboutUs()
  },
  reloadCartItems: function (cartItems) {
    let productFromCartInfos = app.globalData.productFromCartInfos
    let productFromCart = {}
    for (let key in cartItems) {
      utils.logi("reloadCartItems.cartItems", cartItems, key, cartItems[key], productFromCartInfos)
      let activeCartChecked = app.globalData.activeCartChecked
      activeCartChecked[key] = true
      productFromCart['sku'] = key
      productFromCart['isActive'] = 1
      productFromCart['quantity'] = cartItems[key]
      productFromCartInfos[key] = productFromCart
      utils.logi("reloadCartItems", key, productFromCartInfos)
    }
    app.setProductFromCartInfos(productFromCartInfos)
    let cartCount = app.globalData.cartCount
    this.setData({
      productFromCartInfos: productFromCartInfos,
      cartCount: cartCount
    })
    this.setData({
      isAddToCart: false
    })
    utils.logi("reloadCartItems.data", this.data)
  },
  updateCartItem: function (productId, quantity, addType) {
    // const that = this
    // let productLists = [{
    //   sku: productId,
    //   quantity: quantity
    // }]
    // cartService.addToCarts(productLists, addType).then(function(res) {
    //   that.reloadCartItems(res.data);
    // })
    updateCartItem.updateCartItem(productId, quantity, addType)
  },
  checkQuantity: function (productSku) {
    let productDetail = this.data.productDetail
    let productFromCartInfo = this.data.productFromCartInfos[productSku]
    let quantity = productFromCartInfo == undefined ? 0 : productFromCartInfo.quantity
    if (productDetail.sku === productSku) {
      if (productDetail.stock <= 0) {
        // thirdApi.showToast('该产品已售罄!', 'sucess', 2000)
        this.wetoast.toast({ title: '该产品已售罄!', duration: 2000 })
        return false
      } else if (quantity >= productDetail.stock) {
        // thirdApi.showToast('只剩' + productDetail.stock + '份啦~', 'sucess', 2000)
        this.wetoast.toast({ title: '只剩' + productDetail.stock + '份啦~', duration: 2000 })
        return false
      } else if (productDetail.seckill_limit && quantity >= productDetail.seckill_limit) {
        // thirdApi.showToast('活动期间本商品限购' + productDetail.seckill_limit + '份', 'sucess', 2000)
        this.wetoast.toast({ title: '活动期间本商品限购' + productDetail.seckill_limit + '份', duration: 2000 })
        return false
      }
    }
    return true
  },
  addToCart: function (event) {
    const that = this
    if (!app.globalData.hasUserInfoRight) {
      app.showWarningModal(() => {
        that.onLoad(that.data.indexRes)
      }, () => {
        that.wetoast.toast({
          title: '授权失败, 部分功能不可用~~'
        })
      })
      return
    }
    this.setData({
      isAddToCart: true
    })
    let dataset = event.currentTarget.dataset
    let productSku = dataset.productDetailSku || dataset.productSku;
    let pTitle = dataset.productTitle

    dataset.productDetailSku && requestAna('add_shopping_cart', 'product_details', {
        sku: productSku,
        p_title: pTitle,
        type: that.data.productId + '',
        channel: (this.data.indexRes.channel || '') + ''
    })
    if (this.checkQuantity(productSku)) {
      this.updateCartItem(productSku, 1, 1)
      // 测试加车动画
      if (dataset.listPosition && dataset.listPosition == 'productDetail') {
        //购物车抛物动画 (时间间隔)(解决点击过于频繁时)
        let nowTime = new Date().getTime();
        let clickTime = that.data.ctime;
        if (clickTime != 'undefined' && (nowTime - clickTime < 800)) {
          // thirdApi.showToast('操作过于频繁', 'loading', 1000)
          return;
        } else {
          that.setData({
            ctime: nowTime
          })
          let productIndex = dataset.productPos;
          let systemInfo = app.globalData.systemInfo;
          let endX = 40,
            endY = systemInfo.windowHeight + 49 - 25;
          that.addcart.animateAddToCart(`#product-image-h-slip-${productIndex}`, endX, endY)
        }
        
      }
      
    }
    // 商品详情推荐商品加车埋点
    if(dataset.listPosition && dataset.listPosition == 'productDetail'){
      let params = {
        pos: dataset.productPos,
        parh: productSku
      }
      requestAna('add_cart', 'product_detail', params);
    }
    setTimeout(function () {
      that.setData({
        isAddToCart: false
      })
    }, 10000)
  },
  openCart: function (event) {
    requestAna('shopping_cart_icon', 'product_details')
    appInteriorSkip.switchTabCart()
    // utils.logi('openCart.event', event, getCurrentPages())
    // let pages = getCurrentPages()
    // let prePage = pages[pages.length - 2]
    // prePage.setSwitchTabCart()
    // appInteriorSkip.backPage(1)
  },
  isLogin: function (indexRes) {
    const that = this
    categoryService.getSkuDetail(indexRes.productSku).then(function (res) {
      let resData = res.data
      // code值存在且不为0时, 说明拉取信息出错
      if (resData.code) {
        that.wetoast.toast({ title: resData.msg || '请求出错啦~', duration: 2000 })      
        // if(resData.code == 1){
        //   appInteriorSkip.switchTabIndex()
        // }
        return
      }

      if (resData.images) {
        compressImageUtils.compressProductDetailProductImage(resData.images);
      }

      if (resData.image) {
        resData.image = compressImageUtils.compressImage(resData.image);
      }

      if (resData.instruction){
        compressImageUtils.compressProductDetailDescImage(resData.instruction);
      }

      if (that.data.productId) {
        let productSku = resData.sku
        let pTitle = resData.name
        requestAna('click_product_details', 'applet_delivery_product', {
          type: that.data.productId + '',
          sku: productSku,
          p_title: pTitle,
        })
      }
      if (resData.vip_price_pro && resData.vip_price_pro.price_up) {
        // 将十进制数值转化为色值
        resData.vip_price_pro.price_up.color = utils.deciToHex(resData.vip_price_pro.price_up.color)
        resData.vip_price_pro.price_down.color = utils.deciToHex(resData.vip_price_pro.price_down.color)
      }
      utils.logi("isLogin.getSkuDetail.res", resData);
      that.setData({
        productDetail: resData,
        productFromCartInfos: app.globalData.productFromCartInfos,
        'network.noNetwork': false
      })
    }, function (err) {
      that.wetoast.toast({ title: err.msg || "请求出错啦~", duration: 2000 })
      that.setData({
        'network.noNetwork': true
      })
    }).catch(res => utils.logi("getSkuDetail.catch.res", res));
  },
  getStationCode: function () {
    return categoryService.getAllCategories()
  },
  getPoductFromCartInfos: function () {
    const that = this
    cartService.getAllCartItems().then(function (res) {
      // utils.logi('received cart items: ', res.data)
      const getAllCartItemsData = res.data
      let allCartItemsData = {}
      for (let index = 0; index < getAllCartItemsData.length; ++index) {
        // old 为次日达商品
        if (getAllCartItemsData[index].trans_type === 'old') {
          allCartItemsData = getAllCartItemsData[index];
        }
      }
      const activeCartItems = allCartItemsData.active_item
      const inactiveCartItems = allCartItemsData.inactive_item
      let productFromCartInfos = {} // 新建一个购物车对象并替换之前的
      let productSku = ''
      let productFromCart = {}
      // 获取购物车有效商品列表
      for (let m = 0; m < activeCartItems.length; ++m) {
        let activeCartItem = activeCartItems[m]
        productSku = activeCartItem.sku
        productFromCart = {}
        productFromCart['sku'] = productSku
        productFromCart['isActive'] = 1
        productFromCart['quantity'] = activeCartItem.quantity
        productFromCartInfos[productSku] = productFromCart
      }
      // 获取无效商品列表 
      for (let n = 0; n < inactiveCartItems.length; ++n) {
        let inactiveCartItem = inactiveCartItems[n]
        productSku = inactiveCartItem.sku
        productFromCart = {}
        productFromCart['sku'] = productSku
        productFromCart['isActive'] = 2
        productFromCart['quantity'] = inactiveCartItems.quantity
        productFromCartInfos[productSku] = productFromCart
      }
      app.setProductFromCartInfos(productFromCartInfos)
      let cartCount = app.globalData.cartCount
      that.setData({
        productFromCartInfos: productFromCartInfos,
        cartCount
      })
    });
  },
  onLoad: function (indexRes) {
    utils.logi(" ------------------------------products.detail.onload------------------------------ ")
    console.log(app.globalData.productFromCartInfos[2222])
    new app.globalData.WeToast()
    // 初始化加车动画实例
    new app.globalData.addToCart();
    console.log(indexRes)
    this.setData({
      indexRes: indexRes,
    })
    if (indexRes.productId) {
      this.setData({
        productId: indexRes.productId
      })
      app.globalData.productId = indexRes.productId
    }

    const that = this;
    // 购物车
    // productOperate.setCallback({
    //   onFail(error) {
    //     that.showToast(error.title);
    //   },
    //   onSuccess(res) {
    //     that.setData({
    //       cartInfo: res,
    //     })
    //   }
    // })
    if ((this.data.productDetail.name != undefined) && (this.data.productDetail.name != '')) {
      this.setTitle(this.data.productDetail.name)
    }
    // 若用户未登录
    if (!app.globalData.wxappLogin || (app.globalData.wxappLogin && !app.globalData.wxappLogin.access_token)) {
      app.getUserInfo(function (wxappLogin) {
        that.setData({
          wxappLogin: wxappLogin
        })
        app.getAddressInfo(function () {
          that.isLogin(that.data.indexRes);
        });
      })
      // 若用户已登录, 但没有地址, 则先获取定位
    } else if (!app.globalData.currentAddressInfo || (app.globalData.currentAddressInfo && utils.gIsEmptyObject(app.globalData.currentAddressInfo))) {
      app.getAddressInfo(function () {
        that.isLogin(that.data.indexRes);
      });
    } else {
      that.isLogin(that.data.indexRes)
    }
    //千人千面推荐@guozhen
    this.getRecommend(indexRes.productSku);
    this.data.productSku = indexRes.productSku;
    this.miniStart()
  },
  setTitle: function (titleName) {
    wx.setNavigationBarTitle({
      title: titleName
    })
  },
  onReady: function () {
    if ((this.data.productDetail.name != undefined) && (this.data.productDetail.name != '')) {
      this.setTitle(this.data.productDetail.name)
    }
  },
  onShow: function () {
    this.getPoductFromCartInfos()
  },
  onShareAppMessage: function () {
    return {
      title: '"' + this.data.productDetail.subtitle + '"',
      desc: ' ',
      //desc: this.data.productDetail.name + '   ￥' + this.data.productDetail.vip_price_pro.price_down.price/100.0,
      //path: '/pages/products/detail/detail?productSku='+this.data.productDetail.sku
      path: '/pages/index/index?goPage=productDetail&productSku=' + this.data.productDetail.sku,
      success (res) {
        utils.logi(res)
      }
    }
  },
  miniStart () {
      if (this.data.miniStartInfo) return 
      // 由于接口调用用到了service_utils中的getRequestUrl()方法, 其中用到了app实例, 但是在app的onLaunch时, app实例还未生成, 会导致报错, 所以不能在onLaunch阶段调用此方法
      if (app.globalData.miniStart) {
        this.setData({
          miniStartInfo: app.globalData.miniStartInfo
        })
      } else {
        userInfoService.miniStart().then(res => {
          app.globalData.miniStartInfo = res.data
          this.setData({
            miniStartInfo: app.globalData.miniStartInfo
          })
        })
      }
  },
  getPriceTagWidth (event) {
    let width = 0
    let height = 22
    let imgWidth = event.detail.width
    let imgHeight = event.detail.height
    width = imgWidth / imgHeight * height
    this.setData({
        priceTagWidth: width
    })
  },
  /**
     * 购物车千人千面
     */
  getRecommend(sku) {
    let that = this;
    let url = netManager.getRequestUrl('getReSkus');
    let params = {
      "from": 'product',
      "sku" : sku
    }
    netManager.genPromise(url, 'POST', params).then(function (res) {
      let products = res.data.data.products
      that.cutImage(products);

      if (products && products.length > 0) {
        products.forEach(item => {
          item.price = item.vip_price_pro;
          item.isNewUser = 1;
        })
      }
      that.setData({
        productInfo: { products: products },
      })
      // 需要获取到购物车的商品, 并且将商品数量同步
      that.getPoductFromCartInfos();
    }, function (error) {
      utils.loge(error);
    });
  },
  /* 给图片添加参数, 减小图片体积 */
  cutImage(products) {
    if (products && products.length > 0) {
      products.forEach(product => {
        if (product.type !== 'product'
          || /\.gif$/i.test(product.image)
          || /\?/i.test(product.image)) {
          return
        }
        product.image = product.image + '?iopcmd=thumbnail&type=4&width=200'
      })
    }
  },
  // 跳转详情
  onItemClick: function (event) {
    let dataset = event.currentTarget.dataset
    let dataList = {
      productSku: dataset.sku,
    }
    appInteriorSkip.productDetail(dataList)
    // 商品详情推荐商品加车埋点
    if (dataset.listPosition && dataset.listPosition == 'productDetail') {
      let params = {
        pos: dataset.productPos,
        path: dataset.sku
      }
      requestAna('click_recommend_product_detail', 'product_detail', params);
    }
  },
  // 购物车
  decrease: function (event) {
    let dataset = event.currentTarget.dataset
    productOperate.decrease(dataset.productSku);
  },

  /**
     * 优化商品item左上角promotionTags（促销标签)
     */
  getWidth(event) {
    // 标签宽度根据高度自适应
    let width = 0
    let height = 64 // 单位为rpx
    let productIndex = event.currentTarget.dataset.index
    let imgWidth = event.detail.width
    let imgHeight = event.detail.height
    let windowWidth = app.globalData.systemInfo.windowWidth
    let promotionTags = this.data.promotionTags
    width = imgWidth / imgHeight * height
    promotionTags[productIndex] = {
      width
    }
    this.setData({
      promotionTags
    })
  },
  // 滑动结束事件
  touchE(){
    utils.logi("滑动结束====================》");
    //搜集曝光商品进行埋点
    getVisibleAna('#single-product-h-slip-',this.data.productInfo.products, "recommend_product_show", "product_detail", {path:this.data.productSku});
  },
})
