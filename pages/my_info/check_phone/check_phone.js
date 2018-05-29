//check_phone.js
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const orderService = require('../../../utils/services/order.js')

Page({
    data: {
        checkType: -1,
        phoneNumber: '',
        spNo: '',
        buttonContent: '',
        sendCheckCodeType: 0, //0:不能发送验证码，1:能发送验证码，2:已经发送验证码
        overTime: 10,
        checkCode: '',
        isCommit: false,
        checkCodeTimer: null
    },
    setTitle: function(checkType) {
        let title = ""
        if (checkType === 0) {
            title = "绑定手机"
            this.setData({
                buttonContent: '立即绑定'
            })
        } else if (checkType === 1) {
            title = "验证手机号"
            this.setData({
                buttonContent: '立即验证'
            })
        }
        wx.setNavigationBarTitle({
            title: title
        })
    },
    listenerPhoneNumInput: function(event) {
        let phoneNumber = event.detail.value;
        this.setData({
            phoneNumber: phoneNumber
        })
        if (phoneNumber.length === 11) {
            this.setData({
                sendCheckCodeType: 1
            })
        } else {
            this.setData({
                sendCheckCodeType: 0
            })
        }
    },
    getSign: function(signMethod) {
        let sign = ''
        if (signMethod === 'sha512') {

        }
        return sign
    },
    getSendData: function(checkCode) {
        let signMethod = 'sha512'
        let sign = this.getSign(signMethod)
        let sendData = {
            spNo: this.data.spNo,
            userId: app.globalData.wxappLogin.user_id,
            phoneNumber: this.data.phoneNumber,
            signMethod: signMethod,
            sign: sign,
            checkCode: checkCode
        }
        return sendData
    },
    listenerCheckCodeInput: function(event) {
        const that = this
        let checkCode = event.detail.value;
        this.setData({
            checkCode: checkCode
        })
        if (checkCode.length === 6) {
            this.setData({
                isCommit: true
            })
        }
    },
    sendCheckCode: function() {
        const that = this
        let checkType = this.data.checkType
        let type = ''
        if (checkType === 0) {
            type = 'set'
        } else if (checkType === 1) {
            type = 'update'
        }
        let sendData = {
            spNo: this.data.spNo,
            userId: app.globalData.wxappLogin.user_id,
            phoneNumber: this.data.phoneNumber,
            type: type
        }
        orderService.sendCheckCode(sendData).then(function(res) {
            const resData = res.data
            console.log(that.data.checkCodeTimer == null)
            if (resData.code === 0 && that.data.checkCodeTimer == null) {
                // var checkCodeTimer
                let checkCodeSecond = 60
                    // console.log(checkCodeTimer != 'undefined')
                    // if(checkCodeTimer != 'undefined'){
                that.wetoast.toast({ title: '验证码已发送, 请稍等', duration: 1000 })                        
                that.data.checkCodeTimer = setInterval(function() {
                        // console.log(checkCodeSecond)
                        if (checkCodeSecond <= 0) {
                            checkCodeSecond = 0;
                            clearInterval(that.data.checkCodeTimer);
                            that.data.checkCodeTimer = null;
                            that.setData({
                                sendCheckCodeType: 1,
                                checkCodeSecond: checkCodeSecond
                            })
                        } else {
                            checkCodeSecond--;
                            that.setData({
                                sendCheckCodeType: 2,
                                checkCodeSecond: checkCodeSecond
                            })
                        }
                    }, 1000)
                    // }

            } else {
                that.wetoast.toast({ title: resData.msg, duration: 1000 })
            }
        })
    },
    setPasswd: function() {
        const that = this
        let sendData = this.getSendData(this.data.checkCode)
        orderService.verifyMobileCode(sendData).then(function(res) {
            const resData = res.data
            if (resData.code === 0) {
                that.setData({
                    isCommit: true
                })
                appInteriorSkip.setPasswd(resData.access_token, encodeURIComponent(that.data.spNo), that.data.phoneNumber)
            } else {
                that.wetoast.toast({ title: resData.msg, duration: 1000 })
                that.setData({
                    isCommit: false
                })
            }
        })
    },
    onLoad: function() {
        console.log(" ------------------------------my_info.check_phone.onload------------------------------ ")
        new app.globalData.WeToast()
        const that = this
        orderService.rechargePwd().then(function(res) {
            const rechargePwdData = res.data
            let checkType = rechargePwdData.check_code
            let phoneNumber = rechargePwdData.phone_number
            let spNo = rechargePwdData.sp_no

            console.log("onLoad.rechargePwdData", rechargePwdData)
            that.setData({
                checkType: checkType,
                phoneNumber: phoneNumber,
                spNo: spNo
            })
            if (phoneNumber != null && phoneNumber.length == 11) {
                that.setData({
                    sendCheckCodeType: 1
                })
            }
            that.setTitle(checkType)
        })
    },
    onUnload: function() {
        if (this.data.checkCodeTimer != null) {
            clearInterval(this.data.checkCodeTimer)
            this.setData({
                checkCodeTimer: null
            })
        }
    }
})
