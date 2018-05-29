//index.js
const app = getApp()
const appInteriorSkip = require('../../utils/services/app_interior_skip.js')
const categoryService = require('../../utils/services/categories.js')
const cartService = require('../../utils/services/cart.js')
const addressService = require('../../utils/services/address.js')
const thirdApi = require('../../utils/services/third_api.js')
const redPacketService = require('../../utils/services/red_packet.js')
const bannerSkip = require('../../utils/custom/banner_skip.js')
const utils = require('../../utils/util.js')
const { reconnect } = require('../../utils/templates/no_network/no_network.js')
const redPacket = require('../../utils/templates/red_packet/red_packet.js')
const updateCartItem = require('../../utils/custom/update_cart_item.js')
const compressImageUtils = require('../../utils/services/compress_image_utils.js')
const requestAna = require('../../utils/service_utils.js').requestAna
const serviceUtils = require('../../utils/service_utils');
const groupRedPacketService = require('../../utils/services/group_redpackage');
const userInfoService = require('../../utils/services/userinfo');
const netManager = require('../../utils/services/net_manager');
const productItemHelper = require('../../utils/services/product_item_helper');
Page({
    data: {
        userInfo: {},
        categories: [],
        // categoriesLength: 0,
        selectCategoryId: '',
        categoryName: '',
        selectCategoryIdPosition: 0,
        current: 0,
        products: [],
        productStore: [],
        banners: [],
        // allRegionLists: [],
        bannerIndicatorDots: false,
        bannerAutoplay: true,
        interval: 5000,
        duration: 1000,
        productFromCartInfos: {},
        activeCartItems: {},
        inactiveCartItems: {},
        currentAddressInfo: null,
        wxappLogin: null,
        showLines: 1,
        touchMoveEvent: {},
        indexIsLoad: 0,
        isLoad: 0,
        redPacket: {},
        isShowPop: -1,
        isEmpty: false,
        // isSwitchTabCart: false,
        network: {
            reconnecting: false,
            noNetwork: false
        },
        shareData: {},
        firstLoad: true,
        dialogOptions: {
            isShowMask: true,
            transparent: false,
            hasCloseBtn: true
        },
        isShowDialog: false,
        redPacketImg: '', // 新人红包图片url
        bannerIndex: 1, // banner角标
        initBannerIndex: 0, // bannerIndex初始化
        // lazyloadTimeout: null, // 商品懒加载延时定时器, 作用是为了防止dom不规律更新
        showNoMoreProduct: false, // 是否展示"没有更多商品啦"的文案
        deliveryInfo: {}, // 配送范围信息
        isShowGroupRedPacketIcon: false, // 是否展示拼红包入口
        showNoAddressRules: false,//是否显示无地址权限页面
        miniStartInfo: null,
        priceTagWidth: 0, // 价格标签宽度
        advert_list: [],//广告列表,
        coupon_list: [],//资产列表
        isShowCoupon: 0,//弹屏传值
        adverType: '',//弹屏类型
        bearImageUrl: '', // 小熊


        //瓷片位
        liveTiles: [{}, {}, {}, {}, {}],
        liveTileLargeCardHeight: 0,
        liveTileLargeCardWidth: 0,
        liveTileContainerHeight: 0,
        //瓷片位1个宽度
        liveTileWidthUnit: 0,
        //瓷片位1个高度
        liveTileHeightUnit: 0,
        bearImageUrl:'', // 小熊

    },
    _data: {
        categoryStore: {}, // 缓存商品数据
        //瓷片位卡片高度,用于计算
        liveTileLargeCardHeight: 0,
        //整个瓷片位高度,用于计算
        liveTileContainerHeight: 0,
    },
    /* 页面初始化 */
    onLoad: function (params) {

        netManager.mountAuthInitData();
        productItemHelper.mountProductMethod();

        const that = this
        this.setData({
            shareData: params
        })
        // 查看url中是否设置了默认频道
        let categoryName = this.getCategoryName(params.defaultCategory)
        if (categoryName) {
            this.setData({
                categoryName: categoryName
            })
        }

        // 通过扫描带参二维码进入的用户会给一个fromSource的标记
        if (params.fromSource) {
            app.globalData.fromSource = params.fromSource
        }

        // 页面加载时候新建一个toast实例
        new app.globalData.WeToast()
        // 初始化加车动画实例
        new app.globalData.addToCart();
        this.setData({
            firstLoad: true
        })

        this.checkQuery()
        utils.logTimeTag();
    },
    onReady: function () {
      
    },
    /* 页面展示 */
    onShow: function () {
        utils.logTimeTag();
        /* if (app.globalData.currentAddressInfo.changeFlag || this.data.needRefresh) {
            thirdApi.showToast('商品加载中', 'loading', 10000)
            this.setData({
                isLoad: 0
            })
            this.getCurrentAddressAndShowAllCategories()
        } */

        utils.logTimeTag();
        if (!app.globalData.isFromSettingPage) {
            this.initPage()
        }
        thirdApi.updateCartNum(app.globalData.cartCount);
        
    },
    /* 初始化数据 */
    initPage() {

        utils.logTimeTag();

        const that = this
        if (app.globalData.wxappLogin && this.data.indexIsLoad == 0) {
            utils.logTimeTag();
            // 红包接口
            that.getStatusOfGroupRedPacket()
            that.miniStart()
            that.getCurrentAddressAndShowAllCategories()
        } else if (!app.globalData.wxappLogin) {
            utils.logTimeTag();
            app.getUserInfo(function (wxappLogin) {
                that.getStatusOfGroupRedPacket()
                // that.miniStart()
                utils.logTimeTag("-- getUserInfo -- ");
                that.setData({
                    wxappLogin: wxappLogin
                })
                // 获取到accessToken之后调取商品信息
                that.getCurrentAddressAndShowAllCategories()
                // if (that.data.isShowPop != -1) {
                //     return;
                // }

                //添加弹窗逻辑
                userInfoService.miniStart().then(res => {
                    if (res.data.code == 0) {
                        app.globalData.miniStartInfo = res.data
                        that.setData({
                            miniStartInfo: app.globalData.miniStartInfo
                        })
                        if (res.data.showNewUserPopInfo.isShowNewUserPop == 1 && res.data.showNewUserPopInfo.userHaveOrder == 0) {
                            that.showRedPacket()
                        } else {
                            that.getAdvertInfoCoupon();
                        }
                    }
                })

                // // 每天只弹一次的限制逻辑   ===>  每个用户终生只会弹出一次  
                // if (serviceUtils.storageManager.getIndexPopDate()) {
                //     return
                // }
                // redPacketService.showRedPacket().then(function (res) {
                //     console.log(res)
                //     // 当res.data.is_show_pop值为 1 时, 展示弹窗, 默认不展示
                //     // 每天只弹一次的限制逻辑
                //     if (res.data.is_show_pop == 1) {
                //         serviceUtils.storageManager.setIndexPopDate(utils.getNowFormatDate());
                //         if (res.data.showPopImg) {
                //             that.setData({
                //                 isShowDialog: true,
                //                 redPacketImg: res.data.showPopImg
                //             })
                //             return
                //         }
                //     }
                //     that.setData({
                //         redPacket: res.data,
                //         isShowPop: res.data.is_show_pop
                //     })
                //     setTimeout(function () {
                //         that.setData({
                //             'redPacket.bigger': 'bigger'
                //         })
                //     }, 500)
                // })
            }, function (err) {
                //网络请求失败
                that.setData({
                    'network.noNetwork': true,
                })
            }, function (err) {
                //这个回调是授权失败，再尝试地理位置授权
                //当获取用户信息失败之后，通过定位拉取货架信息
                that.requestProductInfoByPosition();
            })
        } else if (app.globalData.currentAddressInfo.changeFlag || this.data.needRefresh) {
            thirdApi.showToast('商品加载中', 'loading', 10000)
            that.setData({
                isLoad: 0
            })
            that.data.selectCategoryId = null;
            that.getCurrentAddressAndShowAllCategories()
            that.getStatusOfGroupRedPacket()
        }

        // 需要获取到购物车的商品, 并且将商品数量同步
        let productFromCartInfos = app.globalData.productFromCartInfos
        this.setData({
            productFromCartInfos: productFromCartInfos
        })
    },
    submitInfo: function () {
        console.log(234)
    },
    /* 分享 */
    onShareAppMessage: function () {
        return {
            title: '每日优鲜',
            desc: '"我发现一个买生鲜的好地方，2小时就能送到！"',
            path: '/pages/index/index'
        }
    },
    /* 下拉刷新 */
    onPullDownRefresh: function (event) {
        // console.log("onPullDownRefresh.event", event)
        const that = this
        // app.globalData.categoryWithIdInfo = {}
        /* app.getUserInfo(function (wxappLogin) {
            that.setData({
                wxappLogin: wxappLogin
            })
            if (wxappLogin != null) {
                that.getCurrentAddressAndShowAllCategories()
            }
        }) */
        this.loadProducts(this.data.selectCategoryId, true)
    },
    onReachBottom() {
        this.loadMoreProduct(this.data.selectCategoryId)
    },
    //新人红包
    showRedPacket() {
        const that = this;
        // 每天只弹一次的限制逻辑   ===>  每个用户终生只会弹出一次  
        if (serviceUtils.storageManager.getIndexPopDate()) {
            //新人红包弹过之后，不弹新人红包，走资产和广告
            that.getAdvertInfoCoupon();
            return
        }
        redPacketService.showRedPacket().then(function (res) {
            console.log(res)
            // 当res.data.is_show_pop值为 1 时, 展示弹窗, 默认不展示
            // 每天只弹一次的限制逻辑
            if (res.data.is_show_pop == 1) {
                serviceUtils.storageManager.setIndexPopDate(utils.getNowFormatDate());
                if (res.data.showPopImg) {
                    that.setData({
                        isShowDialog: true,
                        redPacketImg: res.data.showPopImg
                    })
                    return
                }
            } else {
                that.getAdvertInfoCoupon();
                return
            }
            that.setData({
                redPacket: res.data,
                isShowPop: res.data.is_show_pop
            })
            setTimeout(function () {
                that.setData({
                    'redPacket.bigger': 'bigger'
                })
            }, 500)
        })
    },
    miniStart() {
        if (this.data.miniStartInfo) return
        // 由于接口调用用到了service_utils中的getRequestUrl()方法, 其中用到了app实例, 但是在app的onLaunch时, app实例还未生成, 会导致报错, 所以不能在onLaunch阶段调用此方法
        if (app.globalData.miniStartInfo) {
            this.setData({
                miniStartInfo: app.globalData.miniStartInfo
            })
        } else {
            userInfoService.miniStart().then(res => {
                app.globalData.miniStartInfo = res.data
                this.setData({
                    miniStartInfo: app.globalData.miniStartInfo
                })
            })
        }
    },
    /* 拉取当前地区首页数据[home/index] */
    getAllCategories: function () {
        requestAna('applet_get_into', 'applet_index')
        // 拉取货架信息以及默认货架的商品
        const that = this
        utils.logTimeTag();
        if (app.globalData.currentAddressInfo.changeFlag || this.data.selectCategoryId === '') {
            utils.logTimeTag();

            categoryService.getAllCategories().then(function (res) {
                utils.logTimeTag("-- categoryService.getAllCategories().then --");

                thirdApi.hideToast()
                const getAllCategoriesData = res.data;

                // 数据请求失败时展示预定占位图
                if (getAllCategoriesData.code != 0) {
                    that.wetoast.toast({ title: getAllCategoriesData.msg || '网络出错了, 请稍后重试~', duration: 2000 })
                    that.setData({
                        isEmpty: true,
                        indexIsLoad: 1,
                        firstLoad: false,
                    })
                    return
                }
                // 后端已做过滤, 前端不再判定
                // 如果是全国送地区, 则直接展示为未覆盖区域, type: 2(全国送)
                /* if (getAllCategoriesData.type == 2) {
                    that.setData({
                        isEmpty: true,
                        indexIsLoad: 1,
                        firstLoad: false
                    })
                    return
                } */

                // ================= 图片大小质量处理 =================
                compressImageUtils.compressCategoryBackImage(getAllCategoriesData.category_list);
                if (getAllCategoriesData.banner_bg_img) {
                    getAllCategoriesData.banner_bg_img = compressImageUtils.compressImage(getAllCategoriesData.banner_bg_img);
                }
                compressImageUtils.compressBannerImage(getAllCategoriesData.product_list.banner);

                //瓷片位
                // compressImageUtils.compressCategoryAreas(getAllCategoriesData.product_list.category_areas);

                // ================= 图片大小质量处理 =================

                // 如果wx_app_new_img有值, 则表示是新人, 弹出新人弹窗
                if (getAllCategoriesData.wx_app_new_img) {
                    that.setData({
                        redPacketImg: getAllCategoriesData.wx_app_new_img,
                        isShowDialog: true
                    })
                }
                let categoryList = getAllCategoriesData.category_list
                // 若从推广链接进入频道,则取链接内的频道id作为默认频道页
                let defaultInternalId = that.getDefaultCategoryId(categoryList, that.data.categoryName)
                let selectCategoryId = defaultInternalId || getAllCategoriesData.default_category
                // 当前频道全部商品
                let products = getAllCategoriesData.product_list.products
                that.cutImage(products)
                // 当前频道一级banner
                // let banners = getAllCategoriesData.product_list.banner
                // <<<<<<根据数据计算banner高度
                // let bannerHeight = that.getBannerHeight(banners)
                // >>>>>>
                let showLines = getAllCategoriesData.show_lines
                // if (products === undefined) {
                //     products = []
                //     banners = []
                // }
                // let selectCategoryIdPosition = 0
                let current = that.getCurrentCategoryIndex(categoryList, selectCategoryId)
                that.scrollCategory(current)
                if (defaultInternalId) {
                    that.loadProducts(defaultInternalId)
                } else {

                    //瓷片位字体颜色转换
                    if (getAllCategoriesData.product_list.categoryAreaV2) {
                        let tempLiveTiles = getAllCategoriesData.product_list.categoryAreaV2;
                        let tileArray = tempLiveTiles.lanternArea;
                        let tileArrayLength = tileArray.length;
                        for (let index = 0; index < tileArrayLength; index++) {
                            const element = tileArray[index];
                            element.color = utils.deciToHex(element.color);
                        }
                    }

                    that._data.categoryStore[getAllCategoriesData.default_category] = getAllCategoriesData.product_list
                    that.drawView(getAllCategoriesData.product_list, getAllCategoriesData.default_category)
                }
                // let preProducts = products.splice(0, 15)
                let isEmpty = !products.length


                that.setData({
                    indexIsLoad: 1,
                    categories: categoryList,
                    selectCategoryId: selectCategoryId,
                    // products: preProducts,
                    // productStore: products,
                    // banners: banners,
                    showLines: showLines,
                    current: current,
                    isEmpty,
                    // bannerHeight,
                    'network.noNetwork': false,
                    // isLoad: 1,
                    //尽早的将页面展示出来
                    firstLoad: false,
                });

                // app.setCategoryWithIdInfo(categoryWithIdInfo) // 减少全局变量占用空间 | 更改数据刷新机制, 不再对数据进行缓存, 以免影响库存量刷新
                app.setStationCode(getAllCategoriesData.station_code);
                // 拉取最新购物车数据
                that.getPoductFromCartInfos()
                utils.logTimeTag();

                if (app.globalData.currentAddressInfo.changeFlag) {
                    wx.pageScrollTo({
                        scrollTop: 0
                    })
                }

                app.globalData.currentAddressInfo.changeFlag = false
                that.chromeView()
            }, function (res) {
                utils.logTimeTag();
                that.setData({
                    'network.noNetwork': true,
                })
            }).catch(function () {
                thirdApi.hideToast()
            });
        } else {
            utils.logTimeTag();
            this.loadProducts(this.data.selectCategoryId)
        }
    },
    /* 已弃用,延迟1.5秒添加全部商品信息,改成上拉加载 */
    /* lazyloadProducts (products) {
        if (this.data.lazyloadTimeout) {
            clearTimeout(this.data.lazyloadTimeout)
            this.data.lazyloadTimeout = null
        }
        this.data.lazyloadTimeout = setTimeout(() => {
            // console.log(products)
            this.setData({
                products: products,
                showNoMoreProduct: true
            })
        }, 1500)
    }, */
    /* 通过/v3/product/category/接口拉取频道数据 */
    loadProducts: function (categoryId, isRefresh = false) {
        utils.logTimeTag();
        const that = this;
        const categoryStore = this._data.categoryStore

        this.getPoductFromCartInfos()
        // 有缓存先取缓存, 否则会拉取新的数据并缓存下来
        if (categoryStore[categoryId] && !isRefresh) {
            this.drawView(categoryStore[categoryId], categoryId)
            return
        }
        utils.logTimeTag();
        thirdApi.showToast('卖力加载中...', 'loading', 10000)
        categoryService.getCategoryWithId(categoryId).then(function (res) {
            thirdApi.hideToast()
            utils.logTimeTag();
            let products = res.data.products
            that.cutImage(products)

            categoryStore[categoryId] = res.data

            that.drawView(res.data, categoryId)
            wx.stopPullDownRefresh()
        }, function () {
            utils.logTimeTag();
            that.setData({
                'network.noNetwork': true,
                // 'network.reconnecting': true
            })
            thirdApi.hideToast();
            wx.stopPullDownRefresh()
        }).catch(function (res) {
            // console.log("loadProducts.getCategoryWithId.catch", res)
        })

    },
    drawView(fragmentPageData, categoryId) {
        let banners = fragmentPageData.banner
        let products = fragmentPageData.products
        let currentCategoryId = this.data.selectCategoryId
        if (products === undefined) {
            products = []
            banners = []
        }
        let bannerHeight = this.getBannerHeight(banners)
        // 高并发时频道内容出错
        if (currentCategoryId == categoryId || !currentCategoryId) {
            thirdApi.hideToast()
            let preProducts = products.slice(0, 15)
            utils.logTimeTag();

            const that = this;

            this.setData({
                products: preProducts,
                // productStore: products,
                banners: banners,
                bannerIndex: 1,
                initBannerIndex: 0,
                'network.noNetwork': false,
                isLoad: 1,
                firstLoad: false,
                bannerHeight,
                //瓷片位信息
                liveTiles: fragmentPageData.categoryAreaV2 ? fragmentPageData.categoryAreaV2 : {
                    isShow: 0,
                },

            })
        }
    },
    /* 绑定上拉加载事件 */
    loadMoreProduct(selectCategoryId) {
        let productStore = this._data.categoryStore[selectCategoryId] && this._data.categoryStore[selectCategoryId].products || []
        let products = this.data.products
        if (productStore.length == products.length) {
            this.setData({
                showNoMoreProduct: true
            })
            return
        }
        products = products.concat(productStore.slice(products.length, products.length + 15))
        this.setData({
            products
        })
    },
    /* 同步购物车信息 */
    getPoductFromCartInfos: function () {
        const that = this
        return cartService.getAllCartItems().then(function (res) {
            // console.log('received cart items: ', res.data)
            const getAllCartItemsData = res.data
            let allCartItemsData = {}
            let activeCartChecked = app.globalData.activeCartChecked || {}
            // let newActiveCartChecked = {}
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
                if (activeCartChecked[productSku] === undefined) {
                    activeCartChecked[productSku] = true
                }
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
                isLoad: 1,
                firstLoad: false
            })
        });
    },
    reloadCartItems: function (cartItems) {
        let productFromCartInfos = app.globalData.productFromCartInfos
        let productFromCart = {}
        for (let key in cartItems) {
            // console.log("reloadCartItems.resData", cartItems, key, cartItems[key], productFromCartInfos)
            if (key == 'out_of_limit') { continue; }
            let activeCartChecked = app.globalData.activeCartChecked
            activeCartChecked[key] = true
            productFromCart['sku'] = key
            productFromCart['isActive'] = 1
            productFromCart['quantity'] = cartItems[key]
            productFromCartInfos[key] = productFromCart
            // console.log("reloadCartItems", key, productFromCartInfos)
        }
        app.setProductFromCartInfos(productFromCartInfos)
        this.setData({
            productFromCartInfos: productFromCartInfos
        })
        // console.log("reloadCartItems", this.data)
    },
    /* 跳转商品详情页 */
    chooseProduct: function (event) {
        // 根据sku跳转到对应商品详情页
        // console.log("chooseProduct.event", event);
        let dataset = event.currentTarget.dataset
        let productSku = dataset.productSku
        let pTitle = dataset.productTitle
        requestAna('click_product_details', 'applet_index_product', {
            channel: this.data.selectCategoryId,
            sku: productSku,
            p_title: pTitle,
        })
        let dataList = {
            productSku: event.currentTarget.dataset.productSku,
            channel: this.data.selectCategoryId
        }
        appInteriorSkip.productDetail(dataList)
    },
    /* 首页加车 */
    addToCart: function (event) {
        const that = this
        // event.stopPropagation();
        if (!app.globalData.hasUserInfoRight) {
            app.showWarningModal(() => {
                that.initPage()
                addCart()
            }, () => {
                this.wetoast.toast({
                    title: '授权失败, 部分功能不可用~~'
                })
            })
        } else {
            addCart()
        }
        function addCart() {
            let dataset = event.currentTarget.dataset
            let productSku = dataset.productSku
            let productIndex = dataset.productIndex
            let pTitle = dataset.productTitle
            let seckillLimit = dataset.seckillLimit
            let stock = dataset.stock
            let quantity = dataset.quantity || 0
            requestAna('shopping_cart', 'applet_index', {
                action: '+',
                channel: that.data.selectCategoryId,
                sku: productSku,
                p_title: pTitle,
                pos: productIndex + '',
                num: '1'
            })
            if (that.checkQuantity(productSku, quantity, stock, seckillLimit)) {
                that.updateCartItem(productSku, 1, 1)
                // 去掉加车动画, 影响体验
                /* let version = app.globalData.systemInfo.version || '0.0.0'
                let vPart = version.split('.').map(v => parseInt(v))
                let vNum = 100 * vPart[0] + 10 * vPart[1] + vPart[2]
                let vMust = 100 * 6 + 10 * 5 + 2 // 6.5.2
                // 只有微信6.5.2支持分段动画
                if (vNum >= vMust) {
                    this.animateAddToCart(productIndex)
                } */
                //购物车抛物动画 (时间间隔)(解决点击过于频繁时)
                let nowTime = new Date().getTime();
                let clickTime = that.data.ctime;
                if (clickTime != 'undefined' && (nowTime - clickTime < 800)) {
                  // thirdApi.showToast('操作过于频繁', 'loading', 1000)
                  return;
                }else{
                  that.setData({
                    ctime: nowTime
                  })
                  // 测试加车动画
                  let systemInfo = app.globalData.systemInfo;
                  let endX = systemInfo.windowWidth / 8*5,
                    endY = systemInfo.windowHeight + 20;
                  that.addcart.animateAddToCart(`#product-item-img-${productIndex}`, endX, endY)
                }
            }
        }
    },
    //获取formid
    // pushFormSubmit :function(event){
    //     let formId = event.detail.formId
    //     console.log(event)
    // },
    /* 首页减车 */
    decrease: function (event) {
        let dataset = event.currentTarget.dataset
        let productSku = dataset.productSku
        let productIndex = dataset.productIndex
        let pTitle = dataset.productTitle
        // let quantity = dataset.quantity || 0
        requestAna('shopping_cart', 'applet_index', {
            action: '-',
            channel: this.data.selectCategoryId,
            sku: productSku,
            p_title: pTitle,
            pos: productIndex + '',
            num: '1'
        })
        updateCartItem.decrease(event)
    },
    /* 点击订阅提醒 */
    subscribeArrivalRemind: function (event) {
        // console.log("subscribeArrivalRemind.event", event)
        if (!app.globalData.hasUserInfoRight) {
            app.showWarningModal(() => {
                that.initPage()
            }, () => {
                this.wetoast.toast({
                    title: '授权失败, 部分功能不可用~~'
                })
            })
            return
        }
        let sku = event.currentTarget.dataset.productSku
        let formId = event.detail.formId
        let dataList = {
            sku: sku
        }
        // this.addToStorage(sku)
        const that = this
        cartService.subscribeArrivalRemind('WX', dataList, formId).then(function (res) {
            const resData = res.data
            // console.log("subscribeArrivalRemind.subscribeArrivalRemind.res", resData)
            if (resData.code === 0) {
                thirdApi.showModal(resData.data.title, resData.data.content, false).then(function (res) {
                    if (res.confirm) {
                        // console.log("subscribeArrivalRemind.showModal.event", event)
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
    /* 检查库存[包括限购及其他状态] */
    checkQuantity: function (productSku, quantity, stock, seckillLimit) {
        // let products = this.data.products
        // let productFromCartInfo = this.data.productFromCartInfos[productSku]
        // console.log(productFromCartInfo)
        // let quantity = productFromCartInfo == undefined ? 0 : productFromCartInfo.quantity
        // console.log("checkQuantity", quantity)
        // for循环一个列表对性能有一定影响
        // for (let i = 0; i < products.length; ++i) {
        //     let product = products[i]
        //     if (product.sku === productSku) {
        //     }
        // }
        if (stock <= 0) {
            this.wetoast.toast({ title: '该产品已售罄', duration: 2000 })
            return false
        } else if (quantity >= stock) {
            this.wetoast.toast({ title: '只剩' + stock + '份啦~', duration: 2000 })
            return false
        } else if (seckillLimit && quantity >= seckillLimit) {
            this.wetoast.toast({ title: '活动期间本商品限购' + seckillLimit + '份', duration: 2000 })
            return false
        }
        return true
    },
    /* 更新购物车数据 */
    updateCartItem: function (productId, quantity, addType) {
        // const that = this
        // let productLists = [{
        //     sku: productId,
        //     quantity: quantity
        // }]
        // cartService.addToCarts(productLists, addType).then(function(res) {
        //     that.reloadCartItems(res.data);
        // })
        // 加减商品数量的时候同步到购物车
        updateCartItem.updateCartItem(productId, quantity, addType)
    },
    /* 通过点击切换频道 */
    changeCategory: function (event) {
        // console.log('changeCategory.event', event)
        let categoryIdx = event.currentTarget.dataset.categoryIdx
        let selectCategoryId = event.currentTarget.dataset.internalId
        // 重复点击
        if (categoryIdx == this.data.current) {
            return
        }
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        }
        let products = this.data.products.slice(0, 15)
        this.setData({
            current: categoryIdx,
            // isLoad: 0,
            selectCategoryId,
            initBannerIndex: 0, // 初始化bannerIndex
            bannerIndex: 1, // 初始化banner角标
            products,
            // banners: [],
            showNoMoreProduct: false
        })
        // 根据categoryId请求货架数据
        this.loadProducts(selectCategoryId)
        // 滚动tab栏
        this.scrollCategory(categoryIdx)
    },
    /* 根据current值滚动顶部tab */
    /* scrollCategory: function (current) {
        let categories = this.data.categories
        let lastSelectCategoryId = this.data.selectCategoryId
        let selectCategoryId = categories[current].internal_id
        let showLines = this.data.showLines
        if (showLines === 1) {
            let selectCategoryIdPosition = 0
            // 根据categoryId确定货架导航条的滚动距离
            for (let i = 0; i < categories.length; ++i) {
                selectCategoryIdPosition = selectCategoryIdPosition + categories[i].name.length * 32 + 60
                if (categories[i].internal_id === lastSelectCategoryId) {
                    if (i > current) {
                        for (let j = 0; j < i - current; ++j) {
                            selectCategoryIdPosition = selectCategoryIdPosition - categories[i - j - 1].name.length * 32 - 60
                            if (selectCategoryId === categories[i - j - 1].internal_id) {
                                break
                            }
                        }
                        break
                    } else if (i < current) {
                        for (let j = 0; j < current - i; ++j) {
                            selectCategoryIdPosition = selectCategoryIdPosition + categories[i + j + 1].name.length * 32 + 60
                            if (selectCategoryId === categories[i + j + 1].internal_id) {
                                break
                            }
                        }
                        break
                    }
                }
            }
            // 若所选货架不是当前货架时, 改变货架导航滚动条的位置
            if (selectCategoryId != this.data.selectCategoryId) {
                let categoriesLength = this.data.categoriesLength
                // console.log("getProducts", selectCategoryIdPosition, categoriesLength)
                if (selectCategoryIdPosition > 345 && selectCategoryIdPosition <= categoriesLength) {
                    if (categoriesLength - selectCategoryIdPosition > 345) {
                        selectCategoryIdPosition = (selectCategoryIdPosition - 345) / 2
                    }
                } else {
                    selectCategoryIdPosition = 0
                }
                this.setData({
                    touchMoveEvent: {},
                    selectCategoryIdPosition: selectCategoryIdPosition
                })
            }
        }
        this.setData({
            selectCategoryId: selectCategoryId,
        })
    }, */
    /* 简化scrollCategory计算过程,优化性能 */
    scrollCategory(current) {
        let selectCategoryIdPosition = 0
        let windowWidth = app.globalData.systemInfo.screenWidth
        selectCategoryIdPosition = 60 * current - (windowWidth / 2 - 60)
        this.setData({
            selectCategoryIdPosition
        })
    },
    /**点击灯笼位 */
    clickLanternArea: function (event) {
        let index = event.currentTarget.dataset.index;
        let lantern = this.data.liveTiles.lanternArea[index];
        bannerSkip.bannerSkip(lantern);
        serviceUtils.requestAna('titles_card', 'index', {
            pos: index,
            action: 'click_titles_card',
            share_type: 1,
            promotion_id: lantern.promotion_id
        });
    },
    /**点击瓷片位 */
    clickTileArea: function (event) {
        let index = event.currentTarget.dataset.index;
        let lantern = this.data.liveTiles.tileArea[index];
        bannerSkip.bannerSkip(lantern);
        serviceUtils.requestAna('titles_card', 'index', {
            pos: index,
            action: 'click_titles_card',
            share_type: 0,
            promotion_id: lantern.promotion_id
        });
    },

    /* 点击一级banner */
    clickBanner: function (event) {
        // 点击banner跳转逻辑
        // console.log("clickBanner.event", event)
        let dataset = event.currentTarget.dataset
        let bannerIndex = dataset.bannerIndex
        let bannerLevel = dataset.bannerLevel
        let bannerPromotionId = dataset.promotionId
        let channel = this.data.selectCategoryId

        let bannerEntity = dataset.bannerEntity;
        requestAna('click_banner', 'applet_index', {
            channel: channel,
            promotion_id: bannerPromotionId + '',
            pos: bannerIndex + ''
        })
        if (bannerLevel === "1") {
            let banners = this.data.banners
            // console.log("clickBanner", banners.length > bannerIndex)
            if (banners.length > bannerIndex) {
                bannerSkip.bannerSkip(banners[bannerIndex])
            }
        } else if (bannerLevel === "2") {
            let products = this.data.products
            if (products.length > bannerIndex && products[bannerIndex].type === "group") {
                bannerSkip.bannerSkip(products[bannerIndex].banner[0])
            }
        }
        else if (bannerLevel === "3") {//新添加广告弹屏
            let banners = this.data.advert_list
            // console.log("clickBanner", banners.length > bannerIndex)
            if (banners.length > bannerIndex) {
                bannerSkip.bannerSkip(banners[bannerIndex])
            }
        }
    },
    getCurrentAddressAndShowAllCategories: function () {
        const that = this
        // 优先调用缓存中的地址
        utils.logTimeTag();
        if (!utils.gIsEmptyObject(app.globalData.currentAddressInfo) && !app.globalData.isFromSettingPage) {
            that.setData({
                currentAddressInfo: app.globalData.currentAddressInfo
            })
            // console.log('------------1111111111----------------=')
            //getfromCahe
            this.getAllCategories()
            return
        }
        app.globalData.isFromSettingPage = false
        // 如果该用户有最近使用的地址则展示该地址, 否则展示第三方定位系统返回的地址
        addressService.getCurrentAddress().then(function (res) {
            const resData = res.data;
            utils.logTimeTag();
            // console.log("getCurrentAddressAndShowAllCategories.getCurrentAddress.res", resData)
            if (!utils.gIsEmptyObject(resData.address_info)) {
                let currentAddressType = 1
                // 将地址信息同步到全局信息中
                app.setCurrentAddressInfo(currentAddressType, resData.address_info)
                that.setData({
                    currentAddressInfo: app.globalData.currentAddressInfo
                })
                app.setReceiveAddressInfo(resData.address_info)
                // console.log('------------222222222222222222----------------=')
                that.getAllCategories()
            } else {
                that.requestProductInfoByPosition();
            }
        }, function (error) {
            that.setData({
                'network.noNetwork': true,
            })
        }).catch(function (res) {
            // console.log("getCurrentAddressAndShowAllCategories.getCurrentAddress.catch", res)
        })
    },
    //由这个方法获取定位并获取货架信息，当用户拒绝登录时直接走这里
    requestProductInfoByPosition: function () {
        const that = this
        let currentAddressType = 0
        thirdApi.showToast('定位中', 'loading', 10000)
        // 调用第三方定位系统
        thirdApi.getLocation().then(function (loacationRes) {
            // 根据返回位置信息获取地址
            serviceUtils.getGeoLocation(loacationRes.latitude, loacationRes.longitude, 150).then(function (geoRes) {
                if (!utils.gIsEmptyObject(geoRes.data) && geoRes.data.status === 0) {
                    app.setCurrentAddressInfo(currentAddressType, geoRes.data.data[0])
                    // console.log('--------------location address=', geoRes.data.data[0])
                    that.setData({
                        currentAddressInfo: app.globalData.currentAddressInfo
                    })
                    thirdApi.hideToast()
                    that.getAllCategories()
                }
            }, function () {
                thirdApi.hideToast()
                that.setData({
                    'network.noNetwork': true,
                })
            })
        }, function (err) {
            thirdApi.hideToast()
            that.wetoast.toast({ title: '请尝试打开微信【位置】权限', duration: 2000 })
            that.setData({
                showNoAddressRules: true,
            })
        })
    },
    /* 跳转地址选择页 */
    selectAddress: function (event) {
        //this.getAllRegionItems()
        console.log(event)
        let formId = event.detail.formId
        console.log(formId)
        requestAna('click_address', 'applet_index')
        let cityName = this.data.currentAddressInfo.city
        appInteriorSkip.locatorAddress(cityName, 1)
    },
    /* 目前只用于获取'1小时达\2小时达\次日达\'等图标icon使用 */
    chromeView() {
        const that = this
        let addressInfo = app.globalData.currentAddressInfo
        let data = {
            lat: addressInfo.lat,
            lng: addressInfo.lng
        }
        addressService.chromeView(data).then((res) => {
            let addressData = res.data
            app.globalData.deliveryInfo.imgUrl = addressData.img_url
            if (app.globalData.currentAddressInfo) {
                app.setStationCode(addressData.station_code);
            }
            that.setData({
                deliveryInfo: app.globalData.deliveryInfo
            })
        })
    },
    //资产，广告弹屏
    getAdvertInfoCoupon() {
        //红包弹屏
        const that = this;
        const isShowCoupon = that.data.isShowCoupon
        var datas = new Date();
        const times = utils.formatDate(datas)
        const storageTime = thirdApi.getStorageSync('nowTimeShow')

        if (app.globalData.currentAddressInfo.address_code == undefined) {
            app.getAddressInfo(function () {
                if (times != storageTime) {
                    redPacketService.getAdvertInfo(isShowCoupon).then(function (res) {
                        console.log(res.data)
                        const adver = res.data;
                        if (adver.code == 0) {
                            that.setData({
                                isShowCoupon: 1
                            })
                            thirdApi.setStorageSync('nowTimeShow', times)
                            //资产弹屏
                            if (adver.adver_type == 6 && adver.advert_list.length > 0) {
                                that.setData({
                                    isShowDialog: true,
                                    advert_list: adver.advert_list,
                                    adverType: adver.adver_type,
                                })
                            } else if (adver.adver_type == 2 && adver.coupon_info.coupon_list.length > 0) {
                                that.setData({
                                    isShowDialog: true,
                                    redPacketImg: adver.coupon_info.bg_img,
                                    coupon_list: adver.coupon_info.coupon_list,
                                    adverType: adver.adver_type,
                                })
                            }
                        }
                    })
                }
            })
        } else {
            if (times != storageTime) {
                redPacketService.getAdvertInfo(isShowCoupon).then(function (res) {
                    console.log(res.data)
                    const adver = res.data;
                    if (adver.code == 0) {
                        that.setData({
                            isShowCoupon: 1
                        })
                        thirdApi.setStorageSync('nowTimeShow', times)
                        //资产弹屏
                        if (adver.adver_type == 6 && adver.advert_list.length > 0) {
                            that.setData({
                                isShowDialog: true,
                                advert_list: adver.advert_list,
                                adverType: adver.adver_type,
                            })
                        } else if (adver.adver_type == 2 && adver.coupon_info.coupon_list.length > 0) {
                            that.setData({
                                isShowDialog: true,
                                redPacketImg: adver.coupon_info.bg_img,
                                coupon_list: adver.coupon_info.coupon_list,
                                adverType: adver.adver_type,
                            })
                        }
                    }
                })
            }
        }

    },
    getStatusOfGroupRedPacket() {
        groupRedPacketService.showGroupIcon().then(res => {
            /* console.log(res)
            res.data = {
                "code": 0,
                "message": null,
                "data": {
                    "applyTailNumber": "1,2,3,4,5,6,7,8,9,0",
                    "isShow": 1
                }
            }
            res.statusCode = 200 */
            let resData = res.data
            if (res.statusCode == 200 && resData && resData.code == 0) {
                let userId = app.globalData.wxappLogin && app.globalData.wxappLogin.user_id
                let isShowGroupRedPacketIcon = this.checkNumberIsValid(userId, resData.data.applyTailNumber) && !!resData.data.isShow
                if (isShowGroupRedPacketIcon) {
                    requestAna('pendant_show', 'index')
                }
                this.setData({
                    isShowGroupRedPacketIcon,
                    bearImageUrl: resData.data.bearImgUrl
                })

            }
        }, res => {
            /* res.data = {
              "code": 0,
              "message": null,
              "data": {
                "applyTailNumber": "1,2,3,4,5,6,7,8,9,0",
                "isShow": 1
              }
            }
            res.statusCode = 200
            let resData = res.data
            if (res.statusCode == 200 && resData && resData.code == 0) {
              let userId = app.globalData.wxappLogin && app.globalData.wxappLogin.user_id
              let isShowGroupRedPacketIcon = this.checkNumberIsValid(userId, resData.data.applyTailNumber) && !!resData.data.isShow
              this.setData({
                isShowGroupRedPacketIcon
              })
            } */
        })
    },
    checkNumberIsValid(targetNum, numStr) {
        if (!targetNum || !numStr) return false
        targetNum += ''
        targetNum = targetNum.slice(-1)
        return numStr.indexOf(targetNum) > -1
    },
    goToGroupRedPacket(event) {
        requestAna('click_pendant', 'index')
        let formId = event.detail.formId
        appInteriorSkip.navigateToGroupRedPacketV2(formId)
    },
    /* 无网络状态刷新, 会调用onShow方法 */
    reconnect,
    /* 检查页面url参数 */
    checkQuery: function () {
        let shareData = this.data.shareData
        // console.log("checkQuery", shareData)
        if (!utils.gIsEmptyObject(shareData) && shareData.goPage) {
            this.goSharePage()
        }
    },
    /* 跳转分享页面 */
    goSharePage: function () {
        // 跳转到分享页面
        let shareData = this.data.shareData
        let dataList = {
            productSku: shareData.productSku
        }
        this.setData({
            shareData: {}
        })
        appInteriorSkip[shareData.goPage](dataList)
    },
    /* 一级banner切换触发函数 */
    bannerChange(event) {
        // let index = event.detail.current
        let bannerIndex = event.detail.current + 1
        // let categories = this.data.categories
        // categories[this.data.current].current = index + 1
        this.setData({
            // categories: categories
            bannerIndex
        })
    },
    // <<<<< 首页弹窗
    /* 点击蒙层 */
    maskClick() {
        this.setData({
            'dialogOptions.transparent': true
        })
        setTimeout(() => {
            this.setData({
                isShowDialog: false
            })
        }, 1000)
    },
    /* 点击关闭按钮 */
    closeBtnClick() {
        this.setData({
            'dialogOptions.transparent': true
        })
        setTimeout(() => {
            this.setData({
                isShowDialog: false
            })
        }, 1000)
    },
    /* 点击弹窗图片 */
    dialogClick() {
        // this.setData({
        //     'dialogOptions.transparent': true
        // })
        // setTimeout(() => {
        //     this.setData({
        //         isShowDialog: false
        //     })
        // }, 300)
    },
    // >>>>>> 首页弹窗
    /* 通过频道名称, 获取频道名称对应的internal_id */
    getDefaultCategoryId(categoryList, categoryName) {
        // 传入频道列表和频道名称, 返回对应频道名称的internal_id
        let len = categoryList.length
        for (let i = 0; i < len; i++) {
            let categoryItemName = categoryList[i].name
            if (categoryItemName === categoryName) {
                return categoryList[i].internal_id
            }
        }
        return ''
    },
    getCurrentCategoryIndex(categoryList, categoryId) {
        let len = categoryList.length
        for (let i = 0; i < len; i++) {
            let tempCategoryId = categoryList[i].internal_id
            if (categoryId === tempCategoryId) {
                return i
            }
        }
    },
    /* 通过特制url参数获取频道名称 */
    getCategoryName(categoryId) {
        let categoryName = ''
        switch (categoryId) {
            case 'fruit':
                categoryName = '水果'
                break
            case 'sc':
                categoryName = '蔬菜'
                break
            case 'milk':
                categoryName = '乳品'
                break
            case 'food':
                categoryName = '肉蛋'
                break
            case 'snack':
                categoryName = '零食'
                break
            case 'drink':
                categoryName = '饮品'
                break
            case 'seafood':
                categoryName = '水产'
                break
            case 'fastfood':
                categoryName = '速食'
                break
            case 'liangyou':
                categoryName = '粮油'
                break
            case 'com':
                categoryName = '日百'
                break
            default:
                break
        }
        return categoryName
    },
    /* 关闭红包弹窗 */
    closeRedPacket: function () {
        redPacket.closeRedPacket()
    },
    /* 领取红包 */
    getRedPacket: function (event) {
        redPacket.getRedPacket(event.detail.formId)
    },
    /* 点击红包按钮 */
    goToBuy: function () {
        redPacket.closeRedPacket();
    },
    getBannerHeight(banners) {
        if (banners && !banners.length) {
            return 0
        }
        let winWidth = app.globalData.systemInfo.windowWidth
        let bannerHeight
        let tempBanner = banners[0]
        let tempWidth = tempBanner.width
        let tempHeight = tempBanner.height
        if (!tempWidth || !tempHeight) {
            bannerHeight = Math.floor(28 / 75 * winWidth)
        } else {
            bannerHeight = Math.floor((tempHeight / tempWidth) * winWidth)
        }
        return bannerHeight
    },

    /* 自定义toast */
    showMyToast: function () {
        this.wetoast.toast({ title: '请稍等', duration: 1000 })
    },
    /* 给图片添加参数, 减小图片体积 */
    cutImage(products) {
        if (products && products.length > 0) {
            products.forEach(product => {
                if (product.type !== 'product'
                    || /\.gif$/i.test(product.image)
                    || /\?/i.test(product.image)) {
                    return
                }
                product.image = product.image + '?iopcmd=thumbnail&type=4&width=200'
            })
        }
    },
    //打开权限
    openRule: function () {
        let that = this;
        let app = getApp();
        thirdApi.wxApi('openSetting').then(function (ret) {
            if (ret.authSetting["scope.userInfo"]) {
                app.globalData.hasUserInfoRight = true;

                //重新登录
                that.initPage();
                that.setData({
                    firstLoad: true,
                    showNoAddressRules: false
                });
            } else
                if (ret.authSetting["scope.userLocation"]) {
                    that.requestProductInfoByPosition();
                    that.setData({
                        firstLoad: true,
                        showNoAddressRules: false
                    });
                }
        })
    },

    search: function () {
      appInteriorSkip.navigateToSearchPage();
    }
})
