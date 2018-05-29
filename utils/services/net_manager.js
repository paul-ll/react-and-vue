const utils = require('../../utils/util');
const thirdApi = require('../services/third_api');
const storageManager = require('../services/storage_manager');
const md5 = require('../../utils/md5');

//这里的地址只可往后追加，不可注释。代码中某些测试逻辑依赖于地址数据索引
const asHostUrl = [
  'https://as-vip.missfresh.cn',
  'https://as-vip-staging.missfresh.net',
  'https://as-vip-staging.missfresh.cn',
  'https://as-vip-test.missfresh.cn',
  'http://172.16.30.143:8081',
  'http://dev01.missfresh.net',
  'http://dev02.missfresh.net',
  'http://dev03.missfresh.net',
  'http://dev04.missfresh.net',
  'http://dev05.missfresh.net',
  'http://dev06.missfresh.net',
  'http://dev07.missfresh.net',
  'http://dev08.missfresh.net',
  'http://dev09.missfresh.net',
  'http://dev10.missfresh.net',
  'http://test01.missfresh.net',
  'http://test02.missfresh.net',
  'http://test03.missfresh.net',
  'http://test04.missfresh.net',
  'http://test05.missfresh.net',
  'http://test06.missfresh.net',
  'http://arch-test01.missfresh.net',
  'http://arch-test02.missfresh.net',
  'http://arch-test03.missfresh.net',
];

const mpsHostUrl = [
  'https://mps.missfresh.cn',
  'https://mps-staging.missfresh.cn',
  'https://mps-pre.missfresh.net',
  'https://as-vip-staging.missfresh.cn',
  'https://as-vip-test.missfresh.cn',
  'http://dev01.missfresh.net',
  'http://dev02.missfresh.net',
  'http://dev03.missfresh.net',
  'http://dev04.missfresh.net',
  'http://dev05.missfresh.net',
  'http://dev06.missfresh.net',
  'http://dev07.missfresh.net',
  'http://dev08.missfresh.net',
  'http://dev09.missfresh.net',
  'http://dev10.missfresh.net',
  'http://test01.missfresh.net',
  'http://test02.missfresh.net',
  'http://test03.missfresh.net',
  'http://test04.missfresh.net',
  'http://test05.missfresh.net',
  'http://test06.missfresh.net',
  'http://arch-test01.missfresh.net',
  'http://arch-test02.missfresh.net',
  'http://arch-test03.missfresh.net',
]

const payHostUrl = [
  'https://pay.missfresh.cn',
  'https://pay-staging.missfresh.net',
  'https://pay-staging.missfresh.cn',
  'https://pay-test.missfresh.cn'
]

const uploadHostUrl = [
  'https://missfresh-asvip-production-common.cn-bj.ufileos.com',
  'https://missfresh-asvip-develop-common.cn-bj.ufileos.com'
]

const downHostUrl = [
  'http://missfresh-asvip-production-common.ufile.ucloud.cn',
  'http://missfresh-asvip-develop-common.ufile.ucloud.cn'
]

function initUrlConfig() {
  const urlConfigArray = storageManager.getUrlConfigArray();

  configs.host = asHostUrl[utils.DEBUG_MODE ? urlConfigArray[0] : 0];
  configs.mryxPayHost = payHostUrl[utils.DEBUG_MODE ? urlConfigArray[1] : 0];
  configs.mpsHost = mpsHostUrl[utils.DEBUG_MODE ? urlConfigArray[2] : 0];
  configs.uploadHost = uploadHostUrl[utils.DEBUG_MODE ? urlConfigArray[3] : 0];
}

//可以在这里更改访问环境
const configs = {

  //这里确保访问的是线上地址，也为了兼容之前的接口，更改索引值可以更换访问环境
  host: asHostUrl[0],
  mryxPayHost: payHostUrl[0],
  mpsHost: mpsHostUrl[0],
  uploadHost: uploadHostUrl[0],
  downHost: downHostUrl[0],
  //服务器存储图片
  imageHost: 'https://j-image.missfresh.cn',

  paths: {
    wxapplogin: '/v1/auth/wxapp-login',
    accesstoken: '/v1/wechat/refresh/',
    categories: '/v2/product/home/index',
    category: '/v3/product/category/',
    cart: '/v1/cart/sync2/',
    addToCart: '/v1/cart/add',
    promotion: '/v3/cart/promotion',
    subscribe: '/web20/product/arrivalremind/subscribe/',
    checkoutPrepare: '/v1/checkout/prepare', // python接口  调用该接口时, 通过后端判断控制最终到底是走v1/还是v2/
    // checkoutPrepare: '/v2/checkout/prepare', // java接口 与app端接口同步
    checkout: '/v1/checkout',
    // checkout:'/v2/checkout/gen/order',
    product: '/v3/product/',
    aboutus: '/v1/h5model/about_us_wx',
    address: '/v1/auth/address/',
    addaddress: '/v1/customer/address/add',
    region: '/v1/address/',
    addresslist: '/v2/address/list',
    defaultaddress: '/v1/customer/address/default/view',
    chromeview: '/v1/product/chrome/view',
    order: '/v1/customer/order/list',
    servicehelp: '/servicehelp_v2',
    orderDetail: '/v1/customer/order/view/',
    orderTrace: '/v1/order/trace/',
    orderVerify: '/v1/order/verify/',
    orderSuccess: '/v1/order/success_paid/',
    orderPrepay: '/v1/order/prepay',
    cancelOrder: '/v1/order/cancel_order/',
    paidCancelOrder: '/v1/order/paid_cancel_order/',
    cxminiStart: '/web20/KOL/cxminiStart/',
    cxminiGuideStart: '/web20/KOL/cxminiGuideStart/', // 新人专享红包领取接口
    cxGetRedPacket: '/web20/KOL/cxGetRedPacket/',
    mryxPay: '/v1/account/balance/pay',
    balance: "/v1/recharge/account/balance",
    search: '/v1/recharge/bill/search',
    info: '/v1/auth/info',
    discountcard: '/exchange/getUserDiscountCard',
    rechargepwd: '/v1/recharge/verify/pay/pwd',
    jwebpromotion: '/v2/product/jweb/promotion',
    questionlist: '/v1/question/list',
    questionanswer: '/v1/question/answer',
    questionoptions: '/v1/question/options',
    voucher: '/v1/customer/voucher/list', // 红包列表页
    vouchers: '/v1/checkout/vouchers', // 红包选择页
    vouchercode: '/v1/customer/voucher/exchange/code', // 兑换红包接口
    newpackage: '/web20/newPackage/sign', //分享红包时生成红包并获取签名
    // redpacketsign: '/v1/red_packet/sign/',
    orderredpacket: '/v1/red_packet/orderRedPack/open_v2', //红包领取
    miniStart: '/web20/system/miniStart/', // 微启动, 返回数据为有时效的信息, 如会员身份等
    openGroup: '/api/redPacket/openGroup', // 红包拼团开团
    showGroup: '/api/redPacketDetail/showGroup',  // 团活动详细信息
    joinGroup: '/api/redPacketJoin/joinGroup',
    showGroupIcon: '/api/floatWindow/show', // 是否在首页展示拼红包入口
    welcomePolite: '/web20/KOL/getInvateInfo',
    activeWelcomePolite: '/v1/red_packet/newUserGiftBag/open_b',//邀请有礼落地页
    activeWelcomePoliteEnter: '/web20/user/vipNewVoucherInvite.do',//邀请有礼落地页领奖
    myFriend: '/web20/user/memberShip/get_invited_list.do',
    welcomeRank: '/web20/KOL/memberShip/rankList',
    openAssist: '/api/freeAssist/openAssist',//发起0元助力
    showAssist: '/api/freeAssistDetail/showAssist',//0元助力详情
    joinAssist: '/api/freeAssistJoin/joinAssist',//好友助力     
    isGoing: '/api/freeAssist/isGoing',//0元助力是否结束
    advertInfo: '/web20/system/advertInfo',//资产弹屏
    refundList: '/refund/item_details/',
    refund: '/refund/refund_table/',
    refundUpload: '/refund/upload_token/',
    progressDetail: '/refund/progress_detail/',
    refundCommit: '/refund/commit',
    advertInfo: '/web20/system/advertInfo',//资产弹屏
    getRegionInfo: '/as/user/getRegionInfo',//根据areaCode获取对应大区
    getRegion: '/as/user/getRegion',
    productShareMain: '/api/productShare/showActivity',//商品分享主页面接口
    productShareOpen: '/api/productShare/openShareGroup',//分享得商品券-开一个新团
    productShareGetShareCode: '/api/productShare/shareCode',//分享得商品券-获取分享码
    productShareSuccess: '/api/productShare/group/share',//分享得商品券-分享成功
    redPackageDetail: '/api/productShare/redDetail',//分享得商品券查询红包信息
    zeropowerFormId: '/api/formId/submit',//拿到0元助力formid
    cashGroup: '/api/cash/showActivity', // 现金红包
    withDraw: '/api/cash/drawMoney', // 现金提现
    listSku: '/as/item/listSku',  // 商品列表
    showMembers: '/api/cash/showMembers', // 更多的用户
    submitFormId: '/api/formId/submit',  // 收集formId
    preShowActivity: '/api/cash/preShowActivity', // 分享得现金活动预处理
    productShareList: '/api/productShare/listActivity',//分享有礼列表页
    newExclusive: '/web20/newuser/newUserExclusivePageV2', //新人专享
    newUserProduct: '/as/item/listSku', //新人专享商品
    getMoreActivityInfo: '/api/redPacket/getMoreActivityInfo', // 更多活动
    packetTips: '/api/redPacket/tips', // tip飘窗接口
    packetShare: '/api/redPacket/group/share', // 分享
    exclusiveBanner: '/api/redPacket/exclusiveBanner',//新人专享页面顶部Banner图
    getTips: '/api/freeAssist/getTips',//0元助力弹窗
    // 砍价相关接口地址
    cutGroupIndex: '/api/cutGroup/index',//砍价商品页
    cutGroupList: '/api/cutGroup/list',//我的砍价商品列表
    cashGroup: '/api/cash/showActivity', // 现金红包
    withDraw: '/api/cash/drawMoney', // 现金提现
    listSku: '/as/item/listSku',  // 商品列表
    showMembers: '/api/cash/showMembers', // 更多的用户
    submitFormId: '/api/formId/submit',  // 收集formId
    preShowActivity: '/api/cash/preShowActivity', // 分享得现金活动预处理
    cutCreat: '/api/cutGroup/create',//砍价-开团
    cutGroup: '/api/cutGroup/cut',//砍价-砍价
    cutCreat:'/api/cutGroup/create',//砍价-开团
    cutGroup:'/api/cutGroup/cut',//砍价-砍价
    searchHotWords: '/v3/product/searchhotwords/',//获取热搜列表
    search: '/search/',//搜索商品
    vipRedPackets:'/as/vip/listRedPacket',//会员红包列表
    getRedPackets:'/as/vip/acquireRedPacket',//领取vip红包
    getMemberPrivileges:'/web20/vipuser/vipinfo',//获取vip特权信息
    openInviteUserVipCard:'/web20/vipcard/openInviteUserVipCard.do',//邀请用户体验vip
    getVipCard:'/web20/vipcard/getInviteUserVipCard.do',//领取会员卡
    vipinfo:'/web20/vipuser/vipinfo',//会员详情
    getInvitationInfo: '/web20/vipcard/inviteUserVipCard.do',//获取邀请好友页面数据
    getOpenVipInfo: '/web20/vipcard/toOpenCard.do',//获取开卡页面数据
    vipCardPrepare: '/v1/vipcard/prepare', // 开卡准备
    vipCardGenOrder: '/v1/vipcard/gen/order', // 开卡生单
    vipCardOrderVerify: '/v1/vipcard/order/verify', // 开卡订单校验
    vipCardOrderPrepay: '/v1/vipcard/order/prepay', // 开卡预支付信息
    immediateExperience:'/as/vip/immediateExperience',//立即体验
    vipproduct:'/web20/vipuser/vipproduct',//会员+货架
    getReSkus: '/as/item/getReSkus',// 千人千面推荐接口@guozhen
  },
  mryxPayPaths: {
    balancepay: '/v1/account/balance/pay',
    mobilecode: '/v1/account/mobile/code',
    verifymobilecode: '/v1/account/verify/mobile/code',
    bindpwd: '/v1/account/bind/pay/pwd',
    mryxPay: '/v1/account/balance/pay'
  },
  app_interior_url: {
    index: '/pages/index/index',
    productdetail: '/pages/products/detail/detail',
    cart: '/pages/cart/cart',
    checkout: '/pages/pay/checkout/checkout',
    finishpay: '/pages/pay/finish/finish',
    myinfo: '/pages/my_info/my_info/my_info',
    aboutus: '/pages/my_info/about_us/about_us',
    balancedetail: '/pages/my_info/my_balance/my_balance',
    discountdetail: '/pages/my_info/discount/discount',
    checkphone: "/pages/my_info/check_phone/check_phone",
    myorder: '/pages/order/my_order/my_order',
    setpasswd: "/pages/my_info/set_passwd/set_passwd",
    orderdetail: "/pages/order/detail/detail",
    myaddress: '/pages/address/my_address/my_address',
    editaddress: '/pages/address/edit_address/edit_address',
    locatoraddress: "/pages/address/locator_address/locator_address",
    distributioncity: "/pages/address/distribution_city/distribution_city",
    webpromotion: "/pages/active_page/web_promotion/web_promotion",
    myredpackagelist: '/pages/my_info/my_redpackage/redpackage_list/redpackage_list',
    activeinstruction: '/pages/my_info/my_redpackage/active_instruction/active_instruction',
    groupscan: '/pages/active_page/group_scan/group_scan',
    ordercoupon: '/pages/order/order_coupon/order_coupon',
    ordercouponshare: '/pages/order/order_coupon_share/order_coupon_share',
    groupscan: '/pages/active_page/group_scan/group_scan',
    orderitemlist: '/pages/order/order_item_list/order_item_list',
    orderlistinfo: '/pages/order/order_list_info/order_list_info',
    groupredpacket: '/pages/group_red_packet/group_red_packet',
    welcomePolite: '/pages/welcomePolite/welcomePolite',
    myFriend: '/pages/welcomePolite/myFriend/myFriend',
    activewelcomepolite: '/pages/active_page/welcome_polite/welcome_polite',//邀请有礼落地页ui
    welcomeRule: '/pages/welcomePolite/welcomeRule/welcomeRule',
    welcomeRank: '/pages/welcomePolite/welcomeRank/welcomeRank',
    orderRedPackage: '/pages/order/order_red_package/order_red_package',
    zeropower: '/pages/active_page/zero_power/zero_power',
    refundList: '/pages/order/refund_list/refund_list',
    refund: '/pages/order/refund/refund',
    refundProgress: '/pages/order/refund_process/refund_process',
    productshare: '/pages/active_page/product_share/product_share',
    webPage: '/pages/active_page/web_page/web_page',
    urlConfig: '/pages/my_info/url_config/url_config',
    cashPacket: '/pages/active_page/cash_red_packet/cash_red_packet',
    productShareList: '/pages/active_page/product_share/list/list',
    newExclusive: '/pages/active_page/new_exclusive/new_exclusive',
    groupredpacketv2: '/pages/active_page/group_red_packet_v2/group_red_packet_v2',
    // 砍价相关页面地址
    bargainGoods: '/pages/active_page/bargain/bargain_goods/bargain_goods',
    bargainDetail: '/pages/active_page/bargain/bargain_detail/bargain_detail',
    cashPacket: '/pages/active_page/cash_red_packet/cash_red_packet',
    search: '/pages/search/search',
    memberPackets:"/pages/vip/red_packets/red_packets",
    memberPrivileges:"/pages/vip/member_privileges/member_privileges",
    openInviteUserVipCard:"/pages/vip/enjoy_service/enjoy_service",
    inviteFriendVip: '/pages/vip/invite_friend/invite_friend',
    openVip: '/pages/vip/open_vip/open_vip',
    vipInstruction: '/pages/vip/open_vip/vip_instruction/vip_instruction',
    vip:'/pages/vip/my_vip/my_vip'
  },
  third_api: {
    code2session: 'https://api.weixin.qq.com/sns/jscode2session',
    qqtextsearch: 'https://apis.map.qq.com/ws/place/v1/suggestion',
    geolocation: 'https://apis.map.qq.com/ws/place/v1/search'
  },
  third_config: {
    qq_map: {
      key: 'IBKBZ-EWKH4-AZZUL-DAOBQ-HBWP2-JJFD7'
    }
  }
}

function getAddressHeader() {
  let latLngInfo = new Object()
  let that = getApp();

  //如果getApp()还获取不到值，则返回一个空的header
  if (!that) {
    return {}
  }

  //0:定位，1:显示默认地址，2:显示选择地址 3:收获地址
  let tmp = that.globalData.currentAddressInfo.stationCode == null ? '' : that.globalData.currentAddressInfo.stationCode
  let stationCode = '"station_code":"' + tmp + '"'

  let address_code = that.globalData.currentAddressInfo.address_code;
  let addressCode = '"address_code":' + (address_code === undefined ? '""' : (address_code))
  let addressInfo = '{' + stationCode + ',' + addressCode + '}'
  utils.logi('--------------------------------addressInfo=', addressInfo)
  latLngInfo = {
    lat: that.globalData.currentAddressInfo.lat,
    lng: that.globalData.currentAddressInfo.lng
  }
  const header = {
    'x-region': addressInfo,
    'platform': 'weixin_app'
  }
  return {
    header: header,
    data: latLngInfo
  }
}

/**
 * 发起网络请求
 * @param url
 * @param method
 * @param data
 * @param header
 * @returns {*}
 */
function genPromise(url, method = 'GET', data = {}, header = getAddressHeader().header) {
  return new Promise((resolve, reject) => {
    var app = getApp()

    utils.logTimeTag("-- genPromise 请求开始 --");

    const requestBody = {
      url: url,
      header: header,
      success: function (res) {
        utils.logTimeTag("-- genPromise 请求成功 --");

        let code = res.data.code;
        let statusCode = res.statusCode;


        if (statusCode == 200 && code != 102) {
          utils.logi('网络正常访问结束');
          resolve(res)
        } else if (code == 102 || statusCode == 403 || statusCode == 401) {
          //重新走登录流程
          utils.logi('重走登录流程开始');
          login(function (res) {
            utils.logi('重走登录流程结束');
            //需要刷新url参数中的token，否则还是过期的
            requestBody.url = replaceToken(requestBody.url);
            thirdApi.wxRequest(requestBody);
          }, function (res) {
            reject("Token过期，自动重新登录失败");
            utils.logi('Token过期，自动重新登录失败');
          })
        } else {
          reject("网络遇到故障，statusCode = " + statusCode);
        }
      },
      fail: function (res) {
        utils.logTimeTag("-- genPromise 请求失败 --");
        reject(res)
      },
      method: method,
      data: data,
      dataType: 'json'
    };

    thirdApi.wxRequest(requestBody);
  })
}

function uploadFile(url, filePath, formData, headers) {
  return new Promise((resolve, reject) => {
    const uploadBody = {
      url: url,
      filePath: filePath,
      name: 'file',
      formData: formData,
      header: headers,
      success: function (res) {
        resolve(res)
      },
      fail: function (res) {
        reject(res)
      },
    }
    thirdApi.wxUploadFile(uploadBody)
  })
}

/**
 * 用于将已经生成的URL中的过期token替换为新的token
 * @param {*被替换的url} url
 */
function replaceToken(url) {
  let app = getApp();
  let access_token = encodeURIComponent(app.globalData.wxappLogin && app.globalData.wxappLogin.access_token != undefined ? app.globalData.wxappLogin.access_token : '')
  let newUrl = url.replace(/access_token[^&]*/, 'access_token=' + access_token);
  return newUrl;
}

/**
 * 
 * @param {*} cb 成功回调
 * @param {*} failCb 网络请求失败回调
 * @param {*} authorizationFailCb 微信授权失败回调
 */
function login(cb, failCb, authorizationFailCb) {
  const app = getApp();
  let loginData;
  let wxLoginRes;
  const that = this;
  //微信登陆，获取微信信息，as登陆,三个异步过程必须依次调用，后面的异步过程需等待前面的完成才能调用
  utils.logTimeTag("-- wxapp_login 请求开始--");
  thirdApi.wxApi('login').then(function (res) {
      utils.logTimeTag("-- wxapp_login 请求成功 --");
      utils.logi("App.wxApi.res", res);
      wxLoginRes = res

      if (res.errMsg === "login:ok") {
          utils.logTimeTag("-- wxapp_getUserInfo 请求开始 --");
          return thirdApi.wxApi('getUserInfo');
      }
  }, function () {
      if (authorizationFailCb) { authorizationFailCb(); }
  }).then(function (res) {
      utils.logTimeTag("-- wxapp_getUserInfo 请求成功 --");
      const wxGetUserInfoRes = res
      app.globalData.userInfo = wxGetUserInfoRes.userInfo
      app.globalData.hasUserInfoRight = true
      utils.logi("App.getUserInfo.res", res)
      loginData = {
          code: wxLoginRes.code,
          language: wxGetUserInfoRes.userInfo.language,
          encrypted_data: wxGetUserInfoRes.encryptedData,
          signature: wxGetUserInfoRes.signature,
          iv: wxGetUserInfoRes.iv
      }
      utils.logi("loginData", loginData)

      utils.logTimeTag("-- 获取用户信息 请求开始 --");
      return wxappLogin(loginData);
  }, function () {

      if (utils.DEBUG_MODE) {
          //FIXME 如果调用失败，需要检测用户是否已经授权，如无授权，则提示用户授权
          callCurrentPageShowAuth({
              callObj: this,
              cb: cb,
              failCb: failCb,
              authorizationFailCb: authorizationFailCb
          });
      } else
      //以下方式将逐渐过渡
      if (authorizationFailCb) { authorizationFailCb(); }
  }).then(function (res) {
      if (!res) return
      if (res.statusCode != 200) {
          if (failCb) {
              failCb(res)
          }
          return
      }
      utils.logTimeTag("-- 获取用户信息 请求成功 上 --");

      // app.globalData.timer = time
      // 请求成功不会返回code值, 用户异常时会返回不为0的code码, 此时弹出弹窗告知用户 (code: 601为垃圾用户)
      if (res.data.code && res.data.code != 0) {
          wx.showModal({
              content: res.data.msg
          })
          return
      }
      utils.logi("app wxappLogin", res)
      const wxappLoginResData = res.data
      app.globalData.wxappLogin = wxappLoginResData;
      app.globalData.wxappLogin.wxLoginRes = wxLoginRes.code;

  //序列号存储
  storageManager.setWXLoginKey(wxappLoginResData);

  utils.logTimeTag("-- 获取用户信息 请求成功 下 --");

  typeof cb == "function" && cb(app.globalData.wxappLogin)
}, function (res) {
  utils.logi('--- 网络请求超时 ---');
  if (failCb) {
    failCb(res)
  }
})
}

function mountAuthInitData() {
  const pagesArray = getCurrentPages();
  const currentPage = pagesArray[pagesArray.length - 1];
  currentPage.data.showAuthView = false;
}

function callCurrentPageShowAuth(callObj) {
  const pagesArray = getCurrentPages();
  const currentPage = pagesArray[pagesArray.length - 1];
  currentPage.setData({
    showAuthView: true,
  })

  const app = getApp();
  // 授权完成之后继续执行登录操作的动作
  currentPage.getUserInfo = function (event) {
    app.globalData.authInfo = event.detail;

    this.setData({
      showAuthView: false,
      showNoAddressRules: false
    })

    login(callObj.cb, callObj.failCb, callObj.authorizationFailCb);
  }
}

/**
 * 构建基本的请求对象，最常用的入口
 * @param {*} key 
 * @param {*} dataList 
 * @param {*} host 
 */
function buildRequestObj(key, dataList = {}, host) {
  return getRequestUrlByRequestObj({
    key, dataList, host
  })
}

/**
 * 通过Mps环境访问
 * @param {*} key 
 * @param {*} dataList 
 * @param {*} host 
 */
function getRequestUrlWithMps(key, dataList = {}, host) {
  return getRequestUrlByRequestObj({
    key, dataList, host, isMps: true
  })
}

/**
 * 对于之前的请求参数过多的情况做参数重构，使用建造者模式，新的主要入口
 * @param {*} requestParams 
 */
function getRequestUrlByRequestObj(requestParams) {
  return baseGetRequestUrlFunc(requestParams);
}

/**
 * 获取MRYX后端服务器url，这个是老接口，用于兼容之前的请求入口
 * @param key [后端接口对应标识]
 * @param extras [url后拼接的参数值]
 * @param isExitQs [是否存在请求参数]
 * @param dataList [参数list]
 * @returns {string} [最终请求url]
 */
function getRequestUrl(key, extras = '', isExitQs = 1, dataList = {}, isMps = false) {
  //这个方法承接之前的访问模式，这个方法的弊端在于，如果只需要后面的参数，则需要提供中间的参数，并且需要注意书写顺序
  return baseGetRequestUrlFunc({
    key, extras, isExitQs, dataList, isMps
  });
}

/**
 * 基础的Url构造方法
 * @param {*} baseRequestObj 
 */
function baseGetRequestUrlFunc(baseRequestObj) {
  let queryParams = ""
  const app = getApp()

  //构造请求参数
  let access_token = encodeURIComponent(app.globalData.wxappLogin && app.globalData.wxappLogin.access_token != undefined ? app.globalData.wxappLogin.access_token : '')
  let model = encodeURIComponent(wx.getSystemInfoSync().model)
  queryParams = queryParams + "?access_token=" + access_token + "&env=weixin_app&platform=weixin_app&device_id=" + app.globalData.uuid + "&version=3.8.0.3&model=" + model
  for (let key in baseRequestObj.dataList) {
    queryParams = queryParams + '&' + key + '=' + baseRequestObj.dataList[key]
  }

  //添加来源
  const fromSource = app.globalData.fromSource
  if (fromSource && fromSource != '' && fromSource != null && queryParams != '') {
    queryParams += "&fromSource=" + fromSource
  }

  //确认Host
  let host = configs.host;

  //mps接口依旧按照之前的用法
  if (baseRequestObj.isMps) {
    host = configs.mpsHost;
  }

  //优先兼容mps,如果关闭调试，则自动忽略自定义Host，防止上线时地址没有切换完全
  if (baseRequestObj.host && utils.DEBUG_MODE) {
    host = baseRequestObj.host;
  }

  const url = host + configs.paths[baseRequestObj.key] + (baseRequestObj.extras ? baseRequestObj.extras : '') + queryParams;
  return url
}


function wxappLogin(loginData) {
  const url = getRequestUrl('wxapplogin', '', 0, loginData)
  return genPromise(url, 'POST', loginData);
}

//对参数进行加密，返回时间戳以及加密后的字串
function mix(params) {
  let timeStr = new Date().getTime();

  timeStr /= 1000;

  timeStr = Math.round(timeStr);

  let newStr = JSON.stringify(params) + timeStr + '55d85b3f4806043f84356de9e510375a';
  let md5Str = md5.hexMD5(newStr);
  let subStr = md5Str.substr(11, 16);

  return {
    time: timeStr,
    sign: subStr
  }
}


module.exports = {
  getAddressHeader,
  genPromise,
  login,
  getRequestUrl,
  wxappLogin,
  configs,
  replaceToken,
  uploadFile,
  mix,
  //构建请求对象方法
  buildRequestObj,

  // ============== 请求主机数组 ==============
  asHostUrl,
  mpsHostUrl,
  payHostUrl,
  uploadHostUrl,
  // ============== 请求主机数组 ==============

  initUrlConfig,
  downHostUrl,
  getRequestUrlWithMps,
  mountAuthInitData,
}