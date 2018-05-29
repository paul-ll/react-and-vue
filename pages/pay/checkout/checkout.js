//checkout.js
const app = getApp()
const cartService = require('../../../utils/services/cart.js')
const orderService = require('../../../utils/services/order.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const utils = require('../../../utils/util.js')
const pay = require('../../../utils/custom/pay.js')
const sha512 = require('../../../utils/external/sha512.min.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const compressImageUtils = require('../../../utils/services/compress_image_utils.js')
const storageManager = require('../../../utils/services/storage_manager');
const { flodUp } = require('../../../utils/templates/display_list/display_list')

Page({
  data: {
    selectedReceiveAddressInfo: {},
    addressDetail: '',
    checkoutItems: {},
    noActiveProductList: [],
    courierTimes: [[''], ['']],
    courierTimeIndex: [0, 0],
    arriveTimes: [],
    nationWideList: ['', '全国送', '2小时达', '次日达', '明日送达'],
    isNoSelectTime: 0,
    paying: false,
    isGoPay: false,
    day: 0,
    isLoad: false,
    // redpacketId: -1, // 当前选中的红包
    currentCouponIds: app.globalData.currentCouponIds,
    fromRedpacket: false, // 是否从红包选择页过来
    orderCount: 0, // 订单商品总数
    shouldCheckoutProduct: false, //是否应该检查商品
    isShowDisplayDetail: false,

    //到达时间控制部分
    firstArray: [],
    todayArray: [],
    tomorrowArray: [],
    todayArriveTimes: [],
    tomorrowArriveTimes: [],
    pageData: {},

    selectVipCardId: 0,
    vipCardInfo: {},

  },

  clickDisplay(event) {
    // return // 由于v1  v2接口切换, 为了保证正常运行, 暂不支持切换红包与商品券
    let queryType = event.currentTarget.dataset.queryType
    // let redpacketId = event.currentTarget.dataset.redpacketId || 0
    // let productCouponId = event.currentTarget.dataset.productCouponId || 0
    switch (Number(queryType)) {
      // 1:商品兑换券[product], 2:满减优惠券[mj], 3:红包[packet]
      case 1:
        requestAna('view_coupon', 'submit_order')
        appInteriorSkip.navigateToMyRedpackageList({ needProducts: true, voucherType: 'product', from: 'fill_order' })
        break
      case 3:
        requestAna('click_red_package', 'submit_order')
        appInteriorSkip.navigateToMyRedpackageList({ needProducts: true, voucherType: 'packet', from: 'fill_order', address_id: this.data.selectedReceiveAddressInfo.id })
        break
      default:
        break
    }
  },
  flodUp,
  selectAddress: function () {
    appInteriorSkip.myAddress(1)
  },
  clearOut: function () {
    let productList = this.data.checkoutItems.success
    let noActiveProductList = this.data.noActiveProductList
    utils.logi("clearOut", productList.length, noActiveProductList.length)
    if (noActiveProductList.length != 0) {
      let prePage = app.getPageByMethod('delUnInvalidActiveProduct');
      prePage.delUnInvalidActiveProduct(noActiveProductList);
    }
    this.setData({
      noActiveProductList: []
    })
    storageManager.setCheckoutActiveCartItems(productList);

    this.assertProduct();
  },
  //检查是否还有有效商品
  assertProduct: function () {
    let productList = this.data.checkoutItems.success;
    if (productList.length === 0) {
      appInteriorSkip.backPage()
      return true;
    }
    return false;
  },
  shouldCheckoutProductListOnShow() {
    this.data.shouldCheckoutProduct = true;
  },
  selectCourierTime: function (event) {
    utils.logi('selectCourierTime.event', event, this.data)
    let courierTimeIndex = event.detail.value
    if (courierTimeIndex === null || courierTimeIndex === "null") {
      courierTimeIndex = 0
    }
    this.setData({
      courierTimeIndex: courierTimeIndex,
      day: this.data.checkoutItems.products[0].otd[courierTimeIndex[0]].day,
    })
    utils.logi('selectCourierTime.data', this.data)
  },
  getOtdLists: function () {
    let courierTimeIndex = this.data.courierTimeIndex[1];

    let arriveTimes = this.data.courierTimeIndex[0] == 0 ? this.data.todayArriveTimes : this.data.tomorrowArriveTimes;
    let time = -1
    if (courierTimeIndex < arriveTimes.length) {
      time = arriveTimes[courierTimeIndex]
    }

    let otdLists = []
    let otdList = {
      nationwide: 2,
      time: time,
      day: this.data.day,
      type: 1
    }

    otdLists[0] = otdList;
    return otdLists;
  },
  getProductLists: function () {
    let products = this.data.checkoutItems.success
    utils.logi('----------------------this.data.checkoutItems-------------getProductLists---------------------', this.data.checkoutItems)
    let productLists = []
    for (let i = 0; i < products.length; ++i) {
      let product = products[i]
      let productInfo = {
        cart_item_id: product.id,
        nationwide: product.nationwide,
        quantity: product.quantity,
        sku: product.sku
      }
      productLists[i] = productInfo
      //cartService.addToCart(product.sku, -product.quantity)
    }
    utils.logi('----------------------productLists-------------getProductLists---------------------', productLists)
    return productLists
  },
  getPayType: function () {
    let checkoutItems = this.data.checkoutItems
    let payType = ''
    if (checkoutItems.pay_type_info.mryxpay_balance <= 0) {
      payType = 'wxapp_wxpay'
    } else if (checkoutItems.pay_type_info.mryxpay_balance > 0 && checkoutItems.pay_type_info.mryxpay_balance < checkoutItems.pay_price.amount) {
      payType = 'wxapp_wxpay_plus'
    } else if (checkoutItems.pay_type_info.mryxpay_balance >= checkoutItems.pay_price.amount) {
      payType = 'mryx_pay'
    }
    return payType
  },
  goPay: function (event) {
    requestAna('goto_pay', 'payment_page')
    const that = this
    this.setData({
      isGoPay: true
    })
    let otdLists = this.getOtdLists()
    let productLists = this.getProductLists()
    let selectedReceiveAddressInfo = this.data.selectedReceiveAddressInfo
    utils.logi("goPay.productLists", productLists, productLists.length, productLists.length != 0, productLists != null)
    if (productLists.length != 0 && productLists != null && selectedReceiveAddressInfo.id > 0) {
      thirdApi.showToast('正在加载', 'loading', 10000)
      let payType = this.getPayType()
      let voucherIdList = app.globalData.currentCouponIds
      // 生成订单
      cartService.checkout(this.data.selectedReceiveAddressInfo.id, otdLists, productLists, payType, event.detail.formId, voucherIdList, this.data.selectVipCardId).then(function (res) {
        utils.logi("goPay.checkout.res", res)
        let checkoutData = res.data

        // 风控策略
        if (checkoutData.code == 1108) {
          let actionSheetItems = [checkoutData.custom_phone]
          wx.showModal({
            content: checkoutData.msg,
            cancelText: '取消',
            confirmText: '联系客服',
            success: function (res) {
              if (res.confirm) {
                thirdApi.showActionSheet(actionSheetItems).then(function (res) {
                  utils.logi("showActionSheet.res", res.tapIndex)
                  if (!res.cancel) {
                    thirdApi.makePhoneCall(actionSheetItems[res.tapIndex])
                  }
                })
              }
            }
          })
          thirdApi.hideToast()
          return
        }
        if (checkoutData.id != undefined) {
          appInteriorSkip.redirectToOrderDetail(checkoutData.id, 'checkout');

        } else {
          thirdApi.hideToast()
          if (checkoutData.msg != undefined) {
            pay.payModel('优鲜提醒', checkoutData.msg, false, '知道了')
          } else if (checkoutData.message != undefined) {
            pay.payModel('优鲜提醒', checkoutData.message, false, '知道了')
          }
        }
      }).catch(function (res) {
        utils.logi("goPay.checkout.catch", res)
        pay.payModel('优鲜提醒', '支付异常', false, '知道了')
      });
    } else if (productLists.length === 0 || productLists === null) {
      pay.payModel('优鲜提醒', '请添加有效商品后再下单', false, '知道了')
    } else if (selectedReceiveAddressInfo.id <= 0) {
      pay.payModel('优鲜提醒', '请选择送货地址', false, '知道了')
    }
  },
  getCourierTime: function (checkoutItems) {

    if (!checkoutItems.products || checkoutItems.products.length == 0) {
      return;
    }

    if (checkoutItems.products[0].otd.length == 0) {
      return;
    }

    let otd = checkoutItems.products[0].otd[0];

    let days = checkoutItems.products[0].otd;
    for (let index = 0; index < days.length; index++) {
      const element = days[index];
      this.data.firstArray[index] = element.label;

      //今日时间处理
      if (index == 0) {
        let times = element.time;
        if (times.length > 0) {
          for (let i = 0; i < times.length; ++i) {
            this.data.todayArray[i] = times[i].value;
            this.data.todayArriveTimes[i] = times[i].key;
          }
        }
        //明日时间处理
      } else if (index == 1) {
        let times = element.time;
        if (times.length > 0) {
          for (let i = 0; i < times.length; ++i) {
            this.data.tomorrowArray[i] = times[i].value;
            this.data.tomorrowArriveTimes[i] = times[i].key;
          }
        }
      }
    }
    this.setData({
      courierTimes: [this.data.firstArray, this.data.todayArray],
      isLoad: true
    })
  },
  getNoActiveProductList: function (oldProductList, newProductList) {
    let noActiveProductList = []
    for (let i = 0; i < oldProductList.length; ++i) {
      let productSku = oldProductList[i].sku
      let j = 0;
      utils.logi("oldProductList", i, productSku, oldProductList.length)
      for (; j < newProductList.length; ++j) {
        if (productSku === newProductList[j].sku) {
          break;
        }
      }
      utils.logi("newProductList", j, newProductList.length)
      if (j === newProductList.length) {
        noActiveProductList.push(oldProductList[i])
      }
    }
    return noActiveProductList
  },
  setTitle: function () {
    wx.setNavigationBarTitle({
      title: "填写订单"
    })
  },
  onLoad: function (options) {
    let userMemberType = app.globalData.userMemberType
    let nationWideList = this.data.nationWideList



    nationWideList[2] = userMemberType > 0 ? '1小时达' : '2小时达'
    this.setData({
      nationWideList,
      selectVipCardId: options.vipCardID,
    })
    utils.logi(" ------------------------------pay.checkout.onload------------------------------ ")
    new app.globalData.WeToast()
  },
  onShow: function () {

    //如果是从商品列表返回，则检查是否还有有效商品
    if (this.data.shouldCheckoutProduct && this.assertProduct()) {
      this.data.shouldCheckoutProduct = false;
      return;
    }

    this.setData({
      currentAddressInfoIsDelete: app.globalData.currentAddressInfoIsDelete
    })

    this.checkoutPrepare();

    this.setTitle()
  },
  checkoutPrepare: function () {
    const that = this
    let checkoutItems = app.globalData.checkoutItems
    let receiveAddressInfo = app.getReceiveAddressInfo();
    this.setData({
      selectedReceiveAddressInfo: receiveAddressInfo,
      addressDetail: receiveAddressInfo.city + receiveAddressInfo.area + receiveAddressInfo.address_detail
    })

    let productList = storageManager.getCheckoutActiveCartItems();
    let voucherIdList = app.globalData.currentCouponIds
    if (productList.length != 0) {
      thirdApi.showLoading();
      cartService.checkoutPrepare(receiveAddressInfo.id, productList, voucherIdList, 'fill_order', this.data.selectVipCardId).then(function (res) {
        thirdApi.hideLoading();
        checkoutItems = res.data

        if (checkoutItems.code) {
          that.wetoast.toast({ title: checkoutItems.msg || '网络出错啦, 请稍后重试~', duration: 1000 })
          return
        }
        let shoppingcartProducts = checkoutItems.success;
        let orderCount = that.getOrderCount(shoppingcartProducts)
        if (shoppingcartProducts && shoppingcartProducts instanceof Array) {
          for (let index = 0; index < shoppingcartProducts.length; index++) {
            const element = shoppingcartProducts[index];
            element.image = compressImageUtils.compressImage(element.image);
          }
        }
        //将暂存的商品信息替换为最新的;
        storageManager.setCheckoutActiveCartItems(shoppingcartProducts);

        let couponIds = []
        couponIds.push(checkoutItems.current_coupon_voucher_id, checkoutItems.current_product_voucher_id, checkoutItems.current_redpacket_id)
        app.globalData.currentCouponIds = couponIds

        let courierTimes;
        if (checkoutItems.arrive_time_tips.length > 0) {
          courierTimes = [checkoutItems.arrive_time_tips[0]];
        } else if (checkoutItems.arrive_time_tips_new.length > 0) {
          courierTimes = [checkoutItems.arrive_time_tips_new[0].arrive_time_text];
        }

        if (checkoutItems.vip_card) {

          const cardList = checkoutItems.vip_card.card_list;
          if (cardList && cardList.length > 0) {

            for (let index = 0; index < cardList.length; index++) {
              const element = cardList[index];
              const cardDoc = element.card_doc;
              if (cardDoc.indexOf('#_$') != -1) {
                const cardDocTextArray = cardDoc.split('#_$');
                element.cardDocTextArray = cardDocTextArray;
              }
            }
          }

          if (checkoutItems.vip_card.back_cash_text) {
            if (checkoutItems.vip_card.back_cash_text.indexOf('#_$') != -1) {
              const backCashTextArray = checkoutItems.vip_card.back_cash_text.split('#_$');
              checkoutItems.vip_card.backCashTextArray = backCashTextArray;
            }
          }
        }

        that.setData({
          currentCouponIds: couponIds,
          checkoutItems: checkoutItems,
          courierTimes: [courierTimes, ''],
          orderCount,
          vipCardInfo: checkoutItems.vip_card,
        })
        that.getCourierTime(checkoutItems)
        if (checkoutItems.failed) {
          storageManager.setInactiveOrderItemList(checkoutItems.failed)
          that.setData({
            noActiveProductList: checkoutItems.failed
          })
          if (checkoutItems.failed.length > 0) {
            thirdApi.showModal('优鲜提醒', '哎呀，部分商品已失效，请确认您的订单', false, '知道了')
          }
        } else {
          storageManager.setInactiveOrderItemList('')
        }
        that.setData({
          isLoad: true
        })
      }, function (res) {
        thirdApi.hideLoading();
      });
    } else {

    }


  },

  onReady: function () {
    this.setTitle()
  },
  getOrderCount(orders) {
    let count = 0
    if (orders && orders.length) {
      for (let i = 0; i < orders.length; i++) {
        let orderItem = orders[i]
        count += orderItem.quantity
      }
    }
    return count
  },
  openOrderList(event) {
    console.log(event)
    let activeItems = storageManager.getCheckoutActiveCartItems()
    storageManager.setActiveOrderItemList(activeItems)
    appInteriorSkip.navigateToOrderItemList({ from: 'checkout' })
  },
  onListScroll(event) {
    let detail = event.detail;

    if (detail.column == 0) {
      if (detail.value == 0) {
        this.setData({
          courierTimes: [this.data.firstArray, this.data.todayArray]
        })
      } else {
        this.setData({
          courierTimes: [this.data.firstArray, this.data.tomorrowArray]
        })
      }
    } else {

    }
  },
  onVipCardSelect(event) {
    const dataset = event.currentTarget.dataset;
    const cardList = this.data.vipCardInfo.card_list;

    for (let index = 0; index < cardList.length; index++) {
      const element = cardList[index];
      if (index === dataset.index) {
        element.is_default = !element.is_default;
        if (element.is_default || element.is_default == 1) {
          this.setData({
            selectVipCardId: element.id,
          })
        }
      } else {
        element.is_default = 0;
      }
    }

    this.setData({
      vipCardInfo: this.data.vipCardInfo,
    })

    requestAna('buy', 'submit_order', {
      path: storageManager.getVipCardSelectID()
    });
    
    this.checkoutPrepare();
  },
  seeOpenCardDetail() {
    appInteriorSkip.navigateToOpenVip();
  }
})