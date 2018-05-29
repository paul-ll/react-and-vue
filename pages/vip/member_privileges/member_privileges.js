const app = getApp()
const vip = require('../../../utils/services/vip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const {reconnect}  = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const netManager = require('../../../utils/services/net_manager');
const utils = require('../../../utils/util.js')

Page({
  data: {
    curIndex: 0,  //当前显示的view下标
    swiperList: [], //轮播数据列表
    winWidth: 0,  //设备宽度；
    winHeight: 0,   //设备高度；
    
    itemWidth: 0, //单个轮播图swiper-item的宽度；
    itemHeight: 0,//单个轮播图swiper-item的高度；
    allWidth: 0,  //轮播展示 swiper的总宽度；
    scale: 0.9,   //  缩放大小倍数；

    startClinetX: '', //触摸开始位置；
    startTimestamp: '', //触摸开始时间；
    
    translateDistance: 0,//动画移动的 距离；
    animationToLarge: {}, //从小变大的动画；
    animationToSmall: {},
    position:0,//滚动的位置
    network: {
      noNetwork: false,
      reconnecting: false
    },
    isLoad:false,
    isShow:false,
    loading:true,
  },

  //触摸开始的事件
  swiperTouchstart: function (e) {
    let startClinetX = e.changedTouches[0].clientX;
    this.setData({
      startClinetX: startClinetX, //触摸开始位置；
      startTimestamp: e.timeStamp, //触摸开始时间；
    })
  },

  //触摸移动中的事件
  swiperTouchmove: function (e) {
    // console.log('touchmove',e);
  },

  //触摸结束事件
  swiperTouchend: function (e) {
    let times = e.timeStamp - this.data.startTimestamp, //时间间隔；
        distance = e.changedTouches[0].clientX - this.data.startClinetX; //距离间隔；
    //判断
    if (times < 500 && Math.abs(distance) > 10) {
      let curIndex = parseInt(this.data.curIndex);

      let x0 = this.data.itemWidth,x1 = this.data.translateDistance,x = 0;
      if ( distance > 0) {
       
        curIndex = curIndex - 1
        if(curIndex < 0){
          curIndex = 0;
          x0 = 0;
        }
        x = x1 + x0;
      } else {
        // console.log('+1',x);
        curIndex = curIndex + 1
        if (curIndex >= this.data.swiperList.length) {
          curIndex = this.data.swiperList.length-1;
          x0 = 0;
        }
        x = x1 - x0;
      }
      this.animationToLarge(curIndex, x);
      this.animationToSmall(curIndex, x);
      this.setData({
        curIndex: curIndex,
        translateDistance: x
      })
      this.scrollTab(curIndex)
      
    } else {
      
    }
  },
  channgeTab: function(e){
    let id = e.currentTarget.dataset.index
    this.slideTo(id)
    this.scrollTab(id)
  },
  slideTo(id){
    this.animationToLarge(id,-id*this.data.itemWidth)
    this.animationToSmall(id,-id*this.data.itemWidth)
    this.setData({
      curIndex: id,
      translateDistance: -id*this.data.itemWidth
    })
  },
  getMemberPrivileges: function(){
   return vip.getMemberPrivileges().then(res =>{
    wx.setNavigationBarTitle({
      title: res.data.vipRightTitle
    })
    this.setData({
      swiperList:res.data.vip_rights_icon,
      'network.noNetwork': false,
      isLoad: true
    })  
  }, res =>{
      this.setData({
          'network.noNetwork': true,
          isLoad: true
      });
  }).catch(res => console.log(res));
  },
  scrollTab: function(current) {
    let position = 0
    let windowWidth = app.globalData.systemInfo.screenWidth
    position = 60 * current - (windowWidth / 2 - 60)
    this.setData({position})
  },
  reconnect: function () {
    this.setData({
      isLoad: false,
      'network.noNetwork': false,
    })

    this.getMemberPrivileges();
  },
  // 动画
  animationToLarge: function (curIndex,x) {
   
    this.animation.translateX(x).scale(1).step()
    this.setData({
      animationToLarge: this.animation.export()
    })
  },
  animationToSmall: function (curIndex,x) {

    this.animation.translateX(x).scale(0.9).step()
    this.setData({
      animationToSmall: this.animation.export()
    })
  },

  onLoad: function (options) {
    var that = this
    var index = options.index
    this.getMemberPrivileges().then(res=>{
      wx.getSystemInfo({
        success: function (res) {
          let w = res.windowWidth,h = res.windowHeight;
          let allWidth =  that.data.swiperList.length  * (w * 0.85);

          that.setData({
            winWidth: w,
            winHeight: h, 
            itemWidth: w*0.8,
            allWidth: allWidth
          })
        },
      })
      this.animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 500,
        timingFunction: "ease-out",
        delay: 0
      })

    }).then(res=>{
      that.slideTo(index)
      this.scrollTab(index)
        that.setData({
          isShow:true,
          loading:false
        })
    })
    
  },

})
