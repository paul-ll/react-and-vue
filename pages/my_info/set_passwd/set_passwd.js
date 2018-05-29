//set_passwd.js
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const orderService = require('../../../utils/services/order.js')
const sha512 = require('../../../utils/external/sha512.min.js')

Page({
  data: {
    spNo: '',
    phoneNumber: '',
    accessToken: '',
    firstInputLength: 0,
    secondInputLength: 0,
    firstInputContent: '',
    secondInputContent: '',
    isPasswdDiff: false,
    isCommit:false
  },
  listenerFirstInput: function (event) {
    let firstInputContent = event.detail.value;
    this.setData({
      firstInputLength: firstInputContent.length,
      firstInputContent: firstInputContent
    })
    if(firstInputContent.length===6) {
    }
  },
  listenerSecondInput: function (event) {
    let secondInputContent = event.detail.value;
    this.setData({
      secondInputLength: secondInputContent.length,
      secondInputContent: secondInputContent
    })
    if(secondInputContent.length===6) {
      let firstInputContent = this.data.firstInputContent
      if(firstInputContent === secondInputContent){
        this.setData({
          isCommit: true,
          isPasswdDiff: false
        })
      }else{
        this.setData({
          isCommit: false,
          isPasswdDiff: true
        })
      }
    }
  },
  getSign: function (signMethod) {
    let sign=''
    if(signMethod === 'sha512'){

    }
    return sign
  },
  getSendData: function (passWord) {
    let signMethod = 'sha512'
    let sign = this.getSign(signMethod)
    let passwordV2 = sha512.sha512(passWord)
    let sendData = {
      spNo: this.data.spNo,
      userId: app.globalData.wxappLogin.user_id,
      phoneNumber: this.data.phoneNumber,
      signMethod: signMethod,
      sign: sign,
      accessToken: this.data.accessToken,
      passWord: passWord,
      passwordV2: passwordV2
    }
    return sendData
  },
  setPasswd: function () {
    const that = this
    let firstInputContent = this.data.firstInputContent
    let secondInputContent = this.data.secondInputContent
    if(firstInputContent === secondInputContent) {
      let sendData = this.getSendData(secondInputContent)
      orderService.bindPwd(sendData).then(function (res) {
        const resData = res.data
        if (resData.code === 0) {
          that.wetoast.toast({title: '密码设置成功', duration: 1000 })
          that.setData({
            isCommit: true
          })
          setTimeout(function () {
            appInteriorSkip.backPage(2)
          }, 1000)
        } else {
          this.wetoast.toast({title: res.msg || res.data.msg, duration: 1000})
          that.setData({
            isCommit: false
          })
        }
      })
    }
  },
  setTitle: function () {
    wx.setNavigationBarTitle({
      title: "设置密码"
    })
  },
  onLoad: function(res){
    new app.globalData.WeToast()
    this.setData({
      accessToken: res.accessToken,
      spNo: res.spNo,
      phoneNumber: res.phoneNumber
    })

    this.setTitle()
  }
})