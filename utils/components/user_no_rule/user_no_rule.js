// utils/components/user_no_rule.js
const thirdApi = require('../../services/third_api.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },



  /**
   * 组件的方法列表
   */
  methods: {
    openRule: function () {
      let that = this;
      let app = getApp();
      thirdApi.wxApi('openSetting').then(function (ret) {
        if (ret.authSetting["scope.userInfo"]) {
          app.globalData.hasUserInfoRight = true;
          that.triggerEvent("haveRule", {})
        } else {
          that.triggerEvent("noRule", {})
        }
      })

    },
  }
})
