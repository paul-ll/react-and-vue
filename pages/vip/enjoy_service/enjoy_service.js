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
    network: {
      noNetwork: false,
      reconnecting: false
    },
    loading:true,
    haveData:false,
    vipInfo:{},
    showDialog:false,//是否显示弹框
    showSuccessPage:false,//体验成功的展示
    successImageUrl:null,//体验成功的图片
    dialogText:'',
    pickUpParams:{},
    userId:''//分享人的uid
  },
  reconnect,
  onLoad: function (options) {
    new app.globalData.WeToast()
    
    this.setData({
       userId:options.user_id,
       pickUpParams:{
          sign: options.sign,
          card_id: options.card_id,
          user_id: options.user_id
       }
    }) 
    this.initPage()//获取开通信息
    requestAna('get_into_receipt', 'experience_card_receive', {})
  },
  initPage(){
    var that = this
     app.getUserInfo(wxAppLogin => {
      that.getUserVipCardInfo()
    }, res => {
      that.showNetErrorView()
    }, res => {
      // 无权限
      that.showNoRuleView();
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
  getUserVipCardInfo(){
     vip.openInviteUserVipCard(this.data.pickUpParams).then(res =>{
      var show = res.data.pop_doc&&res.data.pop_doc.length > 0? true : false
      this.setData({
        vipInfo:res.data,
        dialogText:res.data.pop_doc,
        showDialog:show,
        loading:false,
        haveData:true,
        'network.noNetwork': false,
        pickUpParams:{
          sign: res.data.sign,
          card_id: res.data.card_id,
          user_id: this.data.userId
       }
      }) 
    }, res =>{
        this.setData({
            'network.noNetwork': true,
            loading:false,
            haveData:false
        });
    }).catch(res => console.log(res));
  },

  showNetErrorView() {
    this.setData({
      loading: false,
      network: {
        noNetwork: true,
      },
    })
  },
  //显示没有权限页面
  showNoRuleView() {
    this.setData({
      network: {
        noNetwork: false
      },
      loading: false
    })
  },
  openApp () {
    appInteriorSkip.switchTabVip()
  },
  colseDialog() {
    this.setData({
      showDialog : false
    })
    if (this.data.vipInfo.can_click === 2) {
      this.openApp()
    }
  },

  pickUpCard () {
      var status = this.data.vipInfo.can_click
      if (status === 0) {
        return
      } else if (status === 2) {
        appInteriorSkip.switchTabVip()
        requestAna('start_experience', 'experience_card_receive', {})
      } else {
        vip.getVipCard(this.data.pickUpParams).then(res => {
          this.setData({
            showSuccessPage: true,
            successImageUrl:res.data.get_suc_img
          })
          setTimeout(this.openApp, 3000)
          requestAna('receive_success', 'experience_card_receive', {})
        }, err => {
          this.setData({
            showDialog: true,
            dialogText:err.data.msg
          })  
        })
        requestAna('click_receive', 'experience_card_receive', {})
      }
  }
})