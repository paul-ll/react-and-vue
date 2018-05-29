const app = getApp()
const utils = require('../../../../utils/util.js')
const {requestAna} = require('../../../../utils/service_utils.js')
const compressImageUtils = require('../../../../utils/services/compress_image_utils.js')
const bargainService = require("../../../../utils/services/bargain.js")
const thirdApi = require('../../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../../utils/services/app_interior_skip.js')

//index.js
Page({
  data: {
    options:'',
    showNoAddressRules: false, //是否显示无地址权限页面
    // 没有网络
    network: {
      noNetwork: false,
    },
    // 分享信息
    shareInfo: null,
    coverView: false, //判断弹窗是否出现 活动规则弹窗
    insuranceView:false,//保险弹窗
    nodata: {
      noData: false,
      imgUrl: '/images/net_nodata.png',
      noDataText: '加载失败了，请稍后重试～'
    },
    // 是否显示砍价成功弹框
    isDialogShow: false,
    // 砍价成功弹框展示信息
    dialog: {},
    listLength:true,
    // 砍价帮列表
    cutList:[],
    // 用户信息
    userInfo: {},
    // 商品信息
    productInfo: {},
    // 砍价状态信息
    cutInfo: {},
    // 不同状态下的按钮列表
    buttonList: [],
    // 团id
    groupId: '',
    loading: true,

    // 表单id 用于消息推送
    formId: '',
    isFetching: false,
    // 调起分享的位置  0: 右上角  1: 点击中间的主分享按钮 （分享给好友或者喊好友砍一刀按钮）
    sharePos: 0
  },
  countDownEndHandler() {
    utils.logi('倒计时结束，页面刷新');
    this.cutGroup()
  },

  onLoad: function(options) {
    // Do some initialize when page load.
    utils.logi(" ------------------------------bargain.detail.onload------------------------------ ")
    new app.globalData.WeToast()

    // 获取团ID以及分享的群ID
    const {groupId, cutType} = options
    // 1. 点击我的砍价商品进来
    this.data.groupId = groupId
    console.log('当前开团ID-------------groupId', groupId)
    if (options.scene) {
      app.globalData.fromSource = options.scene
    }
    this.setData({
      options: options,
    })

    // link: share表示点击分享链接进入  message表示点击push消息进入
    const {link} = options
    if (link && link == 'share') {
      // 埋点 （好友点击分享链接进入帮砍页面  需要区分是好友还是自己）
      // requestAna("help_index", "help_bargain")
    }

    this.initPage()
  },
  initPage () {
    const {wxappLogin, currentAddressInfo} = app.globalData
    if (wxappLogin && !utils.gIsEmptyObject(currentAddressInfo)) {
      this.cutGroup()
      return
    }
    app.getUserInfo(() => {
      app.getAddressInfoV2(() => {
        this.cutGroup()
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
  // 无网络
  setNoNetwork () {
    this.setData({
      loading: false,
      'network.noNetwork': true
    })
  },
  setNoRule () {
    this.setData({
      loading: false,
      showNoAddressRules: true
    })
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
  reconnect() {
    this.setData({
      loading: true,
      'network.noNetwork': false
    })
    this.initPage()
  },
  onButtonTap (evt) {
    const { type, cutType, index } = evt.currentTarget.dataset
    // 获取表单id
    this.data.formId = evt.detail.formId
    const that = this;
    switch (type) {
      // 直接调cut接口
      case 1:
        that.cutGroup({cutType})
        break;
      // 分享后调cut接口
      case 2:
        if (cutType==2 || cutType==0) {
          // 主分享按钮 （分享给好友多砍一刀cutType 2 喊好友砍一刀按钮cutType 0）
          this.data.sharePos = 1
        }

        // 帮好友砍一刀 cutType 3
        if (cutType == 3) {
          that.cutGroup({cutType})
        }
        break;
      // 分享不调cut接口 (喊好友砍一刀按钮)
      case 3:
        break;
      case 4:
        // 跳转到商品券
        appInteriorSkip.navigateToMyRedpackageList({ voucherType: 'product' })
        break;
      case 5:
        // 重定向活动页
        appInteriorSkip.redirectToBargainGoods();
        break;
      default:
        this.wetoast.toast({
          title: '没有找到对应Type的处理方式，当前的Type为' + type,
          duration: 2000
        })
        break;
    }
  },
  onDialogButtonClick (evt) {
    const {type} = evt.detail
    // 	1:跳转活动页
    if (type == 1) {
      appInteriorSkip.navigateToBargainGoods()
    } else if (type == 2) {
      // 2：回到砍价页(隐藏窗口)
      this.setData({isDialogShow: false})
    }
  },
  // 砍价接口
  cutGroup: function(params = {}) {
    if (this.data.isFetching) return

    const that = this;
    const {groupId} = this.data
    // 0：默认刀, 只查看 1：使用宝刀砍 2：第一次分享成功砍 3：好友帮砍 4：创建第一刀 （后端来控制）
    const queryParams = Object.assign({groupId, cutType: 0}, params)
    this.data.isFetching = true
    bargainService.cutGroup(queryParams).then((res) => {
      const resData = res.data
      console.log(resData,'======================')
      if (resData.code == 0) {
        const {title, shareInfo} = resData.data
        thirdApi.setTitle(title)
        
        let {cutList, productInfo, cutInfo, buttonList,activityInfo,insuranceInfo} = resData.data
        this.data.shareInfo = shareInfo.miniAppShareInfo

        // userinfo
        const {nickName, portrait, advertiseText} = resData.data

        if(cutList.length <= 2){
          this.setData({
            listLength: false
          })
        }

        /**
         * 弹框、吐司显示逻辑
         */
        const {dialog, hintText} = res.data.data
        // 1. 有dialog && hintText: 优先显示 dialog
        // 2. 有dialog 无 hintText: 显示 dialog
        if ((dialog && hintText) || (dialog && !hintText)) {
          this.setData({
            isDialogShow: true,
            dialog:dialog
          })
        } else if (!dialog && hintText) {
          // 3. 无dialog 有 hintText: 显示 toast
          this.wetoast.toast({ title: hintText, duration: 2000 })
        }

        // 使用宝刀砍、分享成功、帮砍成功之后  上传formId
        const {cutType} = queryParams
        if (cutType==1 || cutType==2 || cutType==3) {
          bargainService.uploadFormId(this.data.formId)
        }

        // 埋点 (使用宝刀砍)
        if (cutType == 1) {
          requestAna("again_click", "help_bargain")
        }
        // 埋点 (好友帮砍成功)
        if (cutType == 3) {
          requestAna("help_index", "help_bargain")
        }


        const {userInfo} = this.data
        this.setData({cutList, userInfo: {nickName, portrait, advertiseText}, productInfo, cutInfo, buttonList,activityInfo,insuranceInfo})
        this.setHaveData()
      } else {
        this.resCodeHandler(resData)
      }
      this.requestComplete()
    }, (error) => {
      // 设置无网络
      that.setNoNetwork()
      this.requestComplete()
    })
  },
  onReady: function() {
    // Do something when page ready.
  },
  onShow: function() {
    // Do something when page show.
  },
  lookMore:function(){
    this.setData({
      listLength:false
    })
  },
  lookLess:function(){
    this.setData({
      listLength:true
    })
  },
  onHide: function() {
    // Do something when page hide.
  },
  onUnload: function() {
    // Do something when page close.
  },
  onPullDownRefresh: function() {
    // thirdApi.showToast('载入中...', 'loading', 3000)
    // 没授权信息
    if (this.data.showNoAddressRules) {
      wx.stopPullDownRefresh()
      return
    }
    this.cutGroup()
  },
  onShareAppMessage: function (options) {
    const {miniTitle, miniImgUrl, miniPath, miniDesc} = this.data.shareInfo
    const that = this
    return {
      title: miniTitle,
      path: miniPath,
      imageUrl: miniImgUrl,
      success: function (res) {
        // 如果没分享过  第一次分享砍一刀 （无论分享位置是0或者1）
        if (that.data.cutInfo.shareCount <= 0) {
          that.cutGroup({
            cutType: 2, // 自己分享砍
            wxGroupId: 1 // 分享成功标识 （不是实际的微信群id）
          })
        }

        const {sharePos} = that.data
        if (sharePos == 0) {
          // 埋点 （点击右上角分享）
          requestAna("right_share", "help_bargain")
        } else if (sharePos == 1){
          // 埋点 （点击主分享按钮分享成功）
          requestAna("button_share", "help_bargain", {
            pos: 1
          })
        }
      },
      fail: function(res) {
        that.wetoast.toast({
          title: '分享失败',
          duration: 2000
        })

        const {sharePos} = that.data
        if (sharePos == 1) {
          // 埋点 （点击主分享按钮分享失败）
          requestAna("button_share", "help_bargain", {
            pos: 0
          })
        } 
      },
      complete: function () {
        // 分享位置重置为右上角
        that.data.sharePos = 0
      }
    }
  },
  onPageScroll: function() {
    // Do something when page scroll
  },
  //打开权限
  haveRule: function () {
    let that = this;
    that.setData({
      loading: true,
      showNoAddressRules: false
    })
    that.initPage();
  },
  setHaveData () {
    this.setData({ 'nodata.noData': false })
  },
  requestComplete () {
    this.data.isFetching = false
    this.setData({
      loading: false
    })
    wx.stopPullDownRefresh()
  },
  setNoData () {
    this.setData({
      'network.noNetwork': false,
      'nodata.noData': true
    })
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
  showRule: function () {
    this.setData({
      coverView: true
    })
  },
  insurance:function(){
    this.setData({
      insuranceView: true
    })
  },
  cancelPayBox: function () {
    this.setData({
      coverView: false,
      insuranceView: false,
    })
  },
})