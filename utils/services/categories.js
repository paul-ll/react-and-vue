const serviceUtils = require('../service_utils.js')
const netManager = require('../services/net_manager');

function getAllCategories() {
  const app = getApp()
  const url = netManager.buildRequestObj('categories', {});
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', header.data, header.header)
}

function getCategoryWithId(categoryId) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('category', categoryId)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', header.data, header.header)
}

function getSkuDetail(productSku) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('product', productSku)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', header.data, header.header)
}

module.exports = { getAllCategories: getAllCategories, getCategoryWithId: getCategoryWithId, getSkuDetail: getSkuDetail }
