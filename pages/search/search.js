const utils = require('../../utils/util');
const thirdApi = require('../../utils/services/third_api');
const serviceUtils = require('../../utils/service_utils');
const app = getApp()
const updateCartItem = require('../../utils/custom/update_cart_item.js')
const cartService = require('../../utils/services/cart.js')
const storageManager = require('../../utils/services/storage_manager');
const appInteriorSkip = require('../../utils/services/app_interior_skip');
const requestAna = require('../../utils/service_utils.js').requestAna;
const getVisibleAna = require('../../utils/custom/get_visible_Ana.js');
Page({
    data: {
        inputBox: '',
        hotValues: [
            '中秋', '大闸蟹', '月饼', '榴莲', '苹果', '奇异果', '龙眼', '面包', '草莓', '香蕉', '中秋'
        ],
        historyValues: [],
        searchResultList: [],
        noRelativeProducts: false,
        network: {
            reconnecting: false,
            noNetwork: false
        },
        promotionTags: [],
        miniStartInfo: {},
    },
    onTextChanged: function (event) {
        if (event) {

            this.data.inputBox = event.detail.value;

            let cursor = event.detail.cursor;
            if (cursor == 0) {
                this.setData({
                    searchResultList: [],
                    noRelativeProducts : false,
                })
            }
        }
    },
    clearHistory: function () {
        this.setData({
            historyValues: []
        }, function () {
            utils.logi('setData callback');
        })
        storageManager.storeHistorySearch(this.data.historyValues)
        serviceUtils.requestAna('search_clearHistory', '');
    },
    startSearch: function () {
        this.toSearch('searchBtn');
    },
    toSearch: function (event) {
        if (event && event !== 'searchBtn')
            this.inputBoxNewValue(event);
        if (this.data.inputBox) {
            let searchValue = this.data.inputBox;
            this.storageSearchKey(searchValue);
            this.search(searchValue);
            serviceUtils.requestAna('search', 'history_search', {history_keyword: this.data.inputBox});
            event == 'searchBtn' && requestAna("search", "keyword_search", {invite_code: searchValue});
        }
        
    },
    storageSearchKey: function (searchValue) {
        const that = this;

        //如果数组中已经存在将要添加的值，首先移除已经存在的
        if (this.data.historyValues.includes(searchValue)) {
            let index = this.data.historyValues.indexOf(searchValue);
            if (index != -1) {
                this.data.historyValues.splice(index, 1);
            }
        }

        this.data.historyValues.splice(0, 0, searchValue);

        storageManager.storeHistorySearch(this.data.historyValues, function () {
            that.getStorageSearchKeys();
        })
    },
    getStorageSearchKeys: function () {
        const that = this;
        storageManager.getHistorySearch(function (data) {
            if (data.data) {
                that.setData({
                    historyValues: data.data
                })
            }
        });
    },
    inputBoxNewValue: function (event) {
        //点击热词处理
        if (event.detail.value) {
            this.data.inputBox = event.detail.value;
            //输入框处理
        } else if (event.currentTarget.dataset.searchKey) {
            this.setData({
                inputBox: event.currentTarget.dataset.searchKey
            })
        } else {
            this.wetoast.toast({ title: "请输入您要搜索的关键词", duration: 1500 })
            //将之前的搜索词清空
            this.data.inputBox = '';
        }
    },
    onShow() {
        let url = serviceUtils.getRequestUrl('searchHotWords')

        const that = this;
        serviceUtils.genPromise(url).then(function (res) {
            console.log("=======================>",res);
            if (res.data && res.data.data && res.data.data.length > 0) {
                that.setData({
                    hotValues: res.data.data,
                    recomProducts: res.data.like_result && res.data.like_result.product_list && res.data.like_result.product_list.length>0? res.data.like_result.product_list : [],
                });
                //先获取了热词，再获取历史记录
                that.getStorageSearchKeys();
            }
        }, function (error) {
            if (error) {

            }
        });
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
    setResult(searchResult) {
        this.setData({
            searchResultList: searchResult,
            network: {
                noNetwork: false
            },
            noRelativeProducts: false
        })
    },
    search(keyWord) {
        let url = serviceUtils.getRequestUrl('search', '', 1, {
            kw: keyWord
        })

        thirdApi.showToast('商品搜索中...', 'loading', 10000);
        const that = this;
        serviceUtils.genPromise(url).then(function (res) {
            if (res.data && res.data.data && res.data.data.length > 0) {

                serviceUtils.requestAna('search', 'keyword_search', {
                    invite_code: that.data.inputBox,
                });

                that.setData({
                    searchResultList: res.data.data,
                    recomProducts: res.data.like_result && res.data.like_result.product_list && res.data.like_result.product_list.length > 0 ? res.data.like_result.product_list : that.data.recomProducts,
                    network: {
                        noNetwork: false
                    },
                    noRelativeProducts: false
                })
                that.getPoductFromCartInfos();
            } else {
                that.setData({
                    network: {
                        noNetwork: false
                    },
                    noRelativeProducts: true
                })
            }
            thirdApi.hideToast();
        }, function (error) {
            thirdApi.hideToast();
            that.setData({
                network: {
                    noNetwork: true
                },
                noRelativeProducts: false
            })
        });
    },
    reconnect() {
        this.toSearch();
    },
    onLoad() {
        // 页面加载时候新建一个toast实例
        new app.globalData.WeToast()

        if (app.globalData.miniStartInfo) {
            this.setData({
                miniStartInfo: app.globalData.miniStartInfo
            })
        } 
    },
    onUnload() {
        serviceUtils.requestAna('search_back', '');
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
        console.log("chooseProduct.event=========================", event);
        let that = this;
        let dataset = event.currentTarget.dataset
        let productSku = dataset.productSku
        let pTitle = dataset.productTitle
        let dataList = {
            productSku: event.currentTarget.dataset.productSku,
            channel: this.data.selectCategoryId
        }
        appInteriorSkip.productDetail(dataList)
        // 点击商品埋点
        if (dataset.listPosition && dataset.listPosition == 'search-recomment'){
            requestAna("product_click", "search", {
              pos: dataset.productIndex,
              sku: dataset.productSku,
              invite_code: that.data.inputBox
            });
        }
        if (dataset.listPosition && dataset.listPosition == 'search-result') {
          requestAna("product_click", "keyword_search", {
            pos: dataset.productIndex,
            sku: dataset.productSku,
            invite_code: that.data.inputBox
          });
        }
    },
    /* 首页加车 */
    addToCart: function (event) {
        console.log("添加购物车===================",event);
        const that = this
        if (!app.globalData.hasUserInfoRight) {
            app.showWarningModal(() => {
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
            if (that.checkQuantity(productSku, quantity, stock, seckillLimit)) {
                that.updateCartItem(productSku, 1, 1)
            }
            // 加车埋点
            if (dataset.listPosition && dataset.listPosition == 'search-recomment') {
              requestAna("add_cart", "search", {
                pos: dataset.productIndex,
                sku: dataset.productSku,
                invite_code: that.data.inputBox
              });
            }
            if (dataset.listPosition && dataset.listPosition == 'search-result') {
              requestAna("add_cart", "search_result", {
                pos: dataset.productIndex,
                sku: dataset.productSku,
                invite_code: that.data.inputBox
              });
            }
        }
        
    },
    decrease: function (event) {
        let dataset = event.currentTarget.dataset
        let productSku = dataset.productSku
        let productIndex = dataset.productIndex
        let pTitle = dataset.productTitle
        updateCartItem.decrease(event)
    },
    subscribeArrivalRemind: function (event) {
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
        const that = this
        cartService.subscribeArrivalRemind('WX', dataList, formId).then(function (res) {
            const resData = res.data
            if (resData.code === 0) {
                thirdApi.showModal(resData.data.title, resData.data.content, false).then(function (res) {
                })
            } else if (resData.code === 1) {
                that.wetoast.toast({ title: resData.msg, duration: 1500 })
            } else {
                thirdApi.showToast('已订阅成功！', 'sucess', 2000)
            }
        })
    },
    /* 检查库存[包括限购及其他状态] */
    checkQuantity: function (productSku, quantity, stock, seckillLimit) {
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
        updateCartItem.updateCartItem(productId, quantity, addType)
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
     * 滑动结束
     */
    touchE(){
      utils.logi("滑动结束====================================");
      // getVisibleAna('#product-item-1');
      console.log(this.data.noRelativeProducts, this.data.searchResultList)
      if (!this.data.noRelativeProducts && this.data.searchResultList.length == 0){
        getVisibleAna('#product-item-', this.data.recomProducts, "product_show", "search");
      }
      if (this.data.noRelativeProducts && this.data.searchResultList.length == 0){
        getVisibleAna('#product-item-', this.data.recomProducts, "recommend_product_show", "search_result", { invite_code: this.data.inputBox});
      }
    }
})