//web_promotion.js
const app = getApp()
const activePage = require('../../../utils/services/active_page.js')
const cartService = require('../../../utils/services/cart.js')
const updateCartItem = require('../../../utils/custom/update_cart_item.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const addressService = require('../../../utils/services/address.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const utils = require('../../../utils/util.js')
const bannerSkip = require('../../../utils/custom/banner_skip.js')
const servicesUtils = require('../../../utils/service_utils')
const userInfoService = require('../../../utils/services/userinfo')

Page({
    data: {
        jwebPromotionData: null,
        productFromCartInfos: null,
        cartCount: 0,
        options: null,
        promotionTags: [],
        miniStartInfo: null,
        priceTagWidth: 0,
    },
    onLoad: function (options) {
        utils.logi(" ------------------------------activePage.web_promotion.onload------------------------------ ")
        this.setData({
            options: options
        })
        this.initPage()
        new app.globalData.WeToast()        
    },
    onShow () {
        this.syncCart()
    },
    syncCart () {
        let productFromCartInfos = app.globalData.productFromCartInfos
        this.setData({
            productFromCartInfos: productFromCartInfos,
            cartCount: app.globalData.cartCount            
        })
    },
    initPage () {
        const that = this
        if (!app.globalData.wxappLogin) {
            thirdApi.showToast('加载中...', 'loading', 10000)
            app.getUserInfo(wxappLogin => {
                utils.logi(wxappLogin)
                app.globalData.wxappLogin = wxappLogin
                addressService.getCurrentAddress().then(function (res) {
                    const resData = res.data;
                    // utils.logi("getCurrentAddressAndShowAllCategories.getCurrentAddress.res", resData)
                    if (!utils.gIsEmptyObject(resData.address_info)) {
                        let currentAddressType = 1
                        // 将地址信息同步到全局信息中
                        app.setCurrentAddressInfo(currentAddressType, resData.address_info)
                        that.setData({
                            currentAddressInfo: app.globalData.currentAddressInfo
                        })
                        app.setReceiveAddressInfo(resData.address_info)
                        // utils.logi('------------222222222222222222----------------=')
                        that.getPageData()
                    } else {
                        let currentAddressType = 0
                        thirdApi.showToast('定位中', 'loading', 10000)
                        // 调用第三方定位系统
                        thirdApi.getLocation().then(function (loacationRes) {
                            // 根据返回位置信息获取地址
                            servicesUtils.getGeoLocation(loacationRes.latitude, loacationRes.longitude, 150).then(function (geoRes) {
                                if (!utils.gIsEmptyObject(geoRes.data) && geoRes.data.status === 0) {
                                    app.setCurrentAddressInfo(currentAddressType, geoRes.data.data[0])
                                    // utils.logi('--------------location address=', geoRes.data.data[0])
                                    that.setData({
                                        currentAddressInfo: app.globalData.currentAddressInfo
                                    })
                                    thirdApi.hideToast()
                                    that.getPageData()
                                }
                            })
                        }, function (err) {
                            thirdApi.hideToast()
                            that.wetoast.toast({ title: '请尝试打开微信【位置】权限', duration: 2000 })
                        })
                    }
                })
            })
        } else {
            this.getPageData()
        }
    },
    getPageData () {
        const that = this
        that.miniStart()        
        let options = this.data.options
        if (options != undefined && options != null) {
            if (options.isInteriorSkip != 1) {
                // 如果不是内部跳转过来的, 则表示是从便利购过来的, 需先解析字符串再做请求
                options = bannerSkip.getRequestList(decodeURIComponent(options.link))
                // options.getPrmFromUrl = 1 // 表示服务端从接口链接中解析station_code和address_code
                // options.promotion_type = 'newUserPromotion' // 为新人专享页
                // options.station_code = ''
            }
            activePage.jwebPromotion(options).then(function (res) {
                thirdApi.hideToast()
                let resData = res.data
                that.setData({
                    jwebPromotionData: resData
                })
            })
            if (app.globalData.isFromBLG) {
                that.getPoductFromCartInfos()
            }
        }
    },
    subscribeArrivalRemind (event) {
        let sku = event.currentTarget.dataset.productSku
        let formId = event.detail.formId
        let dataList = {
            sku: sku
        }
        // this.addToStorage(sku)
        const that = this
        cartService.subscribeArrivalRemind('WX', dataList, formId).then(function (res) {
            const resData = res.data
            // utils.logi("subscribeArrivalRemind.subscribeArrivalRemind.res", resData)
            if (resData.code === 0) {
                thirdApi.showModal(resData.data.title, resData.data.content, false).then(function (res) {
                    if (res.confirm) {
                        // utils.logi("subscribeArrivalRemind.showModal.event", event)
                    }
                })
            } else if (resData.code === 1) {
                // thirdApi.showToast(resData.data.msg, 'sucess', 2000)
                that.wetoast.toast({ title: resData.msg, duration: 1500 })
            } else {
                thirdApi.showToast('已订阅成功！', 'sucess', 2000)
                // this.wetoast.toast({title:'已订阅成功！' , duration: 2000 })
            }
        })
    },
    addToCart: function (event) {
        // event.stopPropagation();
        // utils.logi("addToCart.event", event);
        let dataset = event.currentTarget.dataset        
        let productSku = dataset.productSku
        let productIndex = dataset.productIndex
        let pTitle = dataset.productTitle
        let quantity = dataset.quantity || 0
        if (app.globalData.isFromBLG) {
            requestAna('add_shopping_cart', 'new_exclusive', {
                action: '+',
                sku: productSku,
                p_title: pTitle,
                pos: productIndex + '',
                num: '1'
            })
        }
        if (this.checkQuantity(productSku)) {
            this.updateCartItem(productSku, 1, 1)
        }
    },
    decrease: function (event) {
        if (app.globalData.isFromBLG) {
            let dataset = event.currentTarget.dataset
            let productSku = dataset.productSku
            let productIndex = dataset.productIndex
            let pTitle = dataset.productTitle
            // let quantity = dataset.quantity || ''
            requestAna('shopping_cart', 'applet_index', {
                action: '-',
                sku: productSku,
                p_title: pTitle,
                pos: productIndex + '',
                num: '1'
            })
        }
        updateCartItem.decrease(event)
    },
    chooseProduct: function (event) {
        // 根据sku跳转到对应商品详情页
        // utils.logi("chooseProduct.event", event);
        let dataset = event.currentTarget.dataset
        let productSku = dataset.productSku
        let pTitle = dataset.productTitle
        let dataList = {
            productSku: event.currentTarget.dataset.productSku,
            channel: this.data.selectCategoryId
        }
        appInteriorSkip.productDetail(dataList)
    },
    checkQuantity: function (productSku) {
        let products = this.data.products
        let productFromCartInfo = app.globalData.productFromCartInfos[productSku]
        let quantity = productFromCartInfo == undefined ? 0 : productFromCartInfo.quantity
        let sign = true
        // for循环一个列表对性能有一定影响
        this.data.jwebPromotionData.productList.forEach((item, index) => {
            if (!item.products || item.products && item.products.length == 0) return 
            item.products.forEach((product, index) => {
                if (product.sku === productSku) {
                    if (product.stock <= 0) {
                        this.wetoast.toast({ title: '该产品已售罄', duration: 2000 })
                        sign = false
                        return false
                    } else if (quantity >= product.stock) {
                        this.wetoast.toast({ title: '只剩' + product.stock + '份啦~', duration: 2000 })
                        sign = false
                        return false
                    } else if (product.seckill_limit && quantity >= product.seckill_limit) {
                        this.wetoast.toast({ title: '活动期间本商品限购' + product.seckill_limit + '份', duration: 2000 })
                        sign = false
                        return false
                    }
                }
            })
        })
        return sign
    },
    updateCartItem: function(productId, quantity, addType) {
        // 加减商品数量的时候同步到购物车
        updateCartItem.updateCartItem(productId, quantity, addType)
    },
    reloadCartItems (cartItems) {
        let productFromCartInfos = app.globalData.productFromCartInfos
        let productFromCart = {}
        for (let key in cartItems) {
            let activeCartChecked = app.globalData.activeCartChecked
            activeCartChecked[key] = true
            productFromCart['sku'] = key
            productFromCart['isActive'] = 1
            productFromCart['quantity'] = cartItems[key]
            productFromCartInfos[key] = productFromCart
        }
        app.setProductFromCartInfos(productFromCartInfos)
        this.setData({
            productFromCartInfos: productFromCartInfos,
            cartCount: app.globalData.cartCount
        })
    },
    getPoductFromCartInfos: function () {
        const that = this
        return cartService.getAllCartItems().then(function (res) {
            // utils.logi('received cart items: ', res.data)
            const getAllCartItemsData = res.data
            let allCartItemsData = {}
            for (let index = 0; index < getAllCartItemsData.length; ++index) {
                // old 为次日达商品
                if (getAllCartItemsData[index].trans_type === 'old') {
                    allCartItemsData = getAllCartItemsData[index];
                }
            }
            const activeCartItems = allCartItemsData.active_item
            const inactiveCartItems = allCartItemsData.inactive_item
            let productFromCartInfos = {} // 新建一个购物车对象并替换之前的
            let productSku = ''
            let productFromCart = {}
            // 获取购物车有效商品列表
            for (let m = 0; m < activeCartItems.length; ++m) {
                let activeCartItem = activeCartItems[m]
                productSku = activeCartItem.sku
                productFromCart = {}
                productFromCart['sku'] = productSku
                productFromCart['isActive'] = 1
                productFromCart['quantity'] = activeCartItem.quantity
                productFromCartInfos[productSku] = productFromCart
            }
            // 获取无效商品列表 
            for (let n = 0; n < inactiveCartItems.length; ++n) {
                let inactiveCartItem = inactiveCartItems[n]
                productSku = inactiveCartItem.sku
                productFromCart = {}
                productFromCart['sku'] = productSku
                productFromCart['isActive'] = 2
                productFromCart['quantity'] = inactiveCartItems.quantity
                productFromCartInfos[productSku] = productFromCart
            }
            app.setProductFromCartInfos(productFromCartInfos)
            that.setData({
                productFromCartInfos: productFromCartInfos,
                cartCount: app.globalData.cartCount
            })
        });
    },
    cartClick () {
        appInteriorSkip.switchTabCart()        
    },
    getHeight (width, height) {
        if (!width || !height) {
            return 0
        }
        return 750 * (height / width)
    },
    goToIndexPage () {
        requestAna('applet_get_into', 'new_exclusive')
        appInteriorSkip.switchTabIndex()
    },
    bannerClick (event) {
        utils.logi(event)
        bannerSkip.bannerSkip(event.currentTarget.dataset.banner)
    },
    getWidth (event) {
        // 标签宽度根据高度自适应
        let width = 0
        let height = 64 // 单位为rpx
        let productIndex = event.currentTarget.dataset.index
        let imgWidth = event.detail.width
        let imgHeight = event.detail.height
        let windowWidth = app.globalData.systemInfo.windowWidth
        let promotionTags = this.data.promotionTags
        width = imgWidth / imgHeight * height
        promotionTags[productIndex] = {
            width
        }
        this.setData({
            promotionTags
        })
    },
    miniStart () {
        if (this.data.miniStartInfo) return 
        // 由于接口调用用到了service_utils中的getRequestUrl()方法, 其中用到了app实例, 但是在app的onLaunch时, app实例还未生成, 会导致报错, 所以不能在onLaunch阶段调用此方法
        userInfoService.miniStart().then(res => {
            app.globalData.miniStartInfo = res.data
            this.setData({
                miniStartInfo: app.globalData.miniStartInfo
            })
        })
    },
    getPriceTagWidth (event) {
        let width = 0
        let height = 22
        let imgWidth = event.detail.width
        let imgHeight = event.detail.height
        width = imgWidth / imgHeight * height
        this.setData({
            priceTagWidth: width
        })
    }
})
