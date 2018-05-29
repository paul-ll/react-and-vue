//app.js
const push = require('/utils/pushsdk.js')
const aldstat = require('/utils/ald-stat.js')
const thirdApi = require('/utils/services/third_api.js')
const userinfoServer = require('/utils/services/userinfo.js')
const {
    WeToast
} = require('/utils/templates/wetoast/wetoast.js')
const {
    addToCart
} = require('/utils/templates/add_cart/add_cart.js')
const utils = require('/utils/util.js')
const addressService = require('/utils/services/address.js')
const categoryService = require('/utils/services/categories.js')
const login = require('/utils/services/login.js');
const servicesUtils = require('/utils/service_utils.js')
const netManager = require('/utils/services/net_manager.js');
const appInteriorSkip = require('/utils/services/app_interior_skip.js');

function pushFormSubmit(event) {
    let formId = event.detail.formId
    console.log(event)
}
App({
    getUserInfo: function (cb, failCb, authorizationFailCb) {
        const that = this;
        if (!this.globalData.wxappLogin) {
            this.globalData.wxappLogin = servicesUtils.storageManager.getWXLoginKey();
        }
        if (this.globalData.wxappLogin && this.globalData.wxappLogin.access_token) {
            thirdApi.checkSession(function () {
                typeof cb == "function" && cb(that.globalData.wxappLogin)
            }, function () {
                login.reLogin(cb, failCb, authorizationFailCb);
            })
        } else {
            login.reLogin(cb, failCb, authorizationFailCb);
        }
    },
    getSystemInfo: function () {
        const that = this
        thirdApi.wxApi('getSystemInfo').then(function (res) {
            if (res.errMsg === "getSystemInfo:ok") {
                that.globalData.systemInfo = res;
                utils.logi("getSystemInfo", res)
            }
        })
    },
    setStationCodeAndAddressCode: function (stationCode, addressCode) {
        this.setStationCode(stationCode);
        this.setAddressCode(addressCode);
    },
    /**任何设置stationCode的请不要直接赋值，要通过这个方法赋值 */
    setStationCode: function (stationCode) {
        this.globalData.currentAddressInfo.stationCode = stationCode;
    },
    /**任何设置addressCode的请不要直接赋值，要通过这个方法赋值 */
    setAddressCode: function (addressCode) {
        this.globalData.currentAddressInfo.address_code = addressCode;
    },
    getAddressHeader: function () {
        return netManager.getAddressHeader();
    },
    setProductFromCartInfos: function (productFromCartInfos) {
        this.globalData.productFromCartInfos = productFromCartInfos
        this.changeCartCount()
    },
    changeCartCount() {
        // 更改购物车数量
        let count = 0
        let len = this.globalData.productFromCartInfos.length
        if (!utils.gIsEmptyObject(this.globalData.productFromCartInfos)) {
            for (let cart in this.globalData.productFromCartInfos) {
                if (!this.globalData.productFromCartInfos[cart].quantity || this.globalData.productFromCartInfos[cart].isActive == 2) continue
                let tempCount = this.globalData.productFromCartInfos[cart].quantity
                count += tempCount
            }
        }
        thirdApi.updateCartNum(count);
        this.globalData.cartCount = count || 0
    },
    setActiveCartChecked: function (activeCartChecked) {
        this.globalData.activeCartChecked = activeCartChecked
    },
    setInactiveCartChecked: function (inactiveCartChecked) {
        this.globalData.inactiveCartChecked = inactiveCartChecked
    },
    setUnInvalidActiveCartChecked: function (unInvalidActiveCartChecked) {
        this.globalData.unInvalidActiveCartChecked = unInvalidActiveCartChecked
    },
    setCurrentAddressInfo: function (currentAddressType, addressInfo) {
        let currentAddressInfo = this.globalData.currentAddressInfo

        //防止重复设置，引起不必要的问题
        if (currentAddressInfo && addressInfo && (currentAddressInfo.id == addressInfo.id)) {
            return
        }

        if (addressInfo && addressInfo.location) {
            addressInfo.location.lat += ''
            addressInfo.location.lng += ''
        }

        if (currentAddressType == 1) {
            currentAddressInfo.id = addressInfo.id
            currentAddressInfo.title = addressInfo.address_1
            currentAddressInfo.name = addressInfo.name
            currentAddressInfo.phone = addressInfo.phone_number
            let lat_lng = addressInfo.lat_lng.split(",")
            currentAddressInfo.lat = lat_lng[0]
            currentAddressInfo.lng = lat_lng[1]
            currentAddressInfo.address_code = addressInfo.area_code;
            currentAddressInfo.city = addressInfo.city
            currentAddressInfo.province = addressInfo.province
            currentAddressInfo.area = addressInfo.area
            currentAddressInfo.address_detail = addressInfo.address_detail
        } else if (currentAddressType == 0) {
            currentAddressInfo.id = -1
            currentAddressInfo.title = addressInfo.title
            currentAddressInfo.name = null
            currentAddressInfo.phone = null
            currentAddressInfo.lat = addressInfo.location.lat
            currentAddressInfo.lng = addressInfo.location.lng
            currentAddressInfo.address_code = addressInfo.ad_info.adcode
            currentAddressInfo.city = addressInfo.ad_info.city
            currentAddressInfo.province = addressInfo.ad_info.province
            currentAddressInfo.area = addressInfo.ad_info.district
            currentAddressInfo.address_detail = addressInfo.address
        } else if (currentAddressType == 2) {
            currentAddressInfo = {}
            currentAddressInfo.id = -1
            currentAddressInfo.title = addressInfo.title
            currentAddressInfo.address_code = addressInfo.adcode
            currentAddressInfo.city = addressInfo.city
            currentAddressInfo.isDelete = addressInfo.isDelete
            if (addressInfo.address != undefined) {
                currentAddressInfo.name = null
                currentAddressInfo.phone = null
                currentAddressInfo.lat = addressInfo.location.lat
                currentAddressInfo.lng = addressInfo.location.lng
                currentAddressInfo.province = addressInfo.province
                currentAddressInfo.area = addressInfo.area
                currentAddressInfo.address_detail = addressInfo.address_detail
                currentAddressInfo.area = addressInfo.district
                currentAddressInfo.address_detail = addressInfo.address
            } else {
                currentAddressInfo.address_detail = addressInfo.title
            }
        } else if (currentAddressType == 3) {
            currentAddressInfo.id = addressInfo.id
            currentAddressInfo.title = addressInfo.address_1
            currentAddressInfo.name = addressInfo.name
            currentAddressInfo.phone = addressInfo.phone_number
            let lat_lng = addressInfo.lat_lng.split(",")
            currentAddressInfo.lat = lat_lng[0]
            currentAddressInfo.lng = lat_lng[1]
            currentAddressInfo.address_code = addressInfo.code
            currentAddressInfo.city = addressInfo.city
            currentAddressInfo.province = addressInfo.province
            currentAddressInfo.area = addressInfo.area
            currentAddressInfo.address_detail = addressInfo.address_detail
        }
        this.setStationCode('');
        currentAddressInfo.currentAddressType = currentAddressType
        currentAddressInfo.changeFlag = true
        this.globalData.currentAddressInfo = currentAddressInfo
        this.globalData.categoryWithIdInfo = {}
        this.globalData.currentAddressInfoIsDelete = 0
    },
    setCurrentAddressInfoIsDelete: function (currentAddressInfoIsDelete) {
        this.globalData.currentAddressInfoIsDelete = currentAddressInfoIsDelete
    },
    setReceiveAddressInfo: function (addressInfo) {
        this.setCurrentAddressInfo(3, addressInfo);
    },
    getReceiveAddressInfo: function () {
        return this.globalData.currentAddressInfo;
    },
    setCategoryWithIdInfo: function (categoryWithIdInfo) {
        this.globalData.categoryWithIdInfo = categoryWithIdInfo
    },
    getTargetPage() {
        let pages = getCurrentPages()
        let curPage = pages[pages.length - 1]
        return curPage
    },

    // v2版本
    getAddressInfoV2(callbackFn, failCb) {
        const that = this
        addressService.getCurrentAddress().then(function (res) {
            const resData = res.data;
            utils.logi(!utils.gIsEmptyObject(resData.address_info))
            if (!utils.gIsEmptyObject(resData.address_info)) {
                let currentAddressType = 1
                that.setCurrentAddressInfo(currentAddressType, resData.address_info)
                that.setReceiveAddressInfo(resData.address_info)
                let lat_lng = resData.address_info.lat_lng.split(",")
                let data = {
                    lat: lat_lng[0],
                    lng: lat_lng[1]
                }
                addressService.chromeView(data).then(function (res) {
                    const stationCode = res.data
                    that.setStationCode(stationCode.station_code);
                    callbackFn(resData, res)
                })

            } else {
                let currentAddressType = 0
                thirdApi.showToast('定位中', 'loading', 10000)
                thirdApi.getLocation().then(function (locationRes) {
                    servicesUtils.getGeoLocation(locationRes.latitude, locationRes.longitude, 150).then(function (geoRes) {
                        if (!utils.gIsEmptyObject(geoRes.data) && geoRes.data.status === 0) {
                            that.setCurrentAddressInfo(currentAddressType, geoRes.data.data[0])
                            let data = {
                                lat: locationRes.latitude,
                                lng: locationRes.longitude
                            }
                            addressService.chromeView(data).then(function (stationRes) {
                                utils.logi(stationRes.data)
                                const stationCode = stationRes.data
                                that.setStationCode(stationCode.station_code);
                                callbackFn(resData, res)
                                thirdApi.hideToast()
                            })
                        }
                    })
                }, function () {
                    thirdApi.hideToast()
                    let currentPage = that.getTargetPage()
                    if (currentPage.wetoast) {
                        currentPage.wetoast.toast({
                            title: '请求出错啦~',
                            duration: 2000
                        })
                    }
                    failCb()
                })
            }
        }, function () {
            let currentPage = that.getTargetPage()
            if (currentPage.wetoast) {
                currentPage.wetoast.toast({
                    title: '请求出错啦~',
                    duration: 2000
                })
            }
            failCb()
        })
    },

    // requestCategory 是否需要微仓code,默认是需要
    getAddressInfo(callbackFn, requestCategory = true, failCb) {
        const that = this
        addressService.getCurrentAddress().then(function (res) {
            const resData = res.data;
            utils.logi(!utils.gIsEmptyObject(resData.address_info))
            if (!utils.gIsEmptyObject(resData.address_info)) {
                let currentAddressType = 1
                that.setCurrentAddressInfo(currentAddressType, resData.address_info)
                that.setReceiveAddressInfo(resData.address_info)
                utils.logi('------------222222222222222222----------------=')
                if (requestCategory) {
                    categoryService.getAllCategories().then(function (res) {
                        const stationCode = res.data
                        that.setStationCode(stationCode.station_code);
                        callbackFn(resData, res)
                    })
                }
                else {
                    callbackFn(resData)
                }
            } else {
                let currentAddressType = 0
                thirdApi.showToast('定位中', 'loading', 10000)
                thirdApi.getLocation().then(function (locationRes) {
                    servicesUtils.getGeoLocation(locationRes.latitude, locationRes.longitude, 150).then(function (geoRes) {
                        if (!utils.gIsEmptyObject(geoRes.data) && geoRes.data.status === 0) {
                            that.setCurrentAddressInfo(currentAddressType, geoRes.data.data[0])
                            if (requestCategory) {
                                categoryService.getAllCategories().then(function (stationRes) {
                                    utils.logi(stationRes.data)
                                    callbackFn(resData, res)
                                    thirdApi.hideToast()
                                })
                            }
                            else {
                                thirdApi.hideToast()
                                callbackFn(resData)
                            }
                        }
                    })
                }, function () {
                    thirdApi.hideToast()
                    let currentPage = that.getTargetPage()
                    if (currentPage.wetoast) {
                        currentPage.wetoast.toast({
                            title: '请尝试打开微信【位置】权限',
                            duration: 2000
                        })
                    }
                    failCb()
                })
            }
        }, function () {
            let currentPage = that.getTargetPage()
            if (currentPage.wetoast) {
                currentPage.wetoast.toast({
                    title: '请求出错啦~',
                    duration: 2000
                })
            }
            failCb()
        })
    },
    //用于展示授权弹窗
    showWarningModal(successCb, failCb) {
        const that = this
        thirdApi.wxApi('getSetting').then(function (res) {
            if (!res.authSetting["scope.userInfo"]) {
                thirdApi.showModal('是否跳转授权设置页面', '打开【用户信息】授权开关, 开启更多功能~', true, "去设置").then(function (red) {
                    console.log(red)
                    if (red.confirm) {
                        that.globalData.isFromSettingPage = true
                        thirdApi.wxApi('openSetting').then(function (ret) {
                            if (ret.authSetting["scope.userInfo"]) {
                                that.globalData.hasUserInfoRight = true
                                typeof successCb === 'function' && successCb()
                            }
                        })
                    }
                    if (red.cancel) {
                        typeof failCb === 'function' && failCb()
                    }
                })
            } else {
                that.globalData.hasUserInfoRight = true
                typeof successCb === 'function' && successCb()
            }
        })
    },
    onLaunch: function (opt) {

        netManager.initUrlConfig();

        // 线上与测试环境网络检测
        let lastUrl = servicesUtils.storageManager.getLastHostUrl();
        if (lastUrl !== servicesUtils.configs.host) {
            servicesUtils.storageManager.clearAllData();
            servicesUtils.storageManager.setCurrentHostUrl(servicesUtils.configs.host);
        }

        if (!(this.globalData.uuid = servicesUtils.storageManager.getUniqueCode())) {
            let uuid = utils.createUUID();
            servicesUtils.storageManager.storeUniqueCode(uuid);
            this.globalData.uuid = uuid;
        }

        utils.logTimeTag();
        if (opt.scene) {
            this.globalData.scene = opt.scene
        }
        if (opt.query.last_page) {
            this.globalData.isFromBLG = true
            this.globalData.lastPage = opt.query.last_page
        } else if (opt.referrerInfo) {
            if (opt.referrerInfo.appId == 'wx16a6a7a1a70eb37c') {
                // 是否从便利购过来
                this.globalData.isFromBLG = true
                this.globalData.fromSource = 'blg';//从便利购来的
            } else if (opt.referrerInfo && this.globalData.scene == 1037) {//从其它小程序过来时，默认fromSoure取appid
                this.globalData.fromSource = opt.referrerInfo.appId;
            }
            let extrData = opt.referrerInfo.extraData
            if (extrData) {
                if (typeof extrData === 'string') {
                    extrData = JSON.parse(extrData)
                }
                if (extrData.user_type) {
                    let lastPage
                    switch (Number(extrData.user_type)) {
                        // user_type: 1, // 1: 新客, 2: 老客,发红包 , 3: 老客有券
                        case 1:
                            lastPage = 'new_exclusive'
                            break
                        case 2:
                            lastPage = 'redpackage'
                            break
                        case 3:
                            lastPage = 'old_customers'
                            break
                        default:
                            lastPage = ''
                            break
                    }
                    utils.logi('before', lastPage)
                    this.globalData.lastPage = lastPage
                    utils.logi('after', this.globalData.lastPage)
                } else if (extrData.fromSource) {
                    this.globalData.fromSource = extrData.fromSource;
                }
            }
        }
        this.getSystemInfo()
    },
    onShow(opt) {
        if (opt && opt.shareTicket) {
            this.globalData.shareTicket = opt.shareTicket
        } else {
            this.globalData.shareTicket = ''
        }
    },
    onPageNotFound(path, query, isEntryPage) {
        utils.logi("onPageNotFound -> " + path + query + isEntryPage);
        appInteriorSkip.switchTabIndex();
    },
    getPageByMethod(method) {
        //根据方法名获取指定页面,从栈顶开始获取,这个方法不太靠谱，
        //只能获取不重名的方法名。对于有重复的，只会返回最上层的页面
        let pages = getCurrentPages();
        for (let index = pages.length - 1; index >= 0; index--) {
            const page = pages[index];
            if (page.hasOwnProperty(method) && typeof page[method] === 'function') {
                return page;
            }
        }
        return { method: function () { } };
    },
    globalData: {
        // noNetwork:false,
        access_token: '',
        systemInfo: null,
        userInfo: null,
        wxappLogin: null,
        productFromCartInfos: {},
        activeCartChecked: {},
        inactiveCartChecked: {},
        unInvalidActiveCartChecked: {},
        checkoutItems: null,
        currentAddressInfo: {},
        receiveAddressInfo: {},
        // stationCode: '',
        categoryWithIdInfo: {},
        currentAddressInfoIsDelete: 0,
        WeToast,
        addToCart,
        currentCouponIds: [-1, -1, -1], // 使用券的id, 依次为折扣券, 商品券, 红包
        // redpaketId: 0,
        scene: 0,
        productId: 0,
        cartCount: 0, // 购物车总数量
        lastPage: '', // 区分从便利购跳转过来的用户类型
        isFromBLG: false, // 是否是从便利购跳转过来的用户
        lastTimeLogFunctionCallTime: 0,
        startTotalTime: 0, //启动总耗时
        shareTicket: '', // 若有值则是从其他群分享的入口进入的小程序
        groupScanImg: '', // 将用户向群里导流的图片
        userMemberType: 0, // 用户身份, >0 即为会员
        deliveryInfo: { // 配送范围相关信息
            imgUrl: '', // 送达时间
        },
        hasUserInfoRight: false, // 默认用户授权为false
        isFromSettingPage: false, // 是否从设置页面跳转
        miniStartInfo: null,
        shoppingCartInfo: { //用于存储购物车的相关缓存信息

        },
        uuid: '',//设备ID
        user_type:-1,//是否会员0:非会员(未登陆)、1:老卡、2:优享会员体验卡、3:优享会员    (这是现有字段)
    }
})