
const app = getApp()
const utils = require('../../utils/util');



function mountProductMethod() {
    const currentPage = utils.getCurrentPage();

    currentPage.data.promotionTags = [];
    currentPage.data.miniStartInfo = null;

    if (app.globalData.miniStartInfo) {
        currentPage.setData({
            miniStartInfo: app.globalData.miniStartInfo
        })
    }

    currentPage.getWidth = function (event) {
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
    }


    currentPage.getPriceTagWidth = function (event) {
        let width = 0
        let height = 22
        let imgWidth = event.detail.width
        let imgHeight = event.detail.height
        width = imgWidth / imgHeight * height
        this.setData({
            priceTagWidth: width
        })
    }
}

module.exports = {
    mountProductMethod,
}