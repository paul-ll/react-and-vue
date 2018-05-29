const {getInvitationInfo} = require("../../../utils/services/vip.js")
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const utils = require('../../../utils/util.js')
const {requestAna} = require('../../../utils/service_utils.js')

Page({
  data: {
    // 没有授权信息、地址
    showNoAddressRules: false,
    // 没有网络
    network: {
      noNetwork: false
    },
    isOnSharing: false,
    isBGImgLoaded: false,
    // 页面加载中
    loading: true,
    // 接口请求出错页面
    nodata: {
      noData: false,
      imgUrl: '/images/net_nodata.png',
      noDataText: '加载失败了，请稍后重试～'
    }
  },
  onLoad: function(options) {
    new app.globalData.WeToast()
    // 获取来源
    if (options.scene) {
      app.globalData.fromSource = options.scene
    }

    this.initPage()
  },
  onReady: function() {
  },
  onShow: function() {
    // 如果是因为分享引起的页面隐藏-显示
    if (this.data.isOnSharing) {
      this.data.isOnSharing = false
      return
    }
    // 进入页面 埋点
    requestAna('get_into_invitation', 'member_invitation', {
      "user_type": 3
    }) 
  },
  onHide: function() {
  },
  onUnload: function() {
  },
  onPullDownRefresh: function() {
  },
  onReachBottom: function() {
  },
  onShareAppMessage: function () {
    this.data.isOnSharing = true
    
    const {title, image_url, miniPath} = this.data.share_info
    return {
      title,
      imageUrl: image_url,
      path: miniPath
    }
  },
  onPageScroll: function() {
  },
  initPage () {
    this.setData({loading: true})
    
    const {wxappLogin, currentAddressInfo} = app.globalData
    if (wxappLogin && !utils.gIsEmptyObject(currentAddressInfo)) {
      this.getInvitedInfo()
      return
    }
    app.getUserInfo(() => {
      app.getAddressInfoV2(() => {
        this.getInvitedInfo()
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
  // 获取邀请信息
  getInvitedInfo () {
    getInvitationInfo().then((res) => {
      console.log("邀请好友页面数据：", res)

      const resData = res.data
      if (resData.code === 0) {
        const {card_img, invite_doc, can_invite_total, can_invite, invite_num, my_invites} = resData
        this.data.share_info = resData.share_info
        this.setData({card_img, invite_doc, can_invite_total, can_invite, invite_num, my_invites})
        this.setHaveData()
      } else {
        // 错误的响应代码
        this.setNoData()
      }
    }, (err) => {
      this.setNoNetwork()
    })
  },
  onBGImgLoaded (evt) {
    this.data.isBGImgLoaded = true
    this.setHaveData()
  },
  onBGImgLoadError (evt) {
    this.data.isBGImgLoaded = true
    this.setHaveData()
  },
  onInviteBtnTap (evt) {
    const {type} = evt.currentTarget.dataset
    if (type == 1) {
      // 点击待邀请按钮 埋点
      requestAna('stay_invitation', 'member_invitation', {
        "user_type": 3
      }) 
    } else if (type == 2) {
      // 点击邀请好友体验按钮 埋点
      requestAna('invitation_experience', 'member_invitation', {
        "user_type": 3
      }) 
    }
  },
  // 重新授权回调
  haveRule: function () {
    this.setData({ showNoAddressRules: false })
    this.initPage();
  },
  setHaveData () {
    // 等背景图加载出来之后 再隐藏loading
    this.setData({ loading: !this.data.isBGImgLoaded, 'nodata.noData': false })
  },
  setNoData () {
    this.setData({ loading: false, 'nodata.noData': true })
  },
  // 无网络
  setNoNetwork () {
    this.setData({
      loading: false,
      'network.noNetwork': true
    })
  },
  // 没有权限
  setNoRule () {
    this.setData({
      loading: false,
      showNoAddressRules: true
    })
  },
  // 无网络-重新连接
  reconnect() {
    this.setData({ 'network.noNetwork': false })
    this.initPage()
  }
})