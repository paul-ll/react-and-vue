//my_address.js
const app = getApp()
const addressService = require('../../../utils/services/address.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const utils = require('../../../utils/util.js')
const {reconnect} = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna

Page({
    data: {
        myAddressItems: [],
        isShow: 0,
        network: {
            reconnecting: false,
            noNetwork: false
        },
        optAddressInfo: {},
        operationType: '',
        isFromMyInfo: 0, // 是否从我的页面而来
    },
    reconnect,
    setChooseAddress: function (receiveAddressInfo) {
        if (this.data.isShow != 0) {
            utils.logi('--------------------------------receiveAddressInfo=', receiveAddressInfo)
            let tmp = receiveAddressInfo.stationCode == null ? '':receiveAddressInfo.stationCode
            let stationCode = '"station_code":"' + tmp + '"'
            let addressCodeStr = 0
            let addressCode;
            if (this.data.operationType === 'ADD') {
                addressCodeStr = '"address_code":"' + receiveAddressInfo.area_code + '"'
                addressCode = receiveAddressInfo.area_code;
            } else {
                addressCodeStr = '"address_code":"' + receiveAddressInfo.code + '"'
                addressCode = receiveAddressInfo.code;
            }
            let addressInfo = '{' + stationCode + ',' + addressCodeStr + '}'
            utils.logi('--------------------------------chooseAddress.addressInfo=', addressInfo)
            let lat_lng = receiveAddressInfo.lat_lng.split(",")
            let latLngInfo = {
                lat: lat_lng[0],
                lng: lat_lng[1]
            }
            const header = {
                'x-region': addressInfo,
                'platform': 'weixin_app'
            }
            addressService.chromeView(latLngInfo, header).then(function (res) {
                utils.logi("chooseAddress.chromeView.res", res)
                const resChromeViewData = res.data
                if (resChromeViewData.type === 0 || resChromeViewData.type === 1) {
                    app.setReceiveAddressInfo(receiveAddressInfo)
                    app.setCurrentAddressInfoIsDelete(0)
                    app.setStationCodeAndAddressCode(resChromeViewData.station_code, addressCode);
                    appInteriorSkip.backPage()
                } else {
                    thirdApi.showModal('该地址目前不支持下单', '再给攻城狮一根烟的时间，即将有更多城市开放，敬请期待哦~', false, '好吧好吧')
                }
            })

        }else if (this.data.isShow === 0) {

        }
    },
    chooseAddress: function (event) {
        utils.logi('-----------------chooseAddress.event----------',event.currentTarget.dataset.myAddressItemIndex)
        // utils.logi('-----------------event.currentTarget----------',event.currentTarget)
        let receiveAddressInfo = this.data.myAddressItems[event.currentTarget.dataset.myAddressItemIndex]
        this.setChooseAddress(receiveAddressInfo)
    },
    setOptAddress: function (optAddressInfo, operationType) {
        if (this.data.isShow != 0) {
            this.setData({
                optAddressInfo: optAddressInfo,
                operationType: operationType
            })
        }
    },
    editAddress: function (event) {
        utils.logi("editAddress.event", event)
        appInteriorSkip.editAddress("EDIT", event.currentTarget.dataset.myAddressItemId)
    },
    addAddress: function (event) {
        utils.logi("addAddress.event", event)
        appInteriorSkip.editAddress("ADD")
    },
    setTitle: function () {
        wx.setNavigationBarTitle({
            title: "我的地址"
        })
    },
    onLoad: function(res){
        utils.logi(" ------------------------------address.my_address.onload------------------------------ ")
        utils.logi('-------------------res.isShow--------------=', res.isShow)
        this.setData({
            isShow: res.isShow,
            isFromMyInfo: res.isFromMyInfo
        })
    },
    onShow: function(){
        requestAna('view_address', 'individual_center')
        const that = this
        addressService.getAllAddressItems().then(function(res) {
            const resData = res.data instanceof Array ? res.data : [];
            that.setData({
                myAddressItems: resData,
                'network.noNetwork': false
            });
            if(!utils.gIsEmptyObject(that.data.optAddressInfo)){
                that.setChooseAddress(that.data.optAddressInfo)
            }
        },function (){
            that.setData({
                'network.noNetwork': true
            })
        }).catch(res => utils.logi("my_address.onShow.exception", res));
        //this.setTitle()
    },
    onReady: function () {
        this.setTitle()
    }
})