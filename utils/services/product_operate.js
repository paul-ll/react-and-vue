/**
 * 商品加减相关操作类，相关页面必须提供reloadCartItems、updateCartItem方法
 */

const app = getApp();
const updateCartService = require('../custom/update_cart_item.js')
const cartService = require('./cart.js')
const utils = require('../../utils/util');

/**
 * 默认的回调函数
 */
let mCallback = {
    onFail() { },
    onSuccess() { }
}

function setCallback(callback) {
    mCallback = callback;
}

/**
 * 方法会对参数进行检查，callback为结果回调，从onFail中接收失败结果，成功回调onSuccess，无结果
 * @param {*} productSku 
 * @param {*} seckillLimit 
 * @param {*} stock 
 * @param {*} quantity 
 * @param {*} callback 
 */
function addToCart(productSku, seckillLimit, stock, quantity,callback = mCallback) {
    if (checkQuantity(productSku, quantity, stock, seckillLimit, callback)) {
      updateCartService.updateCartItem(productSku, 1, 1)
    }
}

function decrease(sku) {
    updateCartItem(sku, 1, 2);
}

/* 检查库存[包括限购及其他状态] */
function checkQuantity(productSku, quantity, stock, seckillLimit, callback) {
    if (stock <= 0) {
        callback.onFail({ title: '该产品已售罄', duration: 2000 })
        return false
    } else if (quantity >= stock) {
        callback.onFail({ title: '只剩' + stock + '份啦~', duration: 2000 })
        return false
    } else if (seckillLimit && quantity >= seckillLimit) {
        callback.onFail({ title: '活动期间本商品限购' + seckillLimit + '份', duration: 2000 })
        return false
    }
    return true
}

/* 更新购物车数据 */
function updateCartItem(productId, quantity, addType) {
    updateCartService.updateCartItem(productId, quantity, addType)
}

/* 同步购物车信息 */
function getPoductFromCartInfos() {
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

        if (activeCartItems && activeCartItems.length > 0) {
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
        }
        // 获取无效商品列表 
        if (inactiveCartItems && inactiveCartItems.length > 0) {
            for (let n = 0; n < inactiveCartItems.length; ++n) {
                let inactiveCartItem = inactiveCartItems[n]
                productSku = inactiveCartItem.sku
                productFromCart = {}
                productFromCart['sku'] = productSku
                productFromCart['isActive'] = 2
                productFromCart['quantity'] = inactiveCartItems.quantity
                productFromCartInfos[productSku] = productFromCart
            }
        }
        app.setProductFromCartInfos(productFromCartInfos)

        let cartCount = app.globalData.cartCount

        if (mCallback != null) {
            mCallback.onSuccess({
                productFromCartInfos: productFromCartInfos, cartCount: cartCount
            });
        }
    });
}
function reloadCartItems(cartItems) {
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
    }
    app.setProductFromCartInfos(productFromCartInfos)

    let cartCount = app.globalData.cartCount

    if (mCallback != null) {
        mCallback.onSuccess({
            productFromCartInfos: productFromCartInfos, cartCount: cartCount
        });
    }
}

function mountProductOperateMethod() {
    const currentPage = utils.getCurrentPage();

    currentPage.data.cartInfo = {
        productFromCartInfos: {},
        cartCount: 0
    }

    //页面更新
    currentPage.onFail = function (error) {
        currentPage.showToast(error.title);
    }
    currentPage.onSuccess = function (res) {
        currentPage.setData({
            cartInfo: res,
        })
    }

    setCallback({
        onFail: currentPage.onFail,
        onSuccess: currentPage.onSuccess,
    })
    /* 更新购物车数据 */
    currentPage.updateCartItem = function (productId, quantity, addType) {
        updateCartItem(productId, quantity, addToCart);
    }
    /* 同步购物车信息 */
    currentPage.getPoductFromCartInfos = function () {
        getPoductFromCartInfos();
    }
    currentPage.reloadCartItems = function (cartItems) {
        reloadCartItems(cartItems);
    }
}

function syncCartCount() {
    getPoductFromCartInfos();
}

function unmountProductOperateMethod() {
    setCallback(null);
}

module.exports = {
    addToCart,
    decrease,
    checkQuantity,
    updateCartItem,
    getPoductFromCartInfos,
    reloadCartItems,
    setCallback,
    mountProductOperateMethod,
    unmountProductOperateMethod,
    syncCartCount,
}