//存储管理器，负责所有的本地存储，其它地方不再关心存储的问题
const thirdApi = require("../../utils/services/third_api");

const CONSTANT = {
    URL_KEY_CONSTANT: 'hostUrlKey',
    WX_LOGIN_KEY: "wx_login_key",
    INDEX_POP_DATE: "indexPopDate",
    CHECK_OUT_ACTIVE_CART_ITEMS: "checkoutActiveCartItems",
    ACTIVE_ORDER_ITEM_LIST: 'active_order_item_list', // 订单商品列表页(有效商品)
    INACTIVE_ORDER_ITEM_LIST: 'inactive_order_item_list', // 订单商品列表页(失效商品)
    UUID: 'UUID',//启动时生成的Unique Code
    SEARCH_KEY_WORD: 'search_key_word',
    CART_VIP_CARD_SELECT_ID: "CART_VIP_CARD_SELECT_ID",
}

/**
 * 这里面的内容是不需要在更换地址时清空的
 */
const CONSTANT_2 = {
    URL_CONFIG_KEY: 'URL_CONFIG_KEY',
}

function clearAllData() {
    for (const key in CONSTANT) {
        thirdApi.setStorageSync(CONSTANT[key], null);
    }
}

function getUrlConfigArray() {
    let urlConfigArray = thirdApi.getStorageSync(CONSTANT_2.URL_CONFIG_KEY);

    if (!urlConfigArray) {
        urlConfigArray = [0, 0, 0, 0];
    }

    return urlConfigArray;
}

function setUrlConfigArray(newConfigUrlArray) {
    thirdApi.setStorageSync(CONSTANT_2.URL_CONFIG_KEY, newConfigUrlArray);
}


function getUniqueCode() {
    return thirdApi.getStorageSync(CONSTANT.UUID);
}

function storeUniqueCode(UUID) {
    thirdApi.setStorageSync(CONSTANT.UUID, UUID);
}
function storeHistorySearch(historyValues, successCB) {
    thirdApi.setStorage(CONSTANT.SEARCH_KEY_WORD, historyValues, successCB);
}

function getHistorySearch(successCB) {
    thirdApi.getStorage(CONSTANT.SEARCH_KEY_WORD, successCB);
}

function getLastHostUrl() {
    return thirdApi.getStorageSync(CONSTANT.URL_KEY_CONSTANT);
}

function setCurrentHostUrl(newUrl) {
    thirdApi.setStorageSync(CONSTANT.URL_KEY_CONSTANT, newUrl);
}

function setCheckoutActiveCartItems(checkoutActiveCartItems) {
    thirdApi.setStorageSync(CONSTANT.CHECK_OUT_ACTIVE_CART_ITEMS, checkoutActiveCartItems);
}

function getCheckoutActiveCartItems() {
    return thirdApi.getStorageSync(CONSTANT.CHECK_OUT_ACTIVE_CART_ITEMS);
}

function setIndexPopDate(date) {
    thirdApi.setStorageSync(CONSTANT.INDEX_POP_DATE, date);
}

function getIndexPopDate() {
    return thirdApi.getStorageSync(CONSTANT.INDEX_POP_DATE);
}

function setWXLoginKey(wxappLoginResData) {
    thirdApi.setStorageSync(CONSTANT.WX_LOGIN_KEY, wxappLoginResData);
}

function getWXLoginKey() {
    return thirdApi.getStorageSync(CONSTANT.WX_LOGIN_KEY);
}

//这个方法用于填单页到商品列表页之间的数据传值
function setActiveOrderItemList(orderItemList) {
    getApp().globalData.shoppingCartInfo[CONSTANT.ACTIVE_ORDER_ITEM_LIST] = orderItemList;
}

function getActiveOrderItemList() {
    return getApp().globalData.shoppingCartInfo[CONSTANT.ACTIVE_ORDER_ITEM_LIST];
}

//这个方法用于填单页到商品列表页之间的数据传值
function setInactiveOrderItemList(orderItemList) {
    getApp().globalData.shoppingCartInfo[CONSTANT.INACTIVE_ORDER_ITEM_LIST] = orderItemList;
}

function getInactiveOrderItemList() {
    return getApp().globalData.shoppingCartInfo[CONSTANT.INACTIVE_ORDER_ITEM_LIST];
}

/**
 * 存储用户在购物车选择点击的会员卡
 * @param {*} vipCardID 
 */
function setVipCardSelectID(vipCardID) {
    thirdApi.setStorageSync(CONSTANT.CART_VIP_CARD_SELECT_ID, vipCardID);
}

function getVipCardSelectID() {
    let cardID = thirdApi.getStorageSync(CONSTANT.CART_VIP_CARD_SELECT_ID);
    if (!cardID)
        return '';
    return cardID;
}

module.exports = {
    getLastHostUrl,
    setCurrentHostUrl,
    setCheckoutActiveCartItems,
    setIndexPopDate,
    setWXLoginKey,
    getWXLoginKey,
    setActiveOrderItemList,
    getActiveOrderItemList,
    setInactiveOrderItemList,
    getInactiveOrderItemList,
    getIndexPopDate,
    getCheckoutActiveCartItems,
    clearAllData,
    getUrlConfigArray,
    setUrlConfigArray,

    getUniqueCode,
    storeUniqueCode,
    storeHistorySearch,
    getHistorySearch,

    setVipCardSelectID,
    getVipCardSelectID,


}