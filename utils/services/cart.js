const serviceUtils = require('../service_utils.js')

//获取购物车全部商品信息,isClear:true清空售罄商品
function getAllCartItems(isClear = false, productsList) {
    const app = getApp()
    let url = serviceUtils.getRequestUrl('cart')
    if (isClear === true) {
        url += '&operation=1'
    }
    let reqList = productsList
    const header = app.getAddressHeader()
    return serviceUtils.genPromise(url, 'POST', reqList, header.header);
}

//加入商品到购物车，单个
function addToCart(productId, quantity) {
    let productData = {};
    productData[productId] = quantity;
    const url = serviceUtils.getRequestUrl('addToCart')
    return serviceUtils.genPromise(url, 'POST', productData);
}

//加入商品到购物车，批量
function addToCarts(productLists, addType) { //addType:1、添加购物车，2、从购物车删除
    const app = getApp()
    let operation = ''
    if (addType === 2) {
        operation = '-'
    }
    let productData = {}
    console.log(productLists)
    for (let i = 0; i < productLists.length; ++i) {
        productData[productLists[i].sku] = operation + productLists[i].quantity
    }
    const url = serviceUtils.getRequestUrl('addToCart')
    const header = app.getAddressHeader()
    return serviceUtils.genPromise(url, 'POST', productData, header.header);
}

//计算选种商品价格
function cartPromotion(dataList) {
    const app = getApp()
    const url = serviceUtils.getRequestUrl('promotion')
    const header = app.getAddressHeader()

    //2017-11-27之后，没有了双价体系，这里的固定值为1
    dataList.balance_type = 1;
    const selectVipCardID = serviceUtils.storageManager.getVipCardSelectID();
    dataList.vip_card_id = selectVipCardID + '';

    return serviceUtils.genPromise(url, 'POST', dataList, header.header);
}

//订阅商品通知
function subscribeArrivalRemind(type, reqList = {}, formId) {
    const app = getApp()
    const subscribeData = {}
    reqList.form_id = formId
    const url = serviceUtils.getRequestUrl('subscribe', type, 1, reqList)
    const header = app.getAddressHeader()
    return serviceUtils.genPromise(url, 'GET', subscribeData, header.header);
}

//结算校验
function checkoutPrepare(addressId, products, voucherIdList, from, vipCardID) {
    const app = getApp()

    let newProducts = [];
    let tempProduct;
    let productLength = products.length;
    for (let i = 0; i < productLength; i++) {
        tempProduct = products[i];
        newProducts[i] = {
            quantity: tempProduct.quantity,
            sku: tempProduct.sku,
            //赠品数量
            present_num: tempProduct.present_num ? tempProduct.present_num : 0,
            nationwide: tempProduct.nationwide
        }
    }


    const checkoutData = {
        address_id: addressId,
        balance_type: 1,
        products: newProducts,
        voucher_id_list: voucherIdList,
        from: from
    }

    if (vipCardID) {
        checkoutData.vip_card_id = vipCardID + '';
    }

    const url = serviceUtils.getRequestUrl('checkoutPrepare')
    const header = app.getAddressHeader()
    return serviceUtils.genPromise(url, 'POST', checkoutData, header.header);
}

//结算
function checkout(addressId, otdLists, products, payType, formId, voucherIdList, selectVipCardId) {
    const app = getApp()
    const checkoutData = {
        address_id: addressId,
        balance_type: 1,
        event_internal_id: null,
        group_internal_id: null,
        message: "",
        otd_list: otdLists,
        pay_type: payType,
        products: products,
        promotion_internal_ids: [],
        real_receiver_name: null,
        vip_card_id: selectVipCardId,
        voucher_id_list: voucherIdList,
        new_xcx_version: "1"//2018年01月19日15:29:39，和后台核对，利用这个字段做版本兼容，防止上线间隙发生下单问题
    }
    const reqList = {
        form_id: formId
    }
    const url = serviceUtils.getRequestUrl('checkout', "", 1, reqList)
    const header = app.getAddressHeader()
    return serviceUtils.genPromise(url, 'POST', checkoutData, header.header);
}

module.exports = {
    getAllCartItems: getAllCartItems,
    addToCart: addToCart,
    addToCarts: addToCarts,
    cartPromotion: cartPromotion,
    subscribeArrivalRemind: subscribeArrivalRemind,
    checkoutPrepare: checkoutPrepare,
    checkout: checkout
}
