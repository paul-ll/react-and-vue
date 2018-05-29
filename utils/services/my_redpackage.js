const serviceUtils = require('../service_utils')

function getMyRedpackge(pageInfo) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('voucher', '', 1, pageInfo);
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header)
}

function getVoucherList ({ products = null, queryType, from, address_id}) {
  const app = getApp()
  let data = {
    address_id:address_id,
    balance_type: 1,
    products: products,
    query_type: queryType,
    product_coupon_id: app.globalData.currentCouponIds[1],
    coupon_id: app.globalData.currentCouponIds[0],
    from
  }
  const header = app.getAddressHeader()
  const url = serviceUtils.getRequestUrl('vouchers')
  return serviceUtils.genPromise(url, 'POST', data, header.header)
}

function exchangeCode({ addressId = null, discountCode = '', products = [], voucherType = 'packet' }) {
  voucherType = voucherType == 'packet' ? 'packet' : 'coupon'
  const app = getApp()
  let data = {
    address_id: addressId,
    discount_code: discountCode,
    products: products,
    voucher_type: voucherType
  }
  const header = app.getAddressHeader() // 需要用到地址信息的接口需要添加header, 其中包含address_code及station_code等数据  ||  具体表现为, 不添加此header接口返回"未覆盖到该地区"
  const url = serviceUtils.getRequestUrl('vouchercode')
  return serviceUtils.genPromise(url, 'POST', data, header.header)
}

module.exports = {
  getMyRedpackge,
  exchangeCode, getVoucherList
}