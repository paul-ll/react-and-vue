const app = getApp()
const requestAna = require('../../../../utils/service_utils.js').requestAna
const appInteriorSkip = require('../../../../utils/services/app_interior_skip.js')
const cartService = require('../../../../utils/services/cart.js')
const redPacketService = require('../../../../utils/services/my_redpackage.js')
const thirdApi = require('../../../../utils/services/third_api.js')

Page({
  data: {
    resData: null, // 整个数据
    // redpacketId: -1, // 当前选中红包id
    currentCouponIds: null,
    voucherList: [], // 红包列表数据
    discountCode: '', // 兑换码
    products: [],
    fromMyInfo: true, // 是否从填单页跳转过来的
    voucherType: '', // 展示红包还是券  packet[红包]/product[商品券]/mj[满减券]
    pageType: '', // 页面类型  packet[红包]/product[商品券]/mj[满减券]
    isInactiveList: false, // 是否是失效列表
    isLoad: false, // 是否加载完毕
    modalOptions: {
      title: '优鲜提醒',
      content: '兑换成功!',
      // leftBtnText: '取消',
      rightBtnText: '确定',
    },
    isShowModal: false,
    from: '', // 是从购物车.填单页来的
    //分页信息
    pages: 0,//总共的页数
    currentPageIndex: 0,//当前所在的页码
    lastPageQueryParams: {},
    address_id:''//地址id,用于风控原来没传此参数
  },
  onLoad(data) {

    this.setData({
      lastPageQueryParams: data,
    })

    if (data.voucherType) {
      this.setPageType(data.voucherType)
      this.setData({
        voucherType: data.voucherType
      })
    }
    // 如果从填单页，或购物车页进入此页面时, 走if, 否则走else
    if (data.needProducts === true || data.needProducts === 'true') {
      let products = app.globalData.productFromCartInfos
      let activeItemsChecked = app.globalData.activeCartChecked
      let checkedItems = []
      for (let sku in products) {
        if (activeItemsChecked[sku]) {
          checkedItems.push({
            sku: products[sku].sku,
            quantity: products[sku].quantity
          })
        }
      }
      this.setData({
        address_id:data.address_id,
        products: checkedItems,
        fromMyInfo: false,
        currentCouponIds: app.globalData.currentCouponIds,
        from: data.from
      })
      this.getVoucherList()
    } else {
      this.getMyRedpackageData()
    }
    // 生成toast组件实例, 需在wxml页面首先引入相应的template
    new app.globalData.WeToast()
  },
  onShow() {
    if (this.data.fromMyInfo) {
      switch (this.data.voucherType) {
        case 'packet':
          requestAna('click_red_package', 'individual_center')
          break
        case 'product':
          requestAna('view_coupon', 'n_individual_center')
          break
      }
    }
  },
  //获取红包列表信息
  getMyRedpackageData() {
    //当已经到达底部，则不再请求
    if (this.data.currentPageIndex != 0 && this.data.currentPageIndex >= this.data.pages) {
      return;
    }

    let queryType = this.data.voucherType;
    // 当从"我的"页面进入时调用该接口, 展示用户全部红包

    if (this.data.currentPageIndex == 0) {
      this.setData({
        isLoad: false
      })
    }

    let that = this;
    let pageInfo = {
      page: that.data.currentPageIndex,
      page_size: 10,
      voucher_type: queryType
    }

    // thirdApi.showToast('正在加载...', 'loading', 10000)
    redPacketService.getMyRedpackge(pageInfo).then(res => {
      let resData = res.data
      let results = this.calcuPriceLength(resData.results || [])
      // thirdApi.hideToast()

      let voucherList = this.data.voucherList;

      voucherList = voucherList.concat(results);

      this.setData({
        resData: resData,
        voucherList,
        isLoad: true,
        pages: resData.pages,
        currentPageIndex: resData.page_no + 1,
      })
    })
  },
  getVoucherList() {
    let queryType = this.getQueryType(this.data.voucherType)
    // 当从填单页进入该页面时调用此接口, 后端会根据商品类型来计算可用红包并返回数据
    this.setData({
      isLoad: false
    })
    thirdApi.showToast('正在加载...', 'loading', 10000)
    redPacketService.getVoucherList({ products: this.data.products, queryType, from: this.data.from }).then(res => {
      // console.log(res)
      let results = this.calcuPriceLength(res.data.results || [])
      thirdApi.hideToast()
      this.setData({
        resData: res.data,
        voucherList: results,
        isLoad: true
      })
    })
  },
  changeCode(event) {
    // 输入兑换码的时候执行的函数, 主要作用是实现双向数据同步
    let val = event.detail.value
    this.setData({
      discountCode: val
    })
  },
  confirm() {
    this.setData({
      isShowModal: false
    })
    this.getMyRedpackageData()
  },
  exchangeCode(event) {
    const that = this
    // 兑换红包
    let discountCode = this.data.discountCode
    if (!discountCode.length) {
      this.wetoast.toast({ title: '兑换码不能为空', duration: 2000 })
      return
    }
    let voucherType = this.data.voucherType
    redPacketService.exchangeCode({ discountCode, voucherType }).then(res => {
      console.log(res)
      if (res.statusCode == 200 && res.data.code == 0) {
        this.clearInput()
        this.setData({
          isShowModal: true
        })
      } else {
        if (res.msg || res.data.msg) {
          this.wetoast.toast({ title: res.msg || res.data.msg, duration: 2000 })
        }
      }
    }, err => {
      if (err.msg || err.data.msg) {
        this.wetoast.toast({ title: err.msg || err.data.msg, duration: 2000 })
      }
    })
  },
  clearInput() {
    // 清空兑换券的input
    this.setData({
      discountCode: ''
    })
  },
  getVoucherList () {
    let queryType = this.getQueryType(this.data.voucherType)
    // 当从填单页进入该页面时调用此接口, 后端会根据商品类型来计算可用红包并返回数据
    this.setData({
      isLoad: false
    })
    thirdApi.showToast('正在加载...', 'loading', 10000)    
    redPacketService.getVoucherList({ products: this.data.products, queryType, from: this.data.from ,address_id: this.data.address_id}).then(res => {
      // console.log(res)
      let results = this.calcuPriceLength(res.data.results || [])
      thirdApi.hideToast()
      this.setData({
        resData: res.data,
        voucherList: results,
        isLoad: true
      })
    })
  },
  // goToInstruction () {
  //   // 跳转到优惠说明页
  //   appInteriorSkip.navigateToActiveInstruction()
  // },
  changeVoucher (event) {
    // 只在从填单页跳转进来的时候生效, 切换红包时候讲红包的id带回给checkout页面 status == 3 时, 不可选
    let status = event.currentTarget.dataset.status
    let productSku = event.currentTarget.dataset.productSku
    if (this.data.fromMyInfo || status != 0) {
      return
    }
    let voucherType = event.currentTarget.dataset.voucherType
    let voucherId = event.currentTarget.dataset.voucherId
    if (voucherType == 'packet') {
      app.globalData.currentCouponIds[2] = Number(voucherId)
      wx.navigateBack()
    } else if (voucherType == 'product') {
      app.globalData.currentCouponIds[1] = Number(voucherId)
      this.addProductToCart(productSku)
    }
    // 不可使用redirectTo跳转到一级页面
    // switchTab不可带参数
  },
  addProductToCart(sku) {
    let products = app.globalData.productFromCartInfos
    let activeItemsChecked = app.globalData.activeCartChecked
    if (products[sku] && products[sku].quantity > 0) {
      activeItemsChecked[sku] = true
      wx.navigateBack()
    } else {
      let productItem = {
        sku,
        quantity: 1
      }
      let productsList = [productItem]
      // products[sku] = productItem
      // activeItemsChecked[sku] = true      
      cartService.addToCarts(productsList, 1).then(res => {
        if (res.data.out_of_limit || res.data.out_of_limit === '') {
          delete res.data.out_of_limit
        }
        for (let sku in res.data) {
          app.globalData.productFromCartInfos[sku] = {
            quantity: res.data[sku],
            isActive: 1,
            sku: sku
          }
          let activeItemsChecked = app.globalData.activeCartChecked
          activeItemsChecked[sku] = true
        }
        wx.navigateBack()
      })
    }
  },
  calcuPriceLength(results) {
    // 根据价格计算价格最终显示的长度, 将长度数据填入数据结构中
    let len = results.length
    let priceLength = 0
    for (let i = 0; i < len; i++) {
      let result = results[i]
      if (result.preferential_price && result.preferential_price / 100) {
        priceLength = (result.preferential_price / 100 + '').length
      }
      result.priceLength = priceLength
    }
    return results
  },
  getQueryType(voucherType) {
    let queryType
    switch (voucherType) {
      // 不同券对用的请求参数不同
      case 'product':
        queryType = 1
        break
      case 'mj':
        queryType = 2
        break
      case 'packet':
        queryType = 3
        break
      default:
        break
    }
    return queryType
  },
  setPageType(voucherType) {
    let pageType
    switch (voucherType) {
      // 页面展示不同类型的券
      case 'product':
        pageType = '商品券'
        break
      case 'mj':
        pageType = '满减券'
        break
      case 'packet':
        pageType = '红包'
        break
      default:
        break
    }
    this.setData({
      pageType
    })
    wx.setNavigationBarTitle({
      title: pageType
    })
  },
  goToProductDetail(event) {
    let productSku = event.currentTarget.dataset.productSku
    appInteriorSkip.productDetail({ productSku })
  },
  //触底
  onReachBottom() {
    //从填单页进来的还保持原来的逻辑，不做分页
    if (this.data.lastPageQueryParams.needProducts === true || this.data.lastPageQueryParams.needProducts === 'true') {
      return;
    }
    this.getMyRedpackageData();
  }
})