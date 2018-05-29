const app = getApp()
const cartService = require('../services/cart.js')
function updateCartItem(productId, quantity, addType) {
    const page = app.getPageByMethod('reloadCartItems');
    let productLists = [{
        sku: productId,
        quantity: quantity
    }]
    cartService.addToCarts(productLists, addType).then(function(res) {
        // out_of_limit为特惠商品限购弹出文案, 小程序无此功能, 且该字段影响到了商品数量的计算, 故删除
        if (res.data.out_of_limit || res.data.out_of_limit === '') {
            if (res.data.out_of_limit) {
                page.wetoast.toast({ title: res.data.out_of_limit, duration: 2000 })
            }
            delete res.data.out_of_limit
        }
        
        // 加减购物车时, 将app.globalData.productFromCartInfos数据同步
        for (let sku in res.data) {
            if (app.globalData.productFromCartInfos[sku]) {
                app.globalData.productFromCartInfos[sku].quantity = res.data[sku]
            }
        }
        page.reloadCartItems(res.data);
    })
}

function increase(event) {
    console.log('increase.event', event)
    const page = app.getPageByMethod('updateCartItem');
    let productSku = event.currentTarget.dataset.productSku
    if (page.checkQuantity(productSku)) {
        page.updateCartItem(productSku, 1, 1)
    }
}

function decrease(event) {
    const page = app.getPageByMethod('updateCartItem');
    page.updateCartItem(event.currentTarget.dataset.productSku, 1, 2);
}

function decreaseBySku(sku) {
    const page = app.getPageByMethod('updateCartItem');
    page.updateCartItem(sku, 1, 2);
}

module.exports = {
    updateCartItem: updateCartItem,
    increase: increase,
    decrease: decrease,
    decreaseBySku
}