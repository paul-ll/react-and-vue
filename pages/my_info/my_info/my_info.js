//my_info.js
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const orderService = require('../../../utils/services/order.js')
const thirdApi = require('../../../utils/services/third_api.js')
const discountCard = require('../../../utils/services/discountcard.js')
const myInfo = require('../../../utils/services/myinfo.js')
const requestAna = require('../../../utils/service_utils').requestAna
const bannerSkip = require('../../../utils/custom/banner_skip')
const utils = require('../../../utils/util');

Page({
    data: {
        debugMode: utils.DEBUG_MODE,
        login_code: false,
        myOrderItems: {},
        orderNotifyCount: 0,
        userInfo: {},
        systemInfo: null,
        redpacketCount: 0,
        actionSheetItems: ['400-991-1977'],
        mydiscount: {},
        user_type:null,//用户的类型  0:非会员、1:老卡、2:优享会员体验卡、3:优享会员
        rightsNotify:[],//会员权益
        loading: true,
        haveData:false,
        network: {
          noNetwork: false,
          reconnecting: false
        },
    },
    chooseOrder: function (event) {
        //登录弹窗
        if (app.globalData.hasUserInfoRight) {
            appInteriorSkip.myOrder()
        } else {
            this.wetoast.toast({
                title: '未获取授权, 无法使用该功能'
            })
        }
    },
    chooseMyAddress: function (event) {
        console.log("chooseMyAddress.event.detail", event.detail);
        if (app.globalData.hasUserInfoRight) {
            appInteriorSkip.myAddress(0, 1)
        } else {
            this.wetoast.toast({
                title: '未获取授权, 无法使用该功能'
            })
        }
    },
    navgiteToMyRedpackage() {
        if (app.globalData.hasUserInfoRight) {
            appInteriorSkip.navigateToMyRedpackageList({ voucherType: 'packet' })
        } else {
            this.wetoast.toast({
                title: '未获取授权, 无法使用该功能'
            })
        }
    },
    navgiteToMyProductCoupon() {
        // 跳转到商品券
        if (app.globalData.hasUserInfoRight) {
            appInteriorSkip.navigateToMyRedpackageList({ voucherType: 'product' })
        } else {
            this.wetoast.toast({
                title: '未获取授权, 无法使用该功能'
            })
        }
    },
    chooseMyBalance: function (event) {
        console.log("chooseMyBalance.event.detail", event.detail);
        if (app.globalData.hasUserInfoRight) {
            appInteriorSkip.balanceDetail()
        } else {
            this.wetoast.toast({
                title: '未获取授权, 无法使用该功能'
            })
        }
    },
    // chooseDiscount: function (event) {
    //     console.log("chooseDiscount.event.detail", event.detail);
    //     appInteriorSkip.discountDetail()
    // },
    showActionSheet: function (event) {
        // 集卡页入口
        // bannerSkip.bannerSkip({type: 'COLLECT_CARD'})
        // return
        const that = this
        thirdApi.showActionSheet(that.data.actionSheetItems).then(function (res) {
            console.log("showActionSheet.res", res.tapIndex)
            if (!res.cancel) {
                thirdApi.makePhoneCall(that.data.actionSheetItems[res.tapIndex])
            }
        })
    },
    aboutUs: function (event) {
        console.log("aboutUs.event", event.detail);
        appInteriorSkip.aboutUs()
    },
    welcomePolite: function () {
        appInteriorSkip.navigateToWelcomePolite()
        requestAna('invite_nutton', 'individual_center');
    },
    onLoad: function () {
        console.log(" ------------------------------my_info.my_info.onload------------------------------ ")
        new app.globalData.WeToast()
    },
    onShow: function () {
        requestAna('bottom_nav', 'individual_center')
        //用户未授权报错，定义that
        const that = this;
        if (app.globalData.hasUserInfoRight) {
            this.initPage();
        } else {
            app.showWarningModal(() => {
                this.initPage();
            }, () => {
                that.wetoast.toast({
                    title: '授权失败, 部分功能不可用~'
                })
            })
        }
    },
    initPage() {
        const that = this
        console.log(app.globalData.wxappLogin)
        if (!app.globalData.wxappLogin) {
            app.getUserInfo(function (wxappLogin) {
                if (wxappLogin != null) {
                    that.getPageData()
                }
            })
        } else {
            that.getPageData()
        }
    },
    getPageData() {
        const that = this
        if (!app.globalData.userInfo) {
            thirdApi.getUserInfo().then((res) => {
                app.globalData.userInfo = res.userInfo
                that.setData({
                    userInfo: res.userInfo,
                    systemInfo: app.globalData.systemInfo
                })
            })
        } else {
            that.setData({
                userInfo: app.globalData.userInfo,
                systemInfo: app.globalData.systemInfo
            })
        }

        myInfo.myInfo().then(function (res) {
            const resData = res.data;
            console.log("getInfo.myInfo", resData)
            app.globalData.userMemberType = resData.user_member_type
            
            var rightsNotify = that.resolveMemberRights(resData.member_rights.rights_notify)
            that.setData({
                haveData:true,
                loading:false,
                mydiscount: resData,
                user_type:resData.user_member_type,
                rightsNotify:rightsNotify
            })
        }, res =>{
            that.setData({
                haveData:false,
                loading:false,
                'network.noNetwork': true
            });
        });
        orderService.serviceHelp().then(function (res) {
            const resData = res.data;
            let actionSheetItems = []
            actionSheetItems[0] = resData.phonenumber
            that.setData({
                actionSheetItems: actionSheetItems
            })
            console.log("onLoad.serviceHelp", that.data)
        })
    },

    //处理会员权益
    resolveMemberRights(right){
        let a = []
        let arr = right.split('【')
        let b = arr[1].split('】')
        a.push(arr[0])
        a.push(b[0])
        return a
    },
    //重新请求网络
    reconnect: function () {
        let that = this;
        that.setData({
          loading: true,
          'network.noNetwork': false,
        })
        that.getPageData();
    },
    clickTestEvent() {
        if (!utils.DEBUG_MODE) {
            return;
        }

        //以下是自定义的测试事件，比如跳转到某个页面
        appInteriorSkip.navigateToProductShareList();
    },
    onBargainButtonTap () {
        appInteriorSkip.navigateToBargainGoods();
    },
    clickConfigUrl() {
        appInteriorSkip.navigateToUrlConfigPage();
    },
    clickzeropower() {
        wx.navigateTo({
            url: "/pages/active_page/zero_power/zero_power",
            success: function (res) {
                console.log(res)
            },
            fail: function (res) {
                console.log(res)
            }
        })
    },
    clickInviteFriendVip() {
        appInteriorSkip.navigateToInviteFriendVip();
    },
    clickOpenVip() {
        appInteriorSkip.navigateToOpenVip();
    },
    askFriend(){
        appInteriorSkip.navigateToInviteFriendVip()
        requestAna('click_gift_experience_card', 'individual_center');
    },
    openVipCard(){
        appInteriorSkip.navigateToOpenVip();
        requestAna('goto_renew', 'individual_center');
    },
    channgeTab(e){
        let index = e.currentTarget.dataset.index,
        type = e.currentTarget.dataset.type
        appInteriorSkip.navigateToMemberPrivileges(index)
        requestAna('member_rights', 'individual_center',{type:type});
    }
})