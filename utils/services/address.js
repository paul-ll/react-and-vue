const serviceUtils = require('../service_utils.js')

function getAllAddressItems() {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('address')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

function optAddressWithId(addressId, method='GET', data={}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('address', addressId)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, method, data, header.header);
}

function addAddress(method='GET', data={}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('addaddress')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, method, data, header.header);
}

function getAllRegionItems() {
  const url = serviceUtils.getRequestUrl('region')
  return serviceUtils.genPromise(url);
}

function getAddressList() {
  const url = serviceUtils.getRequestUrl('addresslist')
  return serviceUtils.genPromise(url);
}

function getCurrentAddress() {
  const url = serviceUtils.getRequestUrl('defaultaddress')
  return serviceUtils.genPromise(url);
}

function chromeView(data, header) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('chromeview')
  header = header || app.getAddressHeader().header
  return serviceUtils.genPromise(url, 'POST', data, header);
}

module.exports = {
  getAllAddressItems:getAllAddressItems,
  optAddressWithId:optAddressWithId,
  addAddress:addAddress,
  getAllRegionItems:getAllRegionItems,
  getAddressList:getAddressList,
  getCurrentAddress:getCurrentAddress,
  chromeView:chromeView
}
