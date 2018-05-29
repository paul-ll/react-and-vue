const app = getApp()
const serviceUtils = require('../../../utils/service_utils.js')
const categoryService = require('../../../utils/services/categories.js')
const utils = require('../../../utils/util.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const compressImageUtils = require('../../../utils/services/compress_image_utils.js')
const zero_power = require('../../../utils/services/zero_power.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const netManager = require('../../../utils/services/net_manager');

Page({
  data: {
    isShowDialog: false, //红包弹窗
    isNewUserLog: true, //新人弹窗
    isShowMask: true, //红包弹窗按钮
    isJoin: 0, //是否参与过
    isSponsor: 0, //是否发起者
    isJoinReq:0,//是否参团请求 1:参团，0:开团
    hasCloseBtn: true,
    zpBanner:'https://j-image.missfresh.cn/img_20180402171849567.jpg',
    loading: true,
    coverView: false, //判断弹窗是否出现 活动规则弹窗
    isGoing: 0, //0元助力是否正在进行或结束 
    isOpen: 0, //是否有发起的活动
    shortNum: 5, //还需多少人
    assistCode: '', //活动唯一编号
    status: 1, //状态 1进行中，2已成团，3未成团
    endTime: '', //结束时间
    endTimeText:false,//时间结束文案
    totalNum: 6, //需要参与人数
    freeAssistMember: [], //已经参与的人员
    isNewUser: 0, //是否新用户
    formId: '', //团的formId
    freeAssistCoupon: null, //拼团成功优惠券
    receiveProductCoupon:null,//拼团成功商品券
    userNickName: '', //团长姓名
    userHeadImg:'',
    skuName: '网红青团', //需要领钱sku
    activeFail: false, //活动结束展示
    showNoAddressRules: false, //是否显示无地址权限页面
    newPeople: true,
    productSku: 'p-shcqt240g',
    productDetail: [],
    totalPrice: 0,
    productFromCartInfos: {},
    network: {
      noNetwork: false,
    },
    shareDoc: '',
    shareImgUrl: '',
    nodata: {
      noData: false,
      imgUrl: '',
      noDataText: ''
    },
    haveData: false,
    options: {},
    regionName:"华东专属", //大区专属显示，若全国则不展示
    joinWindowDesc: '',//参团人弹窗文案
    openWindowDesc: '',//开团人弹窗文案
    successNum: 200, //已成功领取人数
    activityRule:null,//活动规则图
    productName:"商品名称", //商品简称
    shortName:"集赞免单", //活动简称
    activityTitle:"成团领商品，参团领红包～", //活动标题
    receiveTitle:"参团即送大红包", //接受者标题
    productTitle:"", //商品标题
    productPic:"", //商品的图片
    productPrice:20, //商品价格
    imageHost:netManager.configs.imageHost,
    hr:'',
    min:'',
    sec:'',
    micro_sec:'',
    ceshi:'1.订单满99元可用\n2.订单满99元可用 ',
    productCouponDesc:"", //商品券描述
    productCouponExpire:"",//商品券过期描述
    scene:'',
    interval:'',//跳转定时器
    joinUser:[],
  },
  initPage() {
    var that = this;
    if (!app.globalData.wxappLogin) {
      app.getUserInfo((wxappLogin) => {
        app.getAddressInfoV2(function () {
          that.isLogin(wxappLogin);
        },(err)=>{
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
        // 设置无网络
        that.setData({
          loading: false,
          haveData: false,
          'network.noNetwork': true,
        })
      }, (err) => {
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
      })
    } else if (app.getReceiveAddressInfo().id) {
      that.isLogin(app.globalData.wxappLogin);
    } else {
      app.getAddressInfo(function () {
        that.isLogin(app.globalData.wxappLogin);
      },false)

    }
  },
  isLogin: function (wxAppLogin) {
    const that = this
    //进入页面埋点
    // requestAna('view_activity', 'activity')
    console.log(wxAppLogin)
    //  已经开团
    let options = that.data.options;
    var param = {}
    if (options.assistCode) {
      param.assistCode = options.assistCode
      
    }
    if (options.formId) {
      param.formId = options.formId;
    }
      if (wxAppLogin) {
        param.accessToken = wxAppLogin.access_token
        param.userNickName = wxAppLogin.nick_name
        param.userHeadImg = wxAppLogin.portrait
      }
      zero_power.showAssist(param).then(function (res) {
        utils.logi(res)
        if (res.data.code == 0) {
          //设置页面title
        if(res.data.data.freeAssist.shortName){
          wx.setNavigationBarTitle({  
            title: res.data.data.freeAssist.shortName,  
          }) 
        }else{
          wx.setNavigationBarTitle({  
            title: '免费试吃',  
          }) 
        }
           //进入埋点
           if(that.data.options.assistCode){
            requestAna('event_show', 'zero_help', {
              inviteCode:res.data.data.freeAssist.assistCode,
              share_to:that.data.options.assistCode,
            })
           }else{
            requestAna('event_show', 'zero_help', {
              inviteCode:res.data.data.freeAssist.assistCode,
              share_to:"",
            })
           }
           //toast
          if(res.data.message){
            that.wetoast.toast({
              title: res.data.message,
              duration: 2000
            })
          }
          that.reloadData(res);
          that.getTips()
          if (res.data.data.isJoinReq == 0 && res.data.data.isGoing == 1 && res.data.data.freeAssist.status == 2) {
            that.wetoast.toast({
              title: '领到商品啦～',
              duration: 2000
            })
          }
          
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
          } else if (res.data.code == 12) {
            that.setData({
              loading: false,
              // haveData: true,
              activeFail: true,
              // 'nodata.noData': false,
            })
          } else {
            that.setData({
              'nodata.imgUrl': '/images/net_nodata.png',
              'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～"
            })
          }
          if(res.data.code != 12){
            that.setData({
              loading: false,
              haveData: false,
              'nodata.noData': true,
            })
          }
          
        }
      }, function (error) {
        // 设置无网络
        that.setData({
          loading: false,
          haveData: false,
          'network.noNetwork': true,
        })
      });  
  },
  getTips:function(){
    var that =this;
    zero_power.getTips().then(function (res) {
      console.log(res)
      if (res.data.code == 0) {
        that.setData({
          joinUser: res.data.data
        })
        setTimeout(function(){
          that.animationAll();
        },2000)
        
      } else{
        if (res.data.message) {
          that.wetoast.toast({
            title: res.data.message
          })
        }
      }
      
    })
  },
  animationAll: function(){
    var that = this;
    
      var device = wx.getSystemInfoSync();
      console.log(device)
      var width = device.windowWidth;
      var height = device.windowHeight;
  
      var scaleW = width / 375;
      var wcaleY = height / 667;
  
      for (var k = 0; k < that.data.joinUser.length; k ++){
        var animation = wx.createAnimation({})
        var item = that.data.joinUser[k];
        animation.translate(100 * scaleW , 0).step({
          duration: 500,
          timingFunction: "ease",
          delay: 1250 * k
        })
        animation.translate(100 * scaleW, -50).step({
          duration: 500,
          timingFunction: "linear",
          delay:750
        })
        animation.translate(100 * scaleW, -180).step({
          duration: 500,
          timingFunction: "step-end",
          delay: 200
        })
        item.animation = animation
      }
     
    that.setData({
      joinUser: that.data.joinUser
    })
  },
  getStationCode: function () {
    return categoryService.getAllCategories()
  },

  onLoad: function (options) {
    new app.globalData.WeToast()
    if (options.scene) {
      this.setData({
        scene: options.scene,
      })
      app.globalData.fromSource = options.scene
    }
   

    this.setData({
      options: options,
    })
    const that = this;
    this.initPage()
  },
  onUnload:function(options){

},
  onReady: function () {

  },
  onHide:function(){
    var that = this;
    that.setData({
      joinUser: []
    })
  },
  onShow: function () {
    var that = this;
    that.setData({
      joinUser: []
    })
    that.getTips()
  },
  // 设置数据
  reloadData: function (res) {
    var that = this;
    let resData = res.data
    
    
    that.setData({
      loading: false,
      haveData: true,
      isJoin: resData.data.userInfo.isJoin,
      isGoing: resData.data.isGoing,
      isOpen: resData.data.userInfo.isOpen,
      shortNum: resData.data.freeAssist.shortNum,
      isNewUser: resData.data.userInfo.isNewUser,
      isSponsor: resData.data.userInfo.isSponsor,
      userNickName: resData.data.userInfo.userNickName,
      userHeadImg:resData.data.userInfo.userHeadImg,
      status: resData.data.freeAssist.status,
      endTime: resData.data.freeAssist.endTime,
      shareDoc: resData.data.share_info.miniAppShareInfo.miniDesc,
      shareImgUrl: resData.data.share_info.miniAppShareInfo.miniImgUrl,
      assistCode: resData.data.freeAssist.assistCode,
      totalNum: resData.data.totalNum,
      freeAssistMember: resData.data.freeAssistMember,
      isJoinReq:resData.data.isJoinReq,
      freeAssistCoupon: resData.data.freeAssistCoupon,
      receiveProductCoupon: resData.data.receiveProductCoupon,//商品券
      zpBanner:resData.data.freeAssist.banner,
      skuName:resData.data.freeAssist.productName,
      productSku:resData.data.freeAssist.sku,
      regionName:resData.data.freeAssist.regionName,
      joinWindowDesc: resData.data.freeAssist.joinWindowDesc,
      openWindowDesc:resData.data.freeAssist.openWindowDesc,
      productCouponDesc:resData.data.freeAssist.productCouponDesc,
      productCouponExpire:resData.data.freeAssist.productCouponExpire,
      successNum: resData.data.freeAssist.successNum,
      activityRule:resData.data.activityRule,//活动规则图
      productName:resData.data.freeAssist.productName,
      shortName:resData.data.freeAssist.shortName,
      activityTitle:resData.data.freeAssist.activityTitle,
      receiveTitle:resData.data.freeAssist.receiveTitle,
      productTitle:resData.data.freeAssist.productTitle,
      productPic:resData.data.freeAssist.productPic,
      productPrice:resData.data.freeAssist.productPrice,
    })

    // 默认头像
    if (that.data.freeAssistMember) {
      for (let i = 0; i < that.data.freeAssistMember.length; i++) {
        let item = that.data.freeAssistMember[i];
        if (item.userHeadImg) {} else {
          item.userHeadImg = '/images/zp_user_img.png'
        }
      }
    }

    if (resData.data.freeAssistMember.length < resData.data.totalNum) {
      var num = resData.data.totalNum - resData.data.freeAssistMember.length;
      for (var i = 0; i < num; i++) {
        var groupMember = {
          userNickName: "",
          userHeadImg: ""
        }
        that.data.freeAssistMember.push(groupMember);
      }
    }
    utils.logi(that.data.freeAssistMember)
    //  新人红包
    if(((resData.data.freeAssist.status == 1 || resData.data.freeAssist.status == 2)) && (resData.data.freeAssistCoupon || resData.data.receiveProductCoupon ) ){
      that.setData({
        isShowDialog: true,
      })
      if(resData.data.isJoinReq == 1){
        clearTimeout(that.data.interval);
        that.data.interval = setTimeout(function(){
          appInteriorSkip.navigateToNewExclusive()
        },5000)
        requestAna('pop_like_index', 'zero_help', {
          inviteCode: resData.data.freeAssist.assistCode,
        })
        requestAna('pop_like_go', 'zero_help', {
          inviteCode: resData.data.freeAssist.assistCode,
        })
      }
      if(resData.data.isJoinReq == 0){
        requestAna('pop_start_index', 'zero_help', {
          inviteCode:resData.data.freeAssist.assistCode,
        })
      }
      
    }
    that.setData({
      freeAssistMember: that.data.freeAssistMember,
      // awardList: that.data.awardList
    })
     // 定义一个总毫秒数，以一分钟为例。TODO，传入一个时间点，转换成总毫秒数
     if(resData.data.freeAssist.remainingTime){
      const total_micro_second =resData.data.freeAssist.remainingTime * 1000;
      that.count_down(total_micro_second);
     }  
  },
  onShareAppMessage: function (e) {
    var that = this;
    that.setData({
      joinUser: []
    })
    that.getTips();
    // 邀请好友
    const scene = that.data.scene;
    if(scene){
      return {
        title: that.data.shareDoc,
        imageUrl: that.data.shareImgUrl,
        path: '/pages/active_page/zero_power/zero_power?assistCode=' + that.data.assistCode + '&scene='+scene,
        success: function (res) {
          requestAna('invite_success', 'zero_help', {
            inviteCode: that.data.assistCode,
          })
  
        },
      }
    }else{
      return {
        title: that.data.shareDoc,
        imageUrl: that.data.shareImgUrl,
        path: '/pages/active_page/zero_power/zero_power?assistCode=' + that.data.assistCode,
        success: function (res) {
          requestAna('invite_success', 'zero_help', {
            inviteCode: that.data.assistCode,
          })
  
        },
      }
    }
  },
  showRoule: function () {
    this.setData({
      coverView: true
    })
  },
  //失败提示
  taskFail: function () {
    this.wetoast.toast({
      title: "来晚了，活动已结束~",
      duration: 2000
    })
  },
  //新人提示
  userClick: function () {
    setTimeout(() => {
      this.setData({
        isNewUserLog: false
      })
    }, 500)
  },
  /* 点击蒙层 */
  maskClick() {
    const that = this;
    //点击弹窗“x”“蒙层”“去商城”
    requestAna('pop_close', 'zero_help', {
      inviteCode: that.data.assistCode,
    })
    clearTimeout(this.data.interval);
    setTimeout(() => {
      this.setData({
        isShowDialog: false
      })
      
    }, 500)
  },
  /* 点击关闭按钮 */
  closeBtnClick() {
    const that = this;
    //点击弹窗“x”“蒙层”“去商城”
    requestAna('pop_close', 'zero_help', {
      inviteCode: that.data.assistCode,
    })
    clearTimeout(this.data.interval);
    setTimeout(() => {
      this.setData({
        isShowDialog: false
      })
    }, 500)
  },
  cancelPayBox: function () {
    this.setData({
      coverView: false
    })
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
   /* 跳转商品详情页 */
   chooseProduct: function (event) {
    // 根据sku跳转到对应商品详情页
    const that = this

    let productSku = that.data.productSku
   
   
    let dataList = {
        productSku: productSku
    }
    appInteriorSkip.productDetail(dataList)
},
  formSubmit: function (e) {
    var that = this;
    let wxAppLogin = app.globalData.wxappLogin;
    const formId = e.detail.formId;
    var param = {};
    param.formId = e.detail.formId;
    param.type = 0;
    param.accessToken = app.globalData.wxappLogin.access_token;
    console.log(param)
    zero_power.zeropowerFormId(param).then(function (res) {
      console.log(res)
    })
    // 刷新数据
    if (e.detail.target.dataset.type == 'new') {
      let formId = e.detail.formId;

      if (e.detail.target.dataset.draw == 'draw') {
        // “我要再来一次”按钮
        requestAna('go_again', 'zero_help', {
          inviteCode: that.data.assistCode,
        })
      } else if (e.detail.target.dataset.try == 'try'){
        //“我要再试试”按钮
        requestAna('go_try', 'zero_help', {
          inviteCode: that.data.assistCode,
        })
      }

      appInteriorSkip.redirectToZeroPower({
        formId
      })
    } else if(e.detail.target.dataset.type == 'share'){
      requestAna('invite_click', 'zero_help', {
        inviteCode: that.data.assistCode,
      })
    } else if(e.detail.target.dataset.type == 'open'){
      requestAna('my_try', 'zero_help', {
        inviteCode: that.data.assistCode,
      })
      appInteriorSkip.redirectToZeroPower({
        formId
      })
    }

  },
  goIndex: function (e) {
    const that = this;
    // 弹框
    if (e.currentTarget.dataset.type == 'bounced') {
      // 新人弹屏跳转到首页
      requestAna('pop_start_buy', 'zero_help', {
        inviteCode: that.data.assistCode,
      })
      this.wetoast.toast({
        title: "领到商品啦，正在前往商城"
      })
      setTimeout(function () {
        appInteriorSkip.navigateToNewExclusive()
      }, 2000)
    } else if(e.currentTarget.dataset.type == 'join'){
      requestAna('go_shop', 'zero_help', {
        inviteCode: that.data.assistCode,
      })
      this.wetoast.toast({
        title: "正在前往商城"
      })
      setTimeout(function () {
        appInteriorSkip.switchTabIndex()
      }, 2000)
    } else if(e.currentTarget.dataset.type == 'success'){
      //点赞成功
      requestAna('success_go', 'zero_help', {
        inviteCode: that.data.assistCode,
      })
      this.wetoast.toast({
        title: "正在前往商城"
      })
      setTimeout(function () {
        appInteriorSkip.navigateToNewExclusive()
      }, 2000)
    } else{
      requestAna('pop_like_go', 'zero_help', {
        inviteCode: that.data.assistCode,
      })
      this.wetoast.toast({
        title: "正在前往商城"
      })
      setTimeout(function () {
        appInteriorSkip.navigateToNewExclusive()
      }, 2000)
    }

    
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
  /* 毫秒级倒计时 */
count_down:function (total_micro_second) {
  const vm = this;
  // 渲染倒计时时钟
  vm.date_format(total_micro_second)
  // that.setData({
  //   clock: vm.date_format(total_micro_second)
  // });

  if (total_micro_second <= 0) {
    vm.setData({
      hr:'00',
      min:'00',
      sec:'00',
      micro_sec:'0',
      endTimeText:true
    });
    // timeout则跳出递归
    return;
  }
  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 100;
    vm.count_down(total_micro_second);
  }, 100)
},

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
date_format:function (micro_second) {
  const vm =this;
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = vm.fill_zero_prefix(Math.floor(second / 3600));
  // 分钟位
  var min = vm.fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = vm.fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;
  // 毫秒位，保留1位
  var micro_sec = parseInt(((micro_second % 1000) / 100));

vm.setData({
  hr:hr,
  min:min,
  sec:sec,
  micro_sec:micro_sec
})
  return hr + ":" + min + ":" + sec + ":" + micro_sec;
},

// 位数不足补零
fill_zero_prefix:function(num) {
  return num < 10 ? "0" + num : num
},
})