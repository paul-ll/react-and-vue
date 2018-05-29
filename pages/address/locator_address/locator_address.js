//locator_address.js
const app = getApp()
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const addressService = require('../../../utils/services/address.js')
const thirdApi = require('../../../utils/services/third_api.js')
const utils = require('../../../utils/util.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const servicesUtils = require('../../../utils/service_utils')

Page({
    data: {
        cityName: "",
        isShow: 1,
        locationAddress: {},
        searchAddressInfos: {},
        myAddressItems: [],
        isNeedLoad: false,
        isResetlocatorAddress: false
    },
    selectDistributioncity: function () {
        appInteriorSkip.distributionCity()
    },
    listenerAddressInput: function (event) {
        const that = this
        let searchStr = event.detail.value
        servicesUtils.getAddressInfoWithStr(this.data.cityName, searchStr).then(function (res) {
            that.setData({
                searchAddressInfos: res
            })
        })
    },
    chooseAddress: function (event) {
        let addressInfo = this.data.searchAddressInfos.data.data[event.currentTarget.dataset.searchAddressInfoIndex]
        utils.logi('--------------selected event.currentTarget.dataset.searchAddressInfoIndex=', event.currentTarget.dataset.searchAddressInfoIndex)
        utils.logi('--------------selected address=', addressInfo)
        if (this.data.isShow == 1) {
            app.setCurrentAddressInfo(2, addressInfo)
            appInteriorSkip.backPage()
        }else if(this.data.isShow == 0){
            let pages = getCurrentPages()
            let prePage = pages[pages.length-2]
            prePage.setAddressParams(addressInfo)
            appInteriorSkip.backPage()
        }
    },
    chooseLocationAddress: function (event) {
        utils.logi("chooselocationAddress.event", this.data.locationAddress, event)
        let locationAddress = this.data.locationAddress[event.currentTarget.dataset.locationAddressIndex]
        if (this.data.isShow == 1) {
            app.setCurrentAddressInfo(0, locationAddress)
            appInteriorSkip.backPage()
        } else if(this.data.isShow == 0){
            let pages = getCurrentPages()
            let prePage = pages[pages.length-2]
            prePage.setAddressParams(locationAddress, 'LOCATION')
            appInteriorSkip.backPage()
        }
    },
    chooseReceiveAddress: function(event){
        let receiveAddressInfo = this.data.myAddressItems[event.currentTarget.dataset.myAddressItemIndex]
        if (this.data.isShow != 0) {
            console.debug('receiveAddressInfo---------=', receiveAddressInfo)
            app.setCurrentAddressInfo(3, receiveAddressInfo)
            appInteriorSkip.backPage()
        }
    },
    resetlocatorAddress: function () {
        const that = this
        this.setData({
            isResetlocatorAddress: true
        })
        this.getLocation()
        setTimeout(function () {
            that.setData({
                isResetlocatorAddress: false
            })
        }, 10000)
    },
    getLocation: function(resData) {
        const that = this
        thirdApi.getLocation().then(function (res) {
            servicesUtils.getGeoLocation(res.latitude, res.longitude, 150).then(function (res) {
                console.debug('locationAddress, res.data=', res.data)
                if (!utils.gIsEmptyObject(res.data) && res.data.status == 0) {
                    that.setData({
                        locationAddress: res.data.data,
                        isResetlocatorAddress: false
                    })
                }
            })
        })
    },
    loadAllAddress: function () {
      this.setData({
          isNeedLoad: true
      })
    },
    setTitle: function () {
        wx.setNavigationBarTitle({
            title: "选择地址"
        })
    },
    onLoad: function(res){
        utils.logi(" ------------------------------address.locator_address.onload------------------------------ ")
        // utils.logi('----locatoer address onload--------=', res)
        this.setData({
            cityName: res.cityName,
            isShow: res.isShow
        })
        this.getLocation(res)
    },
    onShow: function(){
        requestAna('auto_position')
        // 先展示收货地址
        const that = this
        addressService.getAllAddressItems().then(function(res) {
            const resData = res.data instanceof Array ? res.data : [];
            console.debug('----------locate address, receive addresslist=', resData)
            that.setData({
                myAddressItems: resData,
            });
        })
        //console.debug('----------locate address, receive addresslist=', this.data.myAddressItems)

    },
    onReady: function () {
        this.setTitle()
    },
    onUnload: function () {

    }
})