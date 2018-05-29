const Promise = require('/external/es6-promise.min.js');
const utils = require('../utils/util.js');
const thirdApi = require('../utils/services/third_api');
const storageManager = require('../utils/services/storage_manager.js');
const netManager = require('../utils/services/net_manager.js');
const configs = netManager.configs;

/**
 * 获取MRYX后端服务器url
 * @param key [后端接口对应标识]
 * @param extras [url后拼接的参数值]
 * @param isExitQs [是否存在请求参数]
 * @param dataList [参数list]
 * @returns {string} [最终请求url]
 */
function getRequestUrl(key, extras = '', isExitQs = 1, dataList = {}, isMps = false) {
  return netManager.getRequestUrl(key, extras, isExitQs, dataList, isMps);
}

/**
 * 获取MRYX支付服务器的url
 * @param key [后端接口对应标识]
 * @returns {string} [最终请求url]
 */
function getPayRequestUrl(key) {
    const url = configs.mryxPayHost + configs.mryxPayPaths[key]
    return url
}

/**
 * 获取小程序内部页面跳转url
 * @param key
 * @returns {*}
 */
function getAppInteriorUrl(key) {
    return configs.app_interior_url[key]
}

/**
 * 获取第三方请求url
 * @param key
 * @returns {*}
 */
function getThirdApiUrl(key) {
    return configs.third_api[key]
}

/**
 * 获取第三方请求所需配置参数
 * @param key
 * @returns {*}
 */
function getThirdApiConfig(key) {
    return configs.third_config[key]
}

function genPromise(url, method = 'GET', data = {}, header) {
    return netManager.genPromise(url, method, data, header);
}

function getAddressInfoWithStr(regionCode, searchStr) {
    const url = getThirdApiUrl('qqtextsearch')
    const qq_map_config = getThirdApiConfig('qq_map')
    let reqData = {
        keyword: searchStr,
        region: regionCode,
        region_fix: 1,
        policy: 1,
        key: qq_map_config.key,
        timeout: 5000
    }
    return genPromise(url, 'GET', reqData)
}

function getGeoLocation(latitude, longitude, distance = 1000) {
    const qq_map_config = getThirdApiConfig('qq_map')
    const url = getThirdApiUrl('geolocation') + "?boundary=nearby(" + latitude + "," + longitude + "," + distance + ")&key=" + qq_map_config.key
    return genPromise(url, 'GET')
}

/**
 * 
 * @param {*} cb 成功回调
 * @param {*} failCb 网络请求失败回调
 * @param {*} authorizationFailCb 微信授权失败回调
 */
function login(cb, failCb, authorizationFailCb) {
    netManager.login(cb, failCb, authorizationFailCb);
}

function getAccessTokenByOpenId(openId) {
    const url = getRequestUrl('accesstoken', openId, 0)
    return genPromise(url);
}

function wxappLogin(loginData) {
    return netManager.wxappLogin(loginData);
}
/**
 * 埋点逻辑
 * 
 * @param {any} eventId 
 * @param {any} lable 
 * @param {any} parameter 
 * @param {any} successCB 成功回调
 * @param {any} failCB 失败回调
 * @returns 埋点逻辑
 */
function requestAna(eventId, lable, parameter, successCB, failCB) {
    const app = getApp()
    parameter = parameter ? parameter : {}
    parameter.source = app.globalData.scene + ''
    parameter.last_page = app.globalData.lastPage || ''
    let appData = app.globalData
    let data = {
        eventId: eventId,
        lable: lable,
        parameter: parameter,
        access_token: appData.wxappLogin && appData.wxappLogin.access_token || '',
        city: appData.currentAddressInfo && appData.currentAddressInfo.city || '',
        location: {
            lat: (appData.currentAddressInfo && appData.currentAddressInfo.lat || '') + '',
            lng: (appData.currentAddressInfo && appData.currentAddressInfo.lng || '') + '',
        },
        user_id: appData.wxappLogin && appData.wxappLogin.user_id + '' || '',
        source: 'weixin_app',
        fromSource: appData.fromSource || '',
        user_type:appData.user_type || '',
    }
    return new Promise((resolve, reject) => {
        thirdApi.wxRequest({
            url: 'https://dc-log.missfresh.cn',
            method: 'POST',
            data: data,
            headers: {
                platform: 'weixin_app'
            },
            success: function (res) {
                successCB && successCB()
                resolve(res && res.data)
            },
            fail: function (err) {
                failCB && failCB()
                reject(err)
            }
        })
    })
}

module.exports = {
    getRequestUrl: getRequestUrl,
    getPayRequestUrl: getPayRequestUrl,
    getAppInteriorUrl: getAppInteriorUrl,
    getThirdApiUrl: getThirdApiUrl,
    getThirdApiConfig: getThirdApiConfig,
    genPromise: genPromise,
    configs: configs,
    requestAna: requestAna,
    getGeoLocation,
    getAddressInfoWithStr,
    getAccessTokenByOpenId,
    wxappLogin,
    login,
    storageManager
}
