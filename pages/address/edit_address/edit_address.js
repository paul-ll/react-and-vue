//edit_address.js
const app = getApp()
const addressService = require('../../../utils/services/address.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const requestAna = require('../../../utils/service_utils').requestAna
const utils = require('../../../utils/util');

Page({
    data: {
        addressDetail: {
            name: "",
            phone_number: ""
        },
        regionName: "",
        address1: "",
        address2: "",
        allRegionLists: [],
        operationType: "",
        addressIndexWithTag: {"": 0, "HOME": 1, "COMPANY": 2, "SCHOOL": 3, "OTHER": 4},
        addressTagWithIndex: {0: "请选择地址类型", 1: "HOME", 2: "COMPANY", 3: "SCHOOL", 4: "OTHER"},
        addressTagArray: ["请选择地址类型", "住宅", "公司", "学校", "其他"],
        addressTagIndex: 0,
        addressList: [],
        hotTagsCityLists: [],
        hotTagsCityCodes: [],
        hotTagsCityIndex: 0,
        cityList: {
            hotTags: {
                cityLists: [],
                cityIndex: 0
            },
            northernTags: {
                cityLists: [],
                cityIndex: 0
            },
            southernTags: {
                cityLists: [],
                cityIndex: 0
            },
            northeastTags: {
                cityLists: [],
                cityIndex: 0
            }
        }
    },
    deleteAddress: function (event) {
        let addressDetailId = event.currentTarget.dataset.addressDetailId
        wx.showModal({
            title: '提示',
            content: '确认删除此收货地址信息么！',
            showCancel: true,
            success: function(res) {
                if (res.confirm) {
                    utils.logi("edit_address.deleteAddress.event", event)
                    addressService.optAddressWithId(addressDetailId, 'DELETE').then(function (res) {
                        const resData = res.data;
                        let currentAddressInfo = app.globalData.currentAddressInfo
                        utils.logi("edit_address.deleteAddress.delAddreeWithId.res", currentAddressInfo);
                        if(addressDetailId === currentAddressInfo.id){
                            app.setCurrentAddressInfoIsDelete(1)                  
                        }
                        utils.logi("edit_address.deleteAddress.delAddreeWithId.res", resData);
                        appInteriorSkip.backPage();
                    })
                }
            }
        })
    },
    listenerNameInput: function (event) {
        this.data.addressDetail.name = event.detail.value;
    },
    listenerPhoneNumberInput: function (event) {
        this.data.addressDetail.phone_number = event.detail.value;
    },
    listenerRegionNameInput: function (event) {
        this.data.addressDetail.regionName = event.detail.value;
    },
    listenerCityChange: function (event) {
        utils.logi('bindPickerChange.listenerRegionNameChange.event', event)
        this.setData({
            hotTagsCityIndex: event.detail.value,
            address1: "",
            address2: "",
            regionName: '',
        })
        utils.logi(this.data.addressDetail)
        this.data.addressDetail.province = this.data.allRegionLists[this.getProvinceCode(this.data.hotTagsCityCodes[this.data.hotTagsCityIndex])][0]
        this.data.addressDetail.city = this.data.allRegionLists[this.getCityCode(this.data.hotTagsCityCodes[this.data.hotTagsCityIndex])][0]
        this.data.addressDetail.area = ""
        this.data.addressDetail.address_1 = ""
        this.data.addressDetail.address_2 = ""
        
        // utils.logi(this.data.addressDetail)
    },
    getProvinceCode: function (areaCode) {
        let cityCode = this.getCityCode(areaCode)

        if (this.data.allRegionLists[cityCode].length > 1) { 
            return this.data.allRegionLists[cityCode][1];
        }

        return '';
    },
    getCityCode: function (areaCode) {
        return this.data.allRegionLists[areaCode][1]
    },
    locateAddress: function (event) {
        if (this.data.hotTagsCityIndex != 0) {
            let regionCode = this.getCityCode(this.data.hotTagsCityCodes[this.data.hotTagsCityIndex])
            utils.logi('-----------------------locateAddress-----',regionCode, '-----------------------', this.data.allRegionLists[regionCode])

            appInteriorSkip.locatorAddress(this.data.allRegionLists[regionCode][0], 0)
        } else {
            thirdApi.showModal('优鲜提醒', '请输入您的收货城市', false, "知道了")
        }
    },
    checkInput: function () {
        let addressDetail = this.data.addressDetail
        if (!addressDetail.name) {
            thirdApi.showModal('优鲜提醒', '请输入收货人姓名', false, "知道了")
        }else if(addressDetail.phone_number.length == 0){
            thirdApi.showModal('优鲜提醒', '请输入手机或固话', false, "知道了")
        }else if (!(/^(13\d|14\d|15\d|17\d|18\d)\d{8}$/.test(addressDetail.phone_number))) {
            thirdApi.showModal('优鲜提醒', '联系电话格式有误', false, "知道了")
        }else if (this.data.hotTagsCityIndex === '0') {
            thirdApi.showModal('优鲜提醒', '请输入您的收货城市', false, "知道了")
        }else if (!this.data.address1) {
            thirdApi.showModal('优鲜提醒', '请输入您的收货地址', false, "知道了")
        }else if (!this.data.address2) {
            thirdApi.showModal('优鲜提醒', '请输入您的楼号/单元/门牌号', false, "知道了")
        }else if (this.data.addressTagIndex == '0') {
            thirdApi.showModal('优鲜提醒', '请输入您的地址类型', false, "知道了")
        }else {
            return true
        }
        return false
    },
    listenerAddress2Input: function (event) {
        this.data.addressDetail.address_2 = event.detail.value;
        this.setData({
            address2: event.detail.value
        })
    },
    listenerAddressTagChange: function(event) {
        utils.logi('bindPickerChange.listenerAddressTagChange.event', event)
        this.setData({
            addressTagIndex: event.detail.value
        })
        this.data.addressDetail.tag = this.data.addressTagWithIndex[event.detail.value]
    },
    saveAddress: function (event) {
        const that = this
        utils.logi('saveAddress.event', event)
        if(this.checkInput()) {
            this.data.addressDetail.address_detail = this.data.addressDetail.address_1 + this.data.addressDetail.address_2
            utils.logi("bindPickerChange.saveAddress.addressDetail", this.data.addressDetail)
            let method = 'GET'
            if (this.data.operationType === 'EDIT') {
                method = 'PUT'
                utils.logi('-------current log EDIT addressDetail=', this.data.operationType, this.data.addressDetail)
                addressService.optAddressWithId(event.currentTarget.dataset.addressDetailId, method, this.data.addressDetail).then(function () {
                    let pages = getCurrentPages()
                    let prePage = pages[pages.length-2]
                    prePage.setOptAddress(that.data.addressDetail, that.data.operationType)
                    appInteriorSkip.backPage();
                })
            } else if (this.data.operationType === 'ADD') {
                method = 'POST'
                utils.logi('-------current log ADD addressDetail=', this.data.operationType, this.data.addressDetail)
                addressService.addAddress(method, this.data.addressDetail).then(function (res) {
                    const resData = res.data
                    if(resData.code === 0) {
                        let pages = getCurrentPages()
                        let prePage = pages[pages.length-2]
                        prePage.setOptAddress(resData, that.data.operationType)
                        // 若是从我的页面进入, 则不重置当前地址, 若从填单页进入, 则重置
                        if (prePage.data.isFromMyInfo != 1) {
                            app.setCurrentAddressInfo(1, resData)
                        }
                        appInteriorSkip.backPage();
                    }else{
                        if(res.msg!='' || res.msg!=null) {
                            that.wetoast.toast({title: res.msg, duration: 2000})
                        }else{
                            that.wetoast.toast({title: '地址添加异常,请稍后再试!', duration: 2000})
                        }
                    }
                })
            }
        }
    },
    getAddressInfo: function (operationType, myAddressItemId) {
        const that = this
        if(operationType === "EDIT") {
            addressService.optAddressWithId(myAddressItemId, 'GET').then(function (res) {
                const resData = res.data;
                utils.logi("getAddressInfo.optAddressWithId.res", resData);
                // that.data.addressDetail = resData
                // that.data.regionName = resData.province + ' ' + resData.city + ' ' + resData.area
                // that.data.address1 = resData.address_1
                // that.data.address2 = resData.address_2
                // that.data.addressTagIndex = that.data.addressIndexWithTag[resData.tag]
                // that.data.operationType = operationType
                that.setData({
                    addressDetail: resData,
                    regionName: resData.province + ' ' + resData.city + ' ' + resData.area,
                    address1: resData.address_1,
                    address2: resData.address_2,
                    addressTagIndex: that.data.addressIndexWithTag[resData.tag],
                    operationType: operationType
                })
                that.setTitle(operationType)
                that.getAllRegionItems()
            });
        }else if(operationType === "ADD") {
            that.data.operationType = operationType
            that.getAllRegionItems(operationType);
        }
    },
    getAllRegionItems: function(){
        const that = this
        addressService.getAllRegionItems().then(function (res) {
            const resData = res.data;
            utils.logi("getAllRegionItems.res", resData);
            that.setData({
                allRegionLists: resData
            })
            that.getAddressList();
        })
    },
    getAddressList:function () {
        const that = this
        addressService.getAddressList().then(function (res) {
            const resData = res.data;
            utils.logi("getAddressList.res", resData);
            let addressList = []
            addressList.push(resData[0]) // 只取数组元素第0个
            that.setData({
                addressList
            })
            for(let i=0; i<addressList.length; i++) {
                // if (resData[i].name === "热门") { // name字段会随时变化, 不应用作判断条件
                const areas = resData[i].areas
                let addressRegionCode = 0
                let hotTagsCityRegionCode = 0
                let operationType = that.data.operationType
                let hotTagsCityLists = []
                hotTagsCityLists[0] = "请输入您收货的城市"
                let hotTagsCityCodes = []
                hotTagsCityCodes[0] = ""
                let hotTagsCityIndex = 0
                if (operationType === 'EDIT') {
                    utils.logi(operationType, that.data.addressDetail.code)
                    addressRegionCode = that.getCityCode(that.data.addressDetail.code)
                }
                for (let j = 1; j <= areas.length; j++) {
                    hotTagsCityLists[j] = areas[j-1].name;
                    hotTagsCityCodes[j] = areas[j-1].area_code;
                    if (operationType === 'EDIT') {
                        hotTagsCityRegionCode = that.getCityCode(hotTagsCityCodes[j])
                        if (addressRegionCode === hotTagsCityRegionCode) {
                            hotTagsCityIndex = j
                            that.setData({
                                hotTagsCityIndex: hotTagsCityIndex
                            })
                        }
                    }
                }
                that.setData({
                    hotTagsCityLists: hotTagsCityLists,
                    hotTagsCityCodes: hotTagsCityCodes
                })
            }
        })
    },
    setTitle: function (operationType) {
        let title = ""
        if(operationType === "EDIT") {
            title = "编辑收货地址"
        }else if(operationType === "ADD") {
            title = "添加收货地址"
        }
        wx.setNavigationBarTitle({
            title: title
        })
    },
    setAddressParams: function (res, type=''){
        let regionNameStr = ''
        let code = ''
        if (type == 'LOCATION') {
            regionNameStr = res.ad_info.province + ' ' + res.ad_info.city + ' ' + res.ad_info.district
            code = res.ad_info.adcode
        }
        else {
            regionNameStr = res.province + ' ' + res.city + ' ' + res.district
            code = res.adcode
        }
        this.setData({
           address1 : res.title,
           regionName: regionNameStr,
        })
        utils.logi('-------current log res=', res)
        this.data.addressDetail.address_1 = res.title
        this.data.addressDetail.full_address = res.address
        this.data.addressDetail.code = code
        this.data.addressDetail.regionName = regionNameStr
        this.data.addressDetail.lat_lng = res.location.lat+ ',' + res.location.lng
        utils.logi('-------current log this.data.addressDetail=', this.data.addressDetail.regionName)
    },
    onLoad: function(res){
        utils.logi(" ------------------------------address.edit_address.onload------------------------------ ")
        utils.logi("onLoad.res", res)
        new app.globalData.WeToast()
        this.getAddressInfo(res.operationType, res.myAddressItemId);
        // utils.logi("onLoad.data", this.data)
    },
    onShow: function () {
        requestAna('addre_edit', 'my_address')
        // utils.logi("edit_address.onShow.globalData.selectSearchAddressInfo", app.globalData.selectSearchAddressInfo)
        // let selectSearchAddressInfo = app.globalData.selectSearchAddressInfo
        // if(selectSearchAddressInfo != null) {
        //     utils.logi('edit_address.onShow.selectSearchAddressInfo', selectSearchAddressInfo)
        //     this.data.addressDetail.address_1 = selectSearchAddressInfo.title
        //     this.data.addressDetail.address_2 = ""
        //     this.setData({
        //         address1: selectSearchAddressInfo.title,
        //         address2: ""
        //     })
        //     this.data.addressDetail.area = selectSearchAddressInfo.district
        //     this.data.addressDetail.city = selectSearchAddressInfo.city
        //     this.data.addressDetail.code = selectSearchAddressInfo.adcode
        //     this.data.addressDetail.full_address = selectSearchAddressInfo.address
        //     // this.data.addressDetail.province = selectSearchAddressInfo.province
        // }
        // utils.logi('edit_address.onShow.address1', this.data.address1)
        this.setTitle(this.data.operationType)
    },
    onReady: function () {
        this.setTitle(this.data.operationType)
    },
    onPullDownRefresh: function (event) {
        wx.stopPullDownRefresh()
    },

})
