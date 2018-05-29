/**
 * Created by Flame on 2017/1/4.
 */
const app = getApp()
const appInteriorSkip = require('../services/app_interior_skip.js')
const uilts = require('../util.js')

function bannerSkip(banner) {
    console.log("bannerSkip", banner)
    if (banner != undefined && banner != null) {
        if (banner.link === undefined && banner.link === null) {
            return;
        }
        let reqList
        switch (banner.type.toUpperCase()) {
            case 'PRODUCT':
                let dataList = {
                    productSku: banner.link
                }
                appInteriorSkip.productDetail(dataList)
                break;
            case 'WEBPROMOTION':
                //跳转到活动页
                if (banner.link && banner.link.indexOf("http") == 0) {
                    //解析Http请求参数
                    reqList = getRequestList(banner.link)
                } else if (banner.promotion_id && banner.promotion_id != 0) {
                    reqList = {
                        promotionId: banner.promotion_id
                    }
                    //banner数据类型
                } else if (banner.link && banner.link.indexOf("/pages") == 0) {
                    appInteriorSkip.navigateToWxAppLink(banner.link);
                    return;
                    //灯笼位、瓷片位数据类型
                } else if (banner.params && banner.params.url) {
                    appInteriorSkip.navigateToWxAppLink(banner.params.url);
                    return;
                }
                reqList.isInteriorSkip = '1'
                appInteriorSkip.webPromotion(reqList)
                break;
            //2018年04月09日起逐渐使用WEBPROMOTION类型
            case 'COLLECT_CARD':
                let reqBannerLink = banner.link
                appInteriorSkip.navigateToWxAppLink(reqBannerLink)
                break;
            case 'WXAPPEXCLUSIVELINK':
                // 广告弹屏跳转链接，只有小程序活动
                let reqListLink = banner.link
                console.log("reqList", reqListLink)
                appInteriorSkip.navigateToWxAppLink(reqListLink)
                break;
            case 'INVITE'://邀请有礼
            case 'INVITE_NEW'://新版邀请有礼
                appInteriorSkip.navigateToWelcomePolite();
                break;
            case 'NOJUMP':
                break;
            // 我的余额
            case 'MYBALANCE':
                appInteriorSkip.balanceDetail();
                break;
            // 跳转其他小程序
            case 'THIRDPARTY':
             let arr = banner.link.split(',')
            appInteriorSkip.navigateToOtherApp(arr[1],arr[0]);
            break;
            default:
                break;
        }
    }
}

function getRequestList(str) {
    if (!str) return {}
    let reqList = uilts.getRequest(str)
    console.log("reqList", reqList)
    let stationCode = app.globalData.currentAddressInfo.stationCode == null ? '' : app.globalData.currentAddressInfo.stationCode
    let addressCode = app.globalData.currentAddressInfo.address_code
    console.log("stationCode, addressCode", stationCode, addressCode)
    if (addressCode != '') {
        reqList["address_code"] = addressCode
    }
    if (stationCode != '') {
        reqList["station_code"] = stationCode
    }
    console.log("reqList", reqList)
    return reqList
}

module.exports = {
    getRequestList,
    bannerSkip: bannerSkip
}