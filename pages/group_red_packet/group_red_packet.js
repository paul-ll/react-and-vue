const app = getApp()
const red_service = require('../../utils/services/group_redpackage.js')
const thirdApi = require('../../utils/services/third_api.js')
const appInteriorSkip = require('../../utils/services/app_interior_skip.js')
const no_network = require('../../utils/templates/no_network/no_network.js')
const requestAna = require('../../utils/service_utils.js').requestAna
const netManager = require('../../utils/services/net_manager');
const zero_power = require('../../utils/services/zero_power.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgImgsrc: netManager.configs.imageHost+'/img_20180319112325252.png',
    content: 'twoContent',
    isExceedOpenLimit:'',//参与活动次数限制
    hour: 12,
    min: 10,
    second: 11,
    grouponCode: "",
    redPacket: {},
    groupon: {},
    redDetail: {},
    grouponMemberList: [],
    awardList: [],
    commander: {},
    isJoin: 0,
    isCommander: 0,
    shareDoc: "",
    shareImg: "",
    loading: true,
    network: {
      reconnecting: false,
      noNetwork: false
    },
    options: {},
    isGoing: 0,
    haveGroupOn: 0,
    loadingHidden: true,
    nodata:{
      noData:false,
      imgUrl: '',
      noDataText: ''
    },
    haveData:false,
    showBounce:false,
    loadingCount:0,
    showNoRules:false,
    imageHost:netManager.configs.imageHost,
    limit:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      options: options
    })
    if (options.scene) {
      app.globalData.fromSource = options.scene
    }
    new app.globalData.WeToast()
    that.initPage(); 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 重新加载数据
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
  haveRule:function(){
    let that = this;
    that.setData({
      loading: true,
      showNoRules: false
    })
    that.initPage();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  initPage: function () {
    var that = this;

    app.getUserInfo(wxAppLogin => {
      //  已经开团
      let options = that.data.options;
      if (options.grouponCode) {
        
        var param = {
          grouponCode: options.grouponCode,
          sourceForm:'weixin_app'
        }
        if (wxAppLogin){
          param.accessToken = wxAppLogin.access_token
        }

        red_service.showGroup(param).then(function (res) {
          if (res.data.code == 0) {

            let param = {
              promotion_id: res.data.data.groupon.grouponCode
            }
            if (app.globalData.shareTicket) {
              param.group_name = app.globalData.shareTicket;
            }
            requestAna('get_into', 'group_page',param)
            // //限制开团提示
            // if(res.data.data.isExceedOpenLimit==1){
            //   that.wetoast.toast({
            //     title: '你今天活动次数已用完，请明天再来吧～'
            //   })
            // }
            that.reloadData(res);
          } else {
            if (res.data.message) {
              that.wetoast.toast({
                title: res.data.message
              })
            }
            if(res.data.code == 10){
              that.setData({
                'nodata.imgUrl': '/images/net_hot.png',
                'nodata.noDataText': "活动太火爆了，请稍后重试～"
              })
            }else{
              that.setData({
                'nodata.imgUrl': '/images/net_nodata.png',
                'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～"
              })
            }
            that.setData({
              loading: false,
              haveData: false,
              'nodata.noData': true,
            })
          }
        }, function (error) {
          // 设置无网络
          that.setData({
            loading: false,
            haveData: false,
            'network.noNetwork': true,
          })
        });
      }
      else {
        // 团长开团
        var param = {
          sourceForm: 'weixin_app'
        };
        if(options.formId){
          param.formId = options.formId;
        }
        if (wxAppLogin) {
          param.accessToken = wxAppLogin.access_token;
          param.userNickName = wxAppLogin.nick_name;
          param.userHeadImg = wxAppLogin.portrait;
        }


        red_service.openGroup(param).then(function (res) {
          if (res.data.code == 0) {
            let param = {
              promotion_id: res.data.data.groupon.grouponCode
            }
            if (app.globalData.shareTicket) {
              param.group_name = app.globalData.shareTicket;
            }
            requestAna('get_into', 'group_page', param)
            // //限制开团提示
            // if(res.data.data.isExceedOpenLimit==1){
            //   that.wetoast.toast({
            //     title: '你今天活动次数已用完，请明天再来吧～'
            //   })
            // }
            that.reloadData(res);
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
            } else {
              that.setData({
                'nodata.imgUrl': '/images/net_nodata.png',
                'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～"
              })
            }
            that.setData({
              loading: false,
              haveData: false,
              'nodata.noData': true,
            })
          }
        }, function (error) {
          that.setData({
            loading: false,
            haveData: false,
            'network.noNetwork': true,
          })
        });
      }
    },res => {
      that.setData({
        loading: false,
        haveData: false,
        'network.noNetwork': true,
      })
    },res => {
      that.setData({
        loading: false,
        showNoRules: true
      })
    })
  },
  goIndex: function (e) {
// 弹框
    if (e.currentTarget.dataset.type == 'bounced'){
      // 跳转到首页
      requestAna('click_use', 'group_page', {
        'promotion_id': this.data.grouponCode,
        'class': this.data.redPacket.id
      })
    }
    else{
      // 跳转到首页
      requestAna('go_use', 'group_page', {
        'promotion_id': this.data.grouponCode,
        'class': this.data.redPacket.id
      })
    }

    this.wetoast.toast({
      title: "正在前往商城"
    })
    setTimeout(function () {
      appInteriorSkip.switchTabIndex()
    }, 1000)
  },
  formSubmit: function (e) {
    var that = this;
    let wxAppLogin = app.globalData.wxappLogin;
    // 刷新数据
    if (e.detail.target.dataset.type == 'new') {
      let formId = e.detail.formId;
      //  判断红包活动是否结束
      if (that.data.isGoing != 1 && that.data.haveGroupOn != 1) {
        that.wetoast.toast({
          title: '红包活动已经结束!'
        })
        return;
      }

      if (that.data.haveGroupOn == 1) {
        // 查看我的红包团
        requestAna('view_myredpackage_group', 'group_page')
      }
      else {

        if (e.detail.target.dataset.isbounced == 'bounced') {
          // 开新团
          requestAna('click_bbs_new_redpackage', 'group_page', {
            'promotion_id': this.data.grouponCode,
            'class': this.data.redPacket.id
          })
        }
        else{
          // 开新团
          requestAna('open_redpackage', 'group_page', {
            'promotion_id': this.data.grouponCode,
            'class': this.data.redPacket.id
          })
        }

       
      }
      appInteriorSkip.redirectToGroupRedPacketV2({ formId })
    }else if(e.detail.target.dataset.type == 'share' || e.detail.target.dataset.type == 'bounced'){
      var param = {};
      param.formId = e.detail.formId;
      param.type = 0;
      param.accessToken = app.globalData.wxappLogin.access_token;
        console.log(param)
      
      zero_power.zeropowerFormId(param).then(function (res) {
        console.log(res)
      })
    }
    else {
      // 加入红包团
      requestAna('add_redpackage_group', 'group_page',{
        'promotion_id': that.data.grouponCode,
        'class': that.data.redPacket.id
      })
      that.setData({
        loadingHidden: false
      })

      // 加入团
      var param = {
        sourceForm: 'weixin_app',
        accessToken: wxAppLogin.access_token,
        userNickName: wxAppLogin.nick_name,
        userHeadImg: wxAppLogin.portrait,
        formId: e.detail.formId,
        grouponCode: that.data.grouponCode,
      }

      red_service.joinGroup(param).then(function (res) {
        that.setData({
          loadingHidden: true
        })
        if (res.data.code == 0) {
          that.reloadData(res);
        } else {
          if (res.data.message){
            that.wetoast.toast({
              title: res.data.message
            })
          }
        }
      }, function (error) {
        that.setData({
          loading: false,
          haveData: false,
          'network.noNetwork': true,
        })
      });

    }
  },
  // 设置数据
  reloadData: function (res) {
    var that = this;
    let resData = res.data
    // resData.data.groupon.status = 2
    // resData.data.isJoin = 1;
    // resData.data.isCommander = 0
    // resData.data.isGoing = 0
    // resData.data.haveGroupOn = 1
    // if (resData.data.groupon.status == 1 && resData.data.isJoin == 0) {
    //   // 进行中，没有参团
    //   that.setData({
    //     content: 'twoContent',
    //     bgImgsrc: '/images/red-doubleBG.png',
    //   })
    // }
    // else if (resData.data.groupon.status == 2 && resData.data.isJoin == 1) {
    //   // 已成团 ，已参团
    //   that.setData({
    //     content: 'twoContent',
    //     bgImgsrc: '../../images/red-doubleBG.png',
    //   })
    // }
    // else if (resData.data.groupon.status == 1 && resData.data.isJoin == 1 && resData.data.isCommander == 0) {
    //   // 进行中,已参团,团员
    //   that.setData({
    //     content: 'twoContent',
    //     bgImgsrc: '/images/red-doubleBG.png',
    //   })
    // }
    // else {
    //   that.setData({
    //     content: 'oneContent',
    //     bgImgsrc: '../../images/red-singleBg.png',

    //   })
    // }

    if (resData.data.groupon.status == 1 && resData.data.isJoin == 1 && that.data.loadingCount == 0){
        that.setData({
          showBounce:true
        })
        requestAna('bbs_show', 'group_page', {
          'promotion_id': res.data.data.groupon.grouponCode,
          'class': res.data.data.redPacket.id
        })

    }
    if (resData.data.groupon.status == 2 && resData.data.isJoin == 1 && that.data.loadingCount == 0){
      that.setData({
        showBounce: true
      })
      requestAna('success_show', 'group_page', {
        'promotion_id': res.data.data.groupon.grouponCode,
        'class': res.data.data.redPacket.id
      })
      
    }
    that.setData({
      loading: false,
      haveData: true,
      loadingCount:1,
      redPacket: resData.data.redPacket,
      groupon: resData.data.groupon,
      redDetail: resData.data.redDetail,
      grouponMemberList: resData.data.grouponMemberList,
      awardList: resData.data.awardList,
      commander: resData.data.commander,
      isJoin: resData.data.isJoin,
      isGoing: resData.data.isGoing,
      isCommander: resData.data.isCommander,
      grouponCode: resData.data.groupon.grouponCode,
      shareImg: resData.data.redPacket.shareImg,
      shareDoc: resData.data.redPacket.shareDoc,
      haveGroupOn: resData.data.haveGroupOn,
      isExceedOpenLimit:resData.data.isExceedOpenLimit,
      limit:resData.data.limit,
    })


    // 默认头像
    if(that.data.grouponMemberList){
      for (let i = 0; i < that.data.grouponMemberList.length; i++) {
        let item = that.data.grouponMemberList[i];
        if (item.userHeadImg) { 
        }
        else{
          item.userHeadImg = '/images/red-header.png'
        }
      }
    }
    if(that.data.awardList){
      for (let i = 0; i < that.data.awardList.length; i++) {
        let item = that.data.awardList[i];
        if (item.userHeadImg) { 
        }
        else{
          item.userHeadImg = '/images/red-header.png'
        } 
      }
    }


    if (resData.data.grouponMemberList.length < resData.data.redPacket.groupNumber) {
      var num = resData.data.redPacket.groupNumber - resData.data.grouponMemberList.length;
      for (var i = 0; i < num; i++) {
        var groupMember = {
          userNickName: "",
          userHeadImg: ""
        }
        that.data.grouponMemberList.push(groupMember);
      }
    }
    that.setData({
      grouponMemberList: that.data.grouponMemberList,
      awardList: that.data.awardList
    })
  },
  closeBounced:function(){
    this.setData({
      showBounce: false
    })
  },
  bounced:function(){

  },
  showOpentoast:function(){
    var that = this;
    that.wetoast.toast({
      title: '你今天活动次数已用完，请明天再来吧～'
    })
  },
  showOpenLimit:function(e){
    var that = this;
  const limit = e.currentTarget.dataset.isexceedopenlimit
  if(limit != 0){
    that.wetoast.toast({
      title: '加入失败，你今天已经加入过TA的团了～'
    })
  }else{
    that.wetoast.toast({
      title: '你今天活动次数已用完，请明天再来吧～'
    })
  }
    
  },
  onShareAppMessage: function (e) {
    var that = this;
    // 邀请好友
    return {
      title: that.data.shareDoc,
      imageUrl: that.data.shareImg,
      path: 'pages/active_page/group_red_packet_v2/group_red_packet_v2?grouponCode=' + that.data.grouponCode,
      success: function (res) {
        // 转发成功
        var shareType = '';
        if (e.target.dataset.type == 'bounced'){
          shareType = 'click_bbs_inviting_friend';
        }
        else{
          shareType = 'inviting_friends';
        }
        let param = {
          'promotion_id': that.data.grouponCode,
          'class': that.data.redPacket.id
        }
        if (res.shareTickets) {
          param.group_name = res.shareTickets[0]
        }
        requestAna(shareType, 'group_page', param) 

        if(res.shareTickets){

        }
        else{
          that.wetoast.toast({
            title: '分享到微信群，瓜分成功几率更高哦!'
          })
        }
      },
    }
  }
})