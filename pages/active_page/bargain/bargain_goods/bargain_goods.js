const app = getApp()
const bargainService = require("../../../../utils/services/bargain.js")
const appInteriorSkip = require('../../../../utils/services/app_interior_skip.js')
const thirdApi = require('../../../../utils/services/third_api.js')
const utils = require('../../../../utils/util.js')
const {requestAna} = require('../../../../utils/service_utils.js')
//index.js
Page({
  data: {
    // 滚动消息通知列表
    prizeList: [],
    // 砍价商品列表
    bargainGoodsList: [],
    // 顶部banner列表
    bannerList: [],
    // 我的砍价商品列表
    myBargainGoodsList: [],
    // 分享信息
    shareInfo: {},
    // 是否有宝刀标志
    warningMsg: null,
    // 当前tab页  2:砍价商品  1:我的砍价商品
    currentTab: 2,
    isOnSharing: false,
    // 没有授权信息、地址
    showNoAddressRules: false,
    // 没有网络
    network: {
      noNetwork: false
    },
    loading: true,
    // 没有我的砍价商品
    noMyBargainGoodsData: {
      noData: false,
      imgUrl: '/images/no_my_bargain_goods.png',
      noDataText: '您还没有砍价过哟~',
      hiddenConnect: true
    },
    // 接口请求出错页面
    nodata: {
      noData: false,
      imgUrl: '/images/net_nodata.png',
      noDataText: '加载失败了，请稍后重试～'
    },
    // 我的砍价列表接口参数 （分页）
    queryParams: {
      pageSize: 10,
      page: 1
    },
    // 上拉加载更多
    loadMore: {
      isReachBottom: false,
      noMoreData: false,
      text: '没有更多数据啦~'
    },
    // 是否正在请求数据
    isFetching: false,
    bannerIndex: 1
  },
  onLoad: function(options) {
    new app.globalData.WeToast()
    // 获取来源
    if (options.scene) {
      app.globalData.fromSource = options.scene
    }
  },
  onReady: function() {
    // Do something when page ready.
  },
  onShow: function() {
    // 如果是因为分享导致的页面隐藏  页面再次显示的时候 不刷新
    if (this.data.isOnSharing) {
      this.data.isOnSharing = false
      return
    }

    // 刷新页面
    this.setData({ loading: true })
    this.initPage()
  },
  onHide: function() {
    // 如果是因为分享导致的页面隐藏  页面再次显示的时候 不刷新
    if (this.data.isOnSharing) return

    // 重置数据
    const {currentTab} = this.data
    if (currentTab == 2) {
      this.resetBargainGoodsData()
    } else if (currentTab == 1) {
      this.resetMyBargainGoodsData()
    }
    this.setData({ warningMsg: null })
    this.resetCurrentTab()
  },
  onUnload: function() {
    // Do something when page close.
  },
  onPullDownRefresh: function() {
    // 没授权信息
    if (this.data.showNoAddressRules) {
      wx.stopPullDownRefresh()
      return
    }
    if (this.data.isFetching) return
    thirdApi.showToast('载入中...', 'loading', 3000)
    const {currentTab} = this.data
    if (currentTab == 2) {
      this.initBargainGoodsPage()
    } else if (currentTab == 1) {
      this.initMyBargainGoodsList()
    }
    wx.stopPullDownRefresh()
  },
  onReachBottom: function() {
    // 只有 我的砍价商品列表标签页 有分页
    if (this.data.currentTab == 1) {
      if (this.data.isFetching) return
      // 启动下拉加载动画
      this.setData({ "loadMore.isReachBottom": true})
      this.data.isFetching = true
      const {queryParams} = this.data
      bargainService.getMyBargainGoods(queryParams).then((res) => {
        const resData = res.data
        if (resData.code === 0) {
          let {activityList} = resData.data
          if (!Array.isArray(activityList)) {
            activityList = []
          }
          const {page, pageSize} = queryParams
          // setData设置数据过多会卡顿  每次只设置更新的数据 （不可concat之后一起设置）
          const currentListLen =  (page-1) * pageSize
          activityList.forEach((item, index) => {
            this.setData({
              ["myBargainGoodsList[" + (currentListLen + index) + "]"]: item
            })
          })
          this.updatePage(activityList.length)
          // 如果返回的列表长度小于每页显示大小  说明没有更多数据了。
          const hasMoreData = activityList.length >= pageSize
          if (!hasMoreData) {
            this.setData({
              "loadMore.noMoreData": true
            })
          }
        } else {
          this.resCodeHandler(resData)
        }
        this.data.isFetching = false
      }, (err) => {
        this.requestError()
      })
    }
  },
  initPage () {
    const {wxappLogin, currentAddressInfo} = app.globalData
    if (wxappLogin && !utils.gIsEmptyObject(currentAddressInfo)) {
      this.initPageByTabIndex(Math.abs(this.data.currentTab))
      return
    }
    app.getUserInfo(() => {
      app.getAddressInfoV2(() => {
        this.initPageByTabIndex(Math.abs(this.data.currentTab))
      }, () => {
        // 网络异常
        this.setNoNetwork()
      })
    }, () => {
      // 网络异常
      this.setNoNetwork()
    }, () => {
      // 授权失败
      this.setNoRule()
    })
  },
  // 如果当前获取到的我的商品列表数目大于pageSize 当前页码加1
  updatePage (activityListLen) {
    const {pageSize} = this.data.queryParams
    if (activityListLen >= pageSize) {
      this.data.queryParams.page++
    }
  },
  // 重新授权回调
  haveRule: function () {
    this.setData({
      loading: true,
      showNoAddressRules: false
    })
    this.initPage();
  },
  // 无网络
  setNoNetwork () {
    this.setData({
      loading: false,
      'network.noNetwork': true
    })
    this.resetCurrentTab()
  },
  // 活动结束
  setActivityEnd () {
    this.setData({
      nodata: {
        noData: true,
        imgUrl: '/images/no_my_bargain_goods.png',
        noDataText: '活动已结束',
        hiddenConnect: true
      }
    })
    this.resetCurrentTab()
  },
  // 没有权限
  setNoRule () {
    this.setData({
      loading: false,
      showNoAddressRules: true
    })
    this.resetCurrentTab()
  },
  // 无网络-重新连接
  reconnect() {
    this.setData({
      loading: true,
      'network.noNetwork': false
    })
    this.initPage()
  },
  onShareAppMessage: function (options) {
    this.data.isOnSharing = true
    const {miniTitle, miniImgUrl, miniPath, miniDesc} = this.data.shareInfo
    const that = this
    return {
      title: miniTitle,
      path: miniPath,
      imageUrl: miniImgUrl,
      success: function () {
        // 埋点 (砍价商品、我的砍价页右上角分享)
        requestAna("icon_share", "help_bargain")
      },
      fail: function(res) {
        that.wetoast.toast({ title: '分享失败', duration: 2000 })
      }
    }
  },
  // banner change
  onBannerChange(event) {
    this.setData({ bannerIndex: event.detail.current + 1 })
  },
  onPageScroll: function(evt) {
    // Do something when page scroll
  },
  initBargainGoodsPage () {
    if (this.data.isFetching) return;
    this.data.currentTab = 2
    this.beforeRequestCommon()  
    bargainService.getBargainGoods().then((res) => {
      const resData = res.data
      if (resData.code === 0) {
        const {productList, prizeList, bannerList, warningMsg, title, shareInfo} = resData.data
        this.data.bargainGoodsList = productList
        this.data.bannerList = bannerList
        const {bargainGoodsList} = this.data
        this.data.shareInfo = shareInfo.miniAppShareInfo
        thirdApi.setTitle(title)
        this.setData({bargainGoodsList, prizeList, bannerList, warningMsg})
        this.resetMyBargainGoodsData()
      } else {
        this.resCodeHandler(resData)
      }
      this.requestCompleteCommon()
    }, (err) => {
      this.requestError()
    })
  },
  initMyBargainGoodsList () {
    if (this.data.isFetching) return;
    this.data.queryParams.page = 1
    this.data.currentTab = 1

    this.beforeRequestCommon() 
    const {queryParams} = this.data
    bargainService.getMyBargainGoods(queryParams).then((res) => {
      const resData = res.data
      if (resData.code === 0) {
        let {title, activityList, warningMsg} = resData.data
        thirdApi.setTitle(title)
        if (!Array.isArray(activityList)) {
          activityList = []
        }
        // 更新页码
        this.updatePage(activityList.length)
        const myBargainGoodsList = activityList
        this.setData({myBargainGoodsList, warningMsg, 
          "noMyBargainGoodsData.noData": !myBargainGoodsList.length
        })
        this.setHaveData()

        if (activityList.length >= queryParams.pageSize) {
          this.setData({ "loadMore.noMoreData": false })
        } else {
          this.setData({ "loadMore.noMoreData": true })
        }
        this.setData({ "loadMore.isReachBottom": true })
        this.resetBargainGoodsData()
      } else {
        this.resCodeHandler(resData)
      }
      this.requestCompleteCommon()
    }, (err) => {
      this.requestError()
    })
  },
  resCodeHandler (resData) {
    if (resData.code === 500) {
      this.setNoData()
    } else if (resData.code === 2002) {
      this.setActivityEnd()
    } else {
      this.wetoast.toast({ title: resData.message, duration: 2000 })
    }
  },
  // 请求成功、失败都执行的方法
  requestCompleteCommon() {
    thirdApi.hideToast()
    const {currentTab, myBargainGoodsList} = this.data
    this.setData({
      currentTab,
      loading: false
    })
    this.data.isFetching = false
  },
  // 请求出错：超时、请求地址错误等
  requestError () {
    this.requestCompleteCommon()
    this.setNoNetwork()
  },
  setHaveData () {
    this.setData({ 'nodata.noData': false })
  },
  setNoData () {
    this.setData({ 'nodata.noData': true })
  },
  // 重新加载数据
  noDataAction: function () {
    this.reconnect()
  },
  beforeRequestCommon () {
    this.data.isFetching = true
    this.setData({
      'network.noNetwork': false
    })
  },
  resetCurrentTab () {
    this.setData({currentTab: -this.data.currentTab})
  },
  resetBargainGoodsData () {
    this.setData({
      bargainGoodsList: [],
      bannerList: [],
      prizeList: []
    })
  },
  resetMyBargainGoodsData () {
    this.setData({
      myBargainGoodsList: [],
      "loadMore.isReachBottom": false
    })
  },
  // 商品组件点击处理程序
  onGoodsTap (evt) {
    const {type, groupId, btnName} = evt.detail

    if (type === -1) {
      if (this.data.isFetching) return

      // 点击砍价商品： 调用开团接口
      this.beforeRequestCommon()
      const {formId, sku} = evt.detail
      bargainService.cutCreat({sku}).then((res) => {
        const resData = res.data
        if (resData.code === 0) {
          // 上传一次formID
          bargainService.uploadFormId(formId)
          // 埋点 （开团成功）
          requestAna("start_bargain", "help_bargain")

          const {groupId} = resData.data
          // 开团成功: 跳转到砍价详情页  传过去 团ID (后端会调一次cutGroup)
          appInteriorSkip.navigateToBargainDetail(groupId)
        } else {
          this.resCodeHandler(resData)
        }
        this.requestCompleteCommon()
      }, () => {
        this.requestError()
        this.setNoNetwork()
      })
    } else if (type === 0) {
      // 点击状态为 进行中 的商品 ： 跳转到砍价详情页
      const {groupId} = evt.detail
      appInteriorSkip.navigateToBargainDetail(groupId)
    } else if (type === 1) {
      // 点击状态为 成功 的商品

      // 点击查看商品券按钮
      if (btnName === 'lookUpPrize') {
        appInteriorSkip.navigateToMyRedpackageList({ voucherType: 'product' })
      } else {
        // 点击按钮以外的其它区域
        appInteriorSkip.navigateToBargainDetail(groupId)
      }
    } else if (type === 2) {
      // 点击状态为 失败 的商品
      
      // 点击是再砍一次按钮 切换到砍价商品列表
      if (btnName === 'retry') {
        this.switchToBargainList()
      } else {
        // 点击按钮以外的其它区域
        appInteriorSkip.navigateToBargainDetail(groupId)
      }
    }
  },
  // 点击轮播 banner
  onBannerTap (evt) {
    const {link} = evt.currentTarget.dataset
    appInteriorSkip.navigateToWxAppLink(link)
  },
  //点击切换
  switchTab: function (e) {
    const currentTab = this.data.currentTab
    const targeTab = e.target.dataset.current
    if (currentTab == targeTab || this.data.isFetching) return;
    if (targeTab == 1) {
      // 埋点 (点击我的砍价tab)
      requestAna("tab_click", "help_bargain")
    }

    thirdApi.showToast('载入中...', 'loading', 3000)
    // this.resetCurrentTab()
    this.initPageByTabIndex(targeTab)
  },
  initPageByTabIndex (tabIndex) {
    if (tabIndex == 2) {
      this.initBargainGoodsPage()
    } else if (tabIndex == 1) {
      this.initMyBargainGoodsList()
    }
  },
  switchToBargainList () {
    this.initBargainGoodsPage()
  },
})