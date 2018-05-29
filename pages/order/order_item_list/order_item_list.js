const storageManager = require('../../../utils/services/storage_manager')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')


Page({
  data: {
    from: '', // 来源页面
    activeOrderList: [], // 有效商品
    inactiveOrderList: [], // 失效商品
  },
  onLoad(options) {
    this.initPage(options)
  },
  initPage(options) {
    let activeOrderList = storageManager.getActiveOrderItemList()
    let inactiveOrderList
    if (options.from == 'checkout') {
      inactiveOrderList = storageManager.getInactiveOrderItemList()
    }
    this.setData({
      activeOrderList,
      inactiveOrderList,
      from: options.from,
    })
  },
  onUnload() {},
  onShow() {
    wx.setNavigationBarTitle({
      title: "商品列表"
    })
  },
  clearInactiveProduct() {
    //将失效商品从内存清除
    let app = getApp();
    let clearOutPage = app.getPageByMethod('clearOut');
    if (clearOutPage.hasOwnProperty('shouldCheckoutProductListOnShow')) {
      clearOutPage.clearOut();
      clearOutPage.shouldCheckoutProductListOnShow();
    }

    this.setData({
      inactiveOrderList: []
    })

    //如果有效商品为0，则返回上个页面
    if (this.data.activeOrderList.length === 0) {
      appInteriorSkip.backPage();
    }
  }
})