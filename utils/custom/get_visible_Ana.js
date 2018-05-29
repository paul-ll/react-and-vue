/**
 * 获取曝光推荐商品进行埋点统计@guozhen
 * @param id : id选择器字符串，
 *        products : 商品列表
 *        eventId : 埋点eventId
 *        label : 埋点label
 *        param1 : 其他参数
 */
const app = getApp();
const requestAna = require('../service_utils.js').requestAna
function getVisibleAna(id, products, eventId, label, param1={}) {
  let all_id = '';
  let that = this;
  if (products.length > 0) {
    // 获取所有推荐商品的id选择器
    products.map((item, index) => {
      all_id += `${id}${index},`
    })
  }
  let { windowHeight, windowWidth } = app.globalData.systemInfo;
  let pos = [];
  let skus = [];
  // console.log("====================================", all_id);
  // 获取所有推荐商品的位置
  wx.createSelectorQuery().selectAll(all_id).boundingClientRect(function (rect) {
    // console.log("====================================", rect);
    if (rect && rect.length > 0) {
      // 遍历商品位置信息
      rect.map((item, index) => {
        // 如果商品位于屏幕内，收集此商品的位置
        if (item.top >= 0 && item.top <= windowHeight && item.right >= 0 && item.right <= windowWidth && item.left >= 0 && item.left <= windowWidth) {
          pos.push(item.dataset.productPos);
          (id == '#single-product-' || id == '#product-item-')&&item.dataset.sku && skus.push(item.dataset.sku)
        }
      })

      // 如果有曝光商品，则上报埋点
      if (pos && pos.length > 0) {
        
        let params = {
          pos: pos,
          skus : skus,
          ...param1,
        }
        requestAna(eventId, label, params);
      }

    }
  }).exec();
}

module.exports = getVisibleAna;
