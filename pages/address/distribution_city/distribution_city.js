//distribution_city.js
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const addressService = require('../../../utils/services/address.js')
const utils = require('../../../utils/util')

Page({
    data: {
        distributionCityItems: []
    },
    chooseCity: function (event) {
        utils.logi("chooseCity.event", event, this.data.distributionCityItems)
        let distributionCityAreaIdx = event.currentTarget.dataset.distributionCityAreaIdx
        let hotCityLists = this.data.distributionCityItems
        for (let i=0; i<hotCityLists.length; ++i) {
            let hotCityList = hotCityLists[i]
            // if (hotCityList.name === '热门') {
            let pages = getCurrentPages()
            let prePage = pages[pages.length-2]
            prePage.setData({
                cityName: hotCityList.areas[distributionCityAreaIdx].name
            })
            let addressInfo = {}
            addressInfo.title = hotCityList.areas[distributionCityAreaIdx].name
            addressInfo.adcode = hotCityList.areas[distributionCityAreaIdx].area_code
            addressInfo.city = hotCityList.areas[distributionCityAreaIdx].name
            app.setCurrentAddressInfo(2, addressInfo)
            // }
        }

        appInteriorSkip.backPage()
    },
    getAddressList: function () {
        const that = this
        addressService.getAddressList().then(function (res) {
            const resData = res.data;
            utils.logi("getAddressList.res", resData);
            let distributionCityItems = []
            // 只取第0个数组元素
            distributionCityItems.push(resData[0])
            that.setData({
                distributionCityItems
            })
        })
    },
    onLoad: function(res){
        utils.logi(" ------------------------------address.distribution.onload------------------------------ ")
        utils.logi("onLoad.resData", res)
        // this.getAddressList()
    },
    onShow: function(){
        this.getAddressList()
    },
    onReady: function () {
        wx.setNavigationBarTitle({
            title: "选择城市"
        })
    }
})