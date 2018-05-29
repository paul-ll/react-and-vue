// cart.js
const app = getApp()
const cartService = require('../../utils/services/cart.js')
const appInteriorSkip = require('../../utils/services/app_interior_skip.js')
const thirdApi = require('../../utils/services/third_api.js')
const utils = require('../../utils/util.js')
const { reconnect } = require('../../utils/templates/no_network/no_network.js')
const swipeDel = require('../../utils/custom/swipe_del.js')
const updateCartItem = require('../../utils/custom/update_cart_item.js')
const requestAna = require('../../utils/service_utils.js').requestAna
const login = require('../../utils/services/login.js');
const compressImageUtils = require('../../utils/services/compress_image_utils.js')
const userInfoService = require('../../utils/services/userinfo.js')
const storageManager = require('../../utils/services/storage_manager');
const { flodUp } = require('../../utils/templates/display_list/display_list')
const netManager = require('../../utils/services/net_manager');
const productOperate = require('../../utils/services/product_operate');
const getVisibleAna = require('../../utils/custom/get_visible_Ana.js');
Page({
    data: {
        login_code: false,
        currentAddressInfo: {},
        activeCartItems: [],
        unInvalidActiveItems: [],
        inactiveCartItems: [],
        activeCartChecked: {},
        inactiveCartChecked: {},
        unInvalidActiveCartChecked: {},
        promotionDataList: {},
        cartPromotion: {},
        isAllSelect: 1,
        isLoadSuccess: false,
        isSwitchTabIndex: false,
        network: {
            noNetwork: false,
            reconnecting: false,
        },
        hasSelect: 1,
        cartBannerImg: '',
        isNeedShowBetterWay: true,// 是否需要获取最优惠方式 首次进入需要
        isSkipToRedpackageOrCoupon: false, //是否进入了红包选择页或者是优惠券页面或者是商品券页面
        tagList: {},
        promotion: {
            content: ''
        },
        isShowDisplayDetail: false, // 是否展示促销详情list,
        //会员卡信息
        vipCardInfo: {},
        //购物车信息
        cartInfo: {
          productFromCartInfos: {},
          cartCount: 0
        },
        // 加入购物车事件来源
        addToCartSource : '',
        showPullDownTag : false,
        isNeedRefresh: false,
        promotionTags :[],
        cartPromotionTags : [],  //促销标签处理后width存储数组

    },
    reconnect,
    flodUp,
    swipeStart: function (event) {
        swipeDel.swipeStart(event)
    },
    // swipeMove: function(event) {
    //     swipeDel.swipeMove(event)
    // },
    swipeEnd: function (event) {
        swipeDel.swipeEnd(event)
    },
    goToIndex: function () {
        appInteriorSkip.switchTabIndex()
    },
    clearOut: function () {
        var that = this
        cartService.getAllCartItems(true).then(function (res) {
            let unInvalidActiveItems = that.data.unInvalidActiveItems
            app.globalData.inactiveItems = []
            app.globalData.unInvalidActiveItems = []
            for (let i = 0; i < unInvalidActiveItems.length; ++i) {
                let unInvalidActiveItem = unInvalidActiveItems[i]
                that.updateCartItem(unInvalidActiveItem.sku, unInvalidActiveItem.quantity, 2);
            }
            that.reloadCartItems()
        })
    },
    delItem: function (event) {

        this.data.isNeedShowBetterWay = true;

        utils.logi("delItem.event", event)
        const that = this
        const productId = event.currentTarget.dataset.cartItemId
        let currentList = that.data.activeCartItems.concat(that.data.unInvalidActiveItems).concat(that.data.inactiveCartItems)
        let length = currentList.length
        for (let i = 0; i < length; i++) {
            let currentItem = currentList[i]
            if (currentItem.id == productId) {
                utils.logi("delItem.currentItem", currentItem.sku, currentItem.quantity)
                that.updateCartItem(currentItem.sku, currentItem.quantity, 2)
            }
        }
    },
    delUnInvalidActiveProduct: function (noActiveProductList) {
        let activeCartItems = this.data.activeCartItems
        for (let i = 0; i < noActiveProductList.length; ++i) {
            let noActiveProduct = noActiveProductList[i]
            utils.logi("delUnInvalidActiveProduct", activeCartItems)
            for (let j = 0; j < activeCartItems.length; ++j) {
                let activeCartItem = activeCartItems[j]
                utils.logi("delUnInvalidActiveProduct", activeCartItem, noActiveProduct)
                if (activeCartItem.sku === noActiveProduct.sku) {
                    utils.logi("delUnInvalidActiveProduct.activeCartItems", activeCartItems)
                    activeCartItems.splice(j, 1)
                    this.updateCartItem(activeCartItem.sku, activeCartItem.quantity, 2);
                    utils.logi("delUnInvalidActiveProduct.activeCartItems", activeCartItems)
                }
            }
        }
    },
    cartPromotion: function (promotionDataList) {
        const that = this
        for (let key in promotionDataList) {
            if (promotionDataList[key] <= 0) {
                delete promotionDataList[key]
            }
        }

        //添加优惠券，红包等的使用情况
        if (!this.data.isNeedShowBetterWay) {
            promotionDataList.voucher_id_list = app.globalData.currentCouponIds;
        }

        if (this.data.vipCardInfo && this.data.vipCardInfo.card_list && this.data.vipCardInfo.card_list.length > 0) {
            const cardList = this.data.vipCardInfo.card_list;
            for (let index = 0; index < cardList.length; index++) {
                const element = cardList[index];
                if (element.is_default || element.is_default == 1) {
                    promotionDataList.vip_card_id = element.id + "";
                    continue;
                }
            }
        }

        thirdApi.showLoading();
        cartService.cartPromotion(promotionDataList).then(function (res) {
            thirdApi.hideLoading();
            const resData = res.data
            let couponIds = []
            app.globalData.userMemberType = resData.user_member_type
            if (resData.better_balance_type == 1) {
                couponIds.push(resData.vip_price_area.current_coupon_voucher_id, resData.vip_price_area.current_product_voucher_id, resData.vip_price_area.current_redpacket_id)
            } else {
                couponIds.push(resData.price_area.current_coupon_voucher_id, resData.price_area.current_product_voucher_id, resData.price_area.current_redpacket_id)
            }
            app.globalData.currentCouponIds = couponIds
            utils.logi("cartPromotion.cartPromotion.res", resData);

            if (resData.vip_card) {
                //预处理默认勾选逻辑
                const cardList = resData.vip_card.card_list;
                if (cardList && cardList.length > 0) {

                    //先将服务器最近的默认勾选的内容更新
                    for (let index = 0; index < cardList.length; index++) {
                        const element = cardList[index];
                        if (element.is_default == 1) {
                            storageManager.setVipCardSelectID(element.id);
                        }

                        const cardDoc = element.card_doc;
                        if (cardDoc.indexOf('#_$') != -1) {
                            const cardDocTextArray = cardDoc.split('#_$');
                            element.cardDocTextArray = cardDocTextArray;
                        }
                    }

                    const selectCardID = storageManager.getVipCardSelectID();
                    for (let index = 0; index < cardList.length; index++) {
                        const element = cardList[index];

                        if (selectCardID) {
                            if (element.id == selectCardID && element.is_default == 0) {
                                element.is_default = 1;
                                break;
                            }
                        }
                    }
                } else {
                    storageManager.setVipCardSelectID('');
                }

                if (resData.vip_card.back_cash_text) {
                    if (resData.vip_card.back_cash_text.indexOf('#_$') != -1) {
                        const backCashTextArray = resData.vip_card.back_cash_text.split('#_$');
                        resData.vip_card.backCashTextArray = backCashTextArray;
                    }
                }


            }

            that.setData({
                promotionDataList: promotionDataList,
                cartPromotion: resData,
                vipCardInfo: resData.vip_card,
                isLoadSuccess: true,
                isNeedShowBetterWay: true,
                promotion: {
                    content: resData.vip_promotions_notice.length > 1 ? resData.vip_promotions_notice[1].content : ''
                },
            })
        }, function () {
            thirdApi.hideLoading();
        })
    },
    checkActiveCartChecked: function (activeCartChecked) {
        for (let key in activeCartChecked) {
            if (activeCartChecked[key] === false) {
                return 1
            }
        }
        return 0
    },
    hasActiveCartChecked: function (activeCartChecked) {
        for (let key in activeCartChecked) {
            if (activeCartChecked[key]) {
                return 1
            }
        }
        return 0
    },
    checkboxChange: function (event) {
        utils.logi("checkboxChange.event", event)
        let indexList = event.detail.value
        let activeCartItems = this.data.activeCartItems
        let activeCartChecked = this.data.activeCartChecked
        let promotionDataList = {}
        for (let key in activeCartChecked) {
            activeCartChecked[key] = false
        }
        for (let i = 0; i < indexList.length; ++i) {
            let index = indexList[i]
            if (activeCartItems[index] != undefined) {
                let sku = activeCartItems[index].sku
                let quantity = activeCartItems[index].quantity
                activeCartChecked[sku] = true
                promotionDataList[sku] = quantity
            }
        }
        let isAllSelect = this.checkActiveCartChecked(activeCartChecked)
        app.setActiveCartChecked(activeCartChecked)
        this.setData({
            // activeCartChecked: activeCartChecked,
            isAllSelect: isAllSelect
        })

        utils.logi("checkboxChange.promotionDataList", promotionDataList)
        this.cartPromotion(promotionDataList)
    },
    setActiveCartChecked: function (activeItem, isActive) {
        const that = this
        if (isActive === 1) {
            // let activeCartChecked = this.data.activeCartChecked
            let activeCartChecked = app.globalData.activeCartChecked
            let promotionDataList = {}
            for (let i = 0; i < activeItem.length; ++i) {
                let sku = activeItem[i].sku
                let quantity = activeItem[i].quantity
                if (activeCartChecked[sku] === undefined || activeCartChecked[sku] === null) {
                    activeCartChecked[sku] = true
                }
                if (activeCartChecked[sku] === true) {
                    promotionDataList[sku] = quantity
                }
            }
            let isAllSelect = that.checkActiveCartChecked(activeCartChecked)
            // app.setActiveCartChecked(activeCartChecked)
            that.setData({
                activeCartChecked: activeCartChecked,
                isAllSelect: isAllSelect
            })
            utils.logi("setActiveCartChecked.promotionDataList", promotionDataList)
            that.cartPromotion(promotionDataList)
        } else if (isActive === 2) {
            let inactiveCartChecked = []
            let activeCartChecked = that.data.activeCartChecked
            // if (utils.gIsEmptyObject(inactiveCartChecked)) {
            // for (let key in inactiveCartChecked) {
            //     inactiveCartChecked[key] = false
            //     activeCartChecked[key] = null
            // }
            for (let i = 0; i < activeItem.length; ++i) {
                let sku = activeItem[i].sku
                inactiveCartChecked[sku] = false
                activeCartChecked[sku] = null
            }
            // }

            that.setData({
                inactiveCartChecked: inactiveCartChecked,
                activeCartChecked: activeCartChecked
            })
            // app.setActiveCartChecked(activeCartChecked)
            app.setInactiveCartChecked(inactiveCartChecked)
        } else if (isActive === 3) {
            let unInvalidActiveCartChecked = app.globalData.unInvalidActiveCartChecked
            let activeCartChecked = that.data.activeCartChecked
            if (utils.gIsEmptyObject(unInvalidActiveCartChecked)) {
                for (let key in unInvalidActiveCartChecked) {
                    unInvalidActiveCartChecked[key] = false
                }
                for (let i = 0; i < activeItem.length; ++i) {
                    let sku = activeItem[i].sku
                    unInvalidActiveCartChecked[sku] = false
                    activeCartChecked[sku] = null
                }
            }

            that.setData({
                unInvalidActiveCartChecked: unInvalidActiveCartChecked,
                activeCartChecked: activeCartChecked
            })

            app.setActiveCartChecked(activeCartChecked)
            app.setUnInvalidActiveCartChecked(unInvalidActiveCartChecked)
        }
    },
    reSortActiveCartItems: function () {
        let agentArr = []
        let activeCartItem = this.data.activeCartItems
        let activeCartChecked = this.data.activeCartChecked
        for (let item in activeCartItem) {
            if (activeCartChecked[activeCartItem[item].sku]) {
                agentArr.unshift(activeCartItem[item])
            } else {
                agentArr.push(activeCartItem[item])
            }
        }
        this.setData({
            activeCartItems: agentArr
        })
    },
    filterActive: function (activeItems) {
        let newActiveItem = []
        let unInvalidActiveItem = []
        for (let i = 0; i < activeItems.length; ++i) {
            let activeItem = activeItems[i]
            utils.logi("activeItem.nationwide", activeItem.nationwide, activeItem.nationwide === 0 || activeItem.nationwide === 2 || activeItem.nationwide === 3)
            if (activeItem.nationwide === 0 || activeItem.nationwide === 2 || activeItem.nationwide === 3) {
                newActiveItem.push(activeItem)
            } else {
                unInvalidActiveItem.push(activeItem)
                // newActiveItem.push(activeItem)
            }
        }
        this.setData({
            // activeCartItems: newActiveItem,
            unInvalidActiveItems: unInvalidActiveItem
        })
        return newActiveItem
    },
    reloadCartItems: function () {
        const that = this
        if (this.data.addToCartSource == 'recommendList'){
          
            this.data.addToCartSource = '',
            this.data.isNeedRefresh = true,
          
          that.wetoast.toast({ title: '加入购物车成功', duration: 500 })
          return;
        }
        // <<<<<<   请求sync2接口需要传入商品sku和quantity作为参数, 特惠商品需要
        let activeItems = app.globalData.productFromCartInfos
        let activeItemsChecked = app.globalData.activeCartChecked
        // let activeItems = this.data.activeCartItems
        // let activeItemsChecked = this.data.activeCartChecked
        let productsList = {}
        for (let sku in activeItems) {
            if (activeItemsChecked[activeItems[sku].sku]) {
                productsList[activeItems[sku].sku] = activeItems[sku].quantity
            }
        }

        cartService.getAllCartItems(false, productsList).then(function (res) {
            utils.logi('received cart items: ', res.data)
            const resData = res.data;
            utils.logi('received cart items: ', resData.length)
            if (resData.code == 0) {
                that.setData({
                    isLoadSuccess: true
                })
                return
            }
            let activeItem = {}
            let inactiveItem = {}
            let productCartInfo = {}

            // ================= 图片大小质量处理 =================
            for (let index = 0; index < resData.length; index++) {
                const element = resData[index];

                compressImageUtils.compressShoppingCartProductImage(element.active_item);
                if (element.inactive_item) {
                    compressImageUtils.compressShoppingCartProductImage(element.inactive_item);
                }
            }
            // ================= 图片大小质量处理 =================

            if (resData.length > 1 && resData[resData.length - 1].weixin_app_path) {
                let cartBannerImg = ''
                // resData中最后一位放的是要展示在购物车顶部的banner, 为了不对之后的操作造成影响, 需要使用pop方法将最后一个元素弹出
                cartBannerImg = resData.pop().weixin_app_path
                that.setData({
                    cartBannerImg
                })
            }
            if (resData.length != 0 && resData.length != undefined) {
                for (let index = 0; index < resData.length; ++index) {
                    if (resData[index].trans_type === 'old') {
                        activeItem = resData[index].active_item;
                        inactiveItem = resData[index].inactive_item;
                        let newActiveItem = that.filterActive(activeItem)
                        let unInvalidActiveItem = that.data.unInvalidActiveItems
                        that.setActiveCartChecked(newActiveItem, 1)
                        that.setActiveCartChecked(inactiveItem, 2)
                        that.setActiveCartChecked(unInvalidActiveItem, 3)
                        activeItem = newActiveItem.concat(inactiveItem).concat(unInvalidActiveItem)
                        activeItem.forEach((item) => {
                            if (item.vip_price_pro && item.vip_price_pro.price_up) {
                                item.vip_price_pro.price_up.color = utils.deciToHex(item.vip_price_pro.price_up.color)
                                item.vip_price_pro.price_down.color = utils.deciToHex(item.vip_price_pro.price_down.color)
                            }
                            let tempProduct = {}
                            tempProduct.isActive = 1
                            tempProduct.quantity = item.quantity
                            tempProduct.sku = item.sku
                            productCartInfo[item.sku] = tempProduct
                        })

                        that.setData({
                            // activeCartItems: newActiveItem,
                            cartTransTitle: resData[index].trans_title
                        })
                    } else if (resData[index].trans_type === 'all') {

                    }
                }
            } else {
                that.setData({
                    promotionDataList: {},
                    cartPromotion: {}
                })
            }
            app.setProductFromCartInfos(productCartInfo);

            that.setData({
                isLoadSuccess: true,
                activeCartItems: activeItem,
                inactiveCartItems: inactiveItem,
                showPullDownTag: false
            });
            // that.reSortActiveCartItems();
            // that.allSelect()
        }, function (err) {
            that.setData({
                'network.noNetwork': that.data.isLoadSuccess ? false : true,
            })
            if (that.data.isLoadSuccess) {
                that.wetoast.toast({ title: '购物车同步出错，请稍后再试', duration: 2000 })
            }
        });
    },

    /**
     * 处理购物车商品左上角促销标签扁平问题@guozhen
     */
    getCartTagWidth(event) {
      
      // 标签宽度根据高度自适应
      let width = 0
      let height = 64 // 单位为rpx
      let productIndex = event.currentTarget.dataset.index
      let imgWidth = event.detail.width
      let imgHeight = event.detail.height
      let windowWidth = app.globalData.systemInfo.windowWidth
      let cartPromotionTags = this.data.cartPromotionTags
      width = imgWidth / imgHeight * height
      cartPromotionTags[productIndex] = {
        width
      }
      this.setData({
        cartPromotionTags
      })
    },


    updateCartItem: function (productId, quantity, addType) {
        // const that = this
        // let productLists = [{
        //     sku: productId,
        //     quantity: quantity
        // }]
        // cartService.addToCarts(productLists, addType).then(function(res) {
        //     that.reloadCartItems();
        // }, function(res) {
        //     that.wetoast.toast({ title: '你的网络不给力部分商品可能未及时加入购物车或移除', duration: 2000 })
        // })
        this.data.isNeedShowBetterWay = true;
        updateCartItem.updateCartItem(productId, quantity, addType)
    },
    checkQuantity: function (productSku) {
        let activeCartItems = this.data.activeCartItems
        for (let i = 0; i < activeCartItems.length; ++i) {
            let activeCartItem = activeCartItems[i]
            if (activeCartItem.event != undefined || activeCartItem.event != null) {
                if (activeCartItem.sku === productSku) {
                    if (activeCartItem.event.product_limit <= 0) {
                        // thirdApi.showToast('该产品已售罄!', 'sucess', 2000)
                        this.wetoast.toast({ title: '该产品已售罄', duration: 2000 })
                        return false
                    } else if (activeCartItem.quantity >= activeCartItem.event.product_limit) {
                        // thirdApi.showToast('只剩' + activeCartItem.event.product_limit + '份啦~', 'sucess', 2000)
                        this.wetoast.toast({ title: '只剩' + activeCartItem.event.product_limit + '份啦~', duration: 2000 })
                        return false
                    } else if (activeCartItem.quantity >= activeCartItem.event.limit) {
                        // thirdApi.showToast('只剩' + activeCartItem.event.limit + '份啦~', 'sucess', 2000)
                        this.wetoast.toast({ title: '只能买' + activeCartItem.event.limit + '份啦~', duration: 2000 })
                        return false
                    }
                }
            }
        }
        return true
    },
    increase: function (event) {
        // let productSku = event.currentTarget.dataset.productSku
        // if (this.checkQuantity(productSku)) {
        //     this.updateCartItem(productSku, 1, 1)
        // }
        const that = this;
        updateCartItem.increase(event)
        //购物车抛物动画 (时间间隔)(解决点击过于频繁时)
        let nowTime = new Date().getTime();
        let clickTime = that.data.ctime;
        if (clickTime != 'undefined' && (nowTime - clickTime < 800)) {
          // thirdApi.showToast('操作过于频繁', 'loading', 1000)
          return;
        } else {
          that.setData({
            ctime: nowTime
          })
          // 测试加车动画
          let productIndex = event.currentTarget.dataset.index;
          let systemInfo = app.globalData.systemInfo;
          let endX = systemInfo.windowWidth / 8*5,
            endY = systemInfo.windowHeight + 20;
          this.addcart.animateAddToCart(`#active-cart-item-image-${productIndex}`, endX, endY)
        }
        
    },
    decrease: function (event) {
        // this.updateCartItem(event.currentTarget.dataset.productSku, 1, 2);
        updateCartItem.decrease(event)
    },
    allSelect: function (event) {
        utils.logi("allSelect.event", event)
        let isAllSelect = this.data.isAllSelect
        let activeCartChecked = this.data.activeCartChecked
        // let inactiveCartChecked = this.data.inactiveCartChecked
        let promotionDataList = this.data.promotionDataList
        let hasSelect = this.data.hasSelect
        if (isAllSelect === 0) {
            for (let key in activeCartChecked) {
                if (activeCartChecked[key] != null) {
                    activeCartChecked[key] = false
                    promotionDataList[key] = 0
                }
            }
        } else {
            for (let key in activeCartChecked) {
                if (activeCartChecked[key] != null) {
                    activeCartChecked[key] = true
                }
            }
            let activeCartItems = this.data.activeCartItems
            for (let i = 0; i < activeCartItems.length; ++i) {
                let activeCartItem = activeCartItems[i]
                if (activeCartItem.stock > 0) {
                    promotionDataList[activeCartItem.sku] = activeCartItem.quantity
                }
            }
        }
        isAllSelect = this.checkActiveCartChecked(activeCartChecked)
        hasSelect = this.hasActiveCartChecked(activeCartChecked)
        app.setActiveCartChecked(activeCartChecked)
        utils.logi(activeCartChecked)
        this.setData({
            activeCartChecked: activeCartChecked,
            isAllSelect: isAllSelect,
            hasSelect: hasSelect
        })
        utils.logi("allSelect", activeCartChecked, isAllSelect)

        utils.logi("allSelect.promotionDataList", promotionDataList)
        this.cartPromotion(promotionDataList)
    },
    selectProduct: function (event) {
        utils.logi("selectProduct.event", event)
        let productSku = event.currentTarget.dataset.productSku
        let productQuantity = event.currentTarget.dataset.productQuantity
        //let activeCartItems = this.data.activeCartItems
        let activeCartChecked = this.data.activeCartChecked
        let promotionDataList = this.data.promotionDataList
        utils.logi("selectProduct.activeCartChecked", activeCartChecked)
        activeCartChecked[productSku] = !activeCartChecked[productSku]
        utils.logi("selectProduct.activeCartChecked", activeCartChecked)
        if (activeCartChecked[productSku] === true) {
            promotionDataList[productSku] = productQuantity
        } else if (activeCartChecked[productSku] != true) {
            promotionDataList[productSku] = 0

        }
        let isAllSelect = this.checkActiveCartChecked(activeCartChecked)
        let hasSelect = this.hasActiveCartChecked(activeCartChecked)
        app.setActiveCartChecked(activeCartChecked)
        this.setData({
            activeCartChecked: activeCartChecked,
            isAllSelect: isAllSelect,
            hasSelect: hasSelect
        })

        utils.logi("selectProduct.promotionDataList", promotionDataList)
        this.cartPromotion(promotionDataList)
    },
    checkout: function () {
        requestAna('goto_settlement', 'shopping_cart')
        let address_id = this.data.currentAddressInfo.id
        let activeCartItems = this.data.activeCartItems
        let promotionDataList = this.data.promotionDataList
        let checkoutActiveCartItems = []
        for (let i = 0; i < activeCartItems.length; ++i) {
            let sku = activeCartItems[i].sku
            if (promotionDataList[sku] > 0) {
                checkoutActiveCartItems.push(activeCartItems[i])
            }
        }
        if (checkoutActiveCartItems.length != 0) {
            storageManager.setCheckoutActiveCartItems(checkoutActiveCartItems);
            appInteriorSkip.checkout({
                vipCardID: storageManager.getVipCardSelectID()
            })
        } else {
            // thirdApi.showToast('请添加有效商品', 'loading', 1000)
            this.wetoast.toast({ title: '请添加有效商品', duration: 2000 })
        }
    },
    // setSwitchTabIndex: function() {
    //     this.setData({
    //         isSwitchTabIndex: true
    //     })
    // },
    onLoad: function () {
        utils.logi(" ------------------------------cart.onload------------------------------ ")
        new app.globalData.WeToast()
        // 初始化加车动画实例
        new app.globalData.addToCart();
        this.setData({
            isLoadSuccess: false,
        })
    },
    onShow: function () {
        //注释部分修复购物车没登录提示出现两次
        // if (!app.globalData.isFromSettingPage) {
        //     this.showWarningModal()
        // }
        this.initPage()
        requestAna('shopping_cart_get_into', 'shopping_cart')
    },
    onHide: function () {
        this.setData({
            swipeDel: ''
        })
    },
    onPullDownRefresh: function (event) {
        this.onShow()
        wx.stopPullDownRefresh()
    },
    /* showWarningModal () {
        const that = this
        app.showWarningModal(() => {
            that.initPage()
        }, () => {
            that.initPage()
        })
        app.globalData.isFromSettingPage = false
    }, */
    initPage() {
        const that = this
        this.miniStart()

        if (this.data.isSkipToRedpackageOrCoupon) {
            this.data.isSkipToRedpackageOrCoupon = false;
            this.data.isNeedShowBetterWay = false;
        } else {
            this.data.isNeedShowBetterWay = true;
        }

        if (!app.globalData.wxappLogin) {
            app.getUserInfo(function (wxappLogin) {
                if (utils.gIsEmptyObject(app.globalData.currentAddressInfo)) {
                    app.getAddressInfo(() => {
                        that.getPageData()
                    })
                } else {
                    that.getPageData()
                }
            }, () => {
                that.setData({
                    isLoadSuccess: true
                })
            })
        } else {
            this.getPageData()
        }
    },
    onItemClick(event) {
        appInteriorSkip.productDetail({
            productSku: event.currentTarget.dataset.sku
        });
    },
    getPageData() {
        utils.logi(app.globalData.currentAddressInfo)
        let currentAddressInfo = app.globalData.currentAddressInfo
        this.setData({
            currentAddressInfo: currentAddressInfo,
            'network.noNetwork': false
        })
        this.reloadCartItems();
        this.getRecommend();
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

    /**
     * 购物车千人千面
     */
    getRecommend(){
      let that = this;
      let url = netManager.getRequestUrl('getReSkus');
      let params = {
        "from":'cart'
      }
      netManager.genPromise(url, 'POST', params).then(function (res) {
        let products = res.data.data.products
        that.cutImage(products);

        if(products && products.length >0 ){
          products.forEach(item=>{
            item.price = item.vip_price_pro;
            item.isNewUser = 1;
          })
        }
        that.setData({
          recomProducts: products,
        })
      }, function (error) {
        utils.loge(error);
      });
    },
    /**
     * 跳转详情页
     */
    onItemClick: function (event) {
      let dataset = event.currentTarget.dataset;
      let dataList = {
        productSku: dataset.sku,
      }
      appInteriorSkip.productDetail(dataList);
      // 推荐商品点击埋点@guozhen
      if (dataset.listPosition && dataset.listPosition == 'shoppingCart') {
        let path = [];
        this.data.activeCartItems.forEach(item => {
          item.sku && path.push(item.sku)
        })
        let params = {
          pos: dataset.productPos,
          path: path,
        }
        requestAna('recommend_view_product', 'cart_list', params);
      }
    },

    clickDisplay(event) {
        let queryType = event.currentTarget.dataset.queryType
        // let redpacketId = event.currentTarget.dataset.redpacketId || 0
        // let productCouponId = event.currentTarget.dataset.productCouponId || 0

        this.data.isSkipToRedpackageOrCoupon = true;

        switch (Number(queryType)) {
            // 1:商品兑换券[product], 2:满减优惠券[mj], 3:红包[packet]
            case 1:
                requestAna('view_coupon', 'cart_list')
                appInteriorSkip.navigateToMyRedpackageList({ needProducts: true, voucherType: 'product', from: 'cart' })
                break
            case 3:
                requestAna('click_red_package', 'cart_list')
                appInteriorSkip.navigateToMyRedpackageList({ needProducts: true, voucherType: 'packet', from: 'cart' ,address_id: -1})
                break
            default:
                break
        }
    },
    imageLoad(event) {
        let imgDetail = event.detail
        let tagIndex = event.currentTarget.dataset.tagIndex
        let sku = event.currentTarget.dataset.sku
        let imgHeight = 28
        let imgWidth = imgDetail.width / imgDetail.height * imgHeight
        let tags = this.data.tagList[sku] || []
        tags[tagIndex] = parseInt(imgWidth) + 'rpx'
        let tagList = this.data.tagList
        tagList[sku] = tags
        this.setData({
            tagList
        })
    },
    miniStart() {
        if (this.data.miniStartInfo) return
        // 由于接口调用用到了service_utils中的getRequestUrl()方法, 其中用到了app实例, 但是在app的onLaunch时, app实例还未生成, 会导致报错, 所以不能在onLaunch阶段调用此方法
        if (app.globalData.miniStart) {
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
    getPriceTagWidth(event) {
        let width = 0
        let height = 22
        let imgWidth = event.detail.width
        let imgHeight = event.detail.height
        width = imgWidth / imgHeight * height
        this.setData({
            priceTagWidth: width
        })
    },
    onVipCardSelect(event) {
        const dataset = event.currentTarget.dataset;
        const cardList = this.data.vipCardInfo.card_list;

        for (let index = 0; index < cardList.length; index++) {
            const element = cardList[index];
            if (index === dataset.index) {
                element.is_default = !element.is_default;
                if (element.is_default || element.is_default == 1) {
                    storageManager.setVipCardSelectID(element.id);
                } else {
                    storageManager.setVipCardSelectID("");
                }
            } else {
                element.is_default = 0;
            }
        }

        this.setData({
            vipCardInfo: this.data.vipCardInfo,
        })

        requestAna('buy', 'cart_list', {
            path: storageManager.getVipCardSelectID()
        });

        this.cartPromotion(this.data.promotionDataList);
    },
    seeOpenCardDetail() {
        appInteriorSkip.navigateToOpenVip();
    },
    addToCart: function (event) {
      let that = this;
      let dataset = event.currentTarget.dataset;
      if(dataset.listPosition && dataset.listPosition == 'shoppingCart'){
          this.data.addToCartSource = 'recommendList';
      }
      productOperate.addToCart(dataset.productSku, dataset.seckillLimit, dataset.stock, dataset.quantity || 0);

      // 推荐商品加入购物车埋点@guozhen
      if (dataset.listPosition && dataset.listPosition == 'shoppingCart') {
        let path = [];
        this.data.activeCartItems.forEach(item => {
          item.sku && path.push(item.sku)
        })
        let params = {
          pos: dataset.productPos,
          path: path,
        }
        requestAna('add_cart', 'cart_list', params);
      }
    },

    /**
     * 优化商品item左上角promotionTags（促销标签)
     */
    getWidth(event) {
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

    /**
     * 滑动结束@guozhen
     */
    touchE(){
      utils.logi('======================滑动结束====================');
      let path = [];
      this.data.activeCartItems.forEach(item => {
        item.sku && path.push(item.sku)
      })
      getVisibleAna('#single-product-', this.data.recomProducts, "recommend_product_show", "cart_list", {path:path});
    },

    /**
     * 监听页面滑动
     */
    onPageScroll(e){
      if(e.scrollTop < 5 && this.data.isNeedRefresh){
        this.setData({
          showPullDownTag: true,
          isNeedRefresh: false,
        })
        setTimeout(()=>{
          this.setData({
            showPullDownTag: false
          })
        },5000)
      }
    }
})
