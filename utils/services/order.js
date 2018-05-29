const serviceUtils = require('../service_utils.js')

/**
 * 分页获取获取所有订单列表
 * @param reqList = {
                page [当前页]
            }
 * @returns {*}
 */
function getAllOrderItems(reqList={}) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('order', '', 1, reqList)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

/**
 * 获取订单详情
 * @param orderId
 * @returns {*}
 */
function getOrderDetail(orderId) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('orderDetail', orderId)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

/**
 * 获取订单履历
 * @param index [订单详情中返回的shipping_code参数]
 * @returns {*}
 */
function orderTrace(index, orderId) {
  const reqList = {
    order_id : orderId
  }
  const url = serviceUtils.getRequestUrl('orderTrace', index, 1, reqList)
  //const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET');
}

/**
 * 订单认证，后端已经废弃了
 * @param orderId
 * @returns {*}
 */
function orderVerify(orderId) {
  const orderVerifyData = {
    id: orderId
  }
  const url = serviceUtils.getRequestUrl('orderVerify', orderId)
  //const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', orderVerifyData);
}

/**
 * 获取支付参数
 * @param orderTid
 * @param payType [支付类型]
 * @returns {*}
 */
function orderPrepay(orderTid, payType) {
  const app = getApp()
  const orderPrepayData = {
    order_tid: orderTid,
    pay_type: payType //web_wxpay_plus
  }
  const url = serviceUtils.getRequestUrl('orderPrepay')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', orderPrepayData, header.header);
}

/**
 * 未支付时取消订单
 * @param id
 * @returns {*}
 */
function cancelOrder(id, reason, formId) {
  const app = getApp()
  const cancelOrderData = {
    id: id,
  }
  const reqList = {
    form_id: formId
  }
  console.log("cancelOrder", formId)
  const url = serviceUtils.getRequestUrl('cancelOrder', id, 1, reqList)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'PUT', cancelOrderData, header.header);
}

/**
 * 支付后取消订单
 * @param id
 * @param reason
 * @returns {*}
 */
function paidCancelOrder(id, reason, formId) {
  const app = getApp()
  const paidCancelOrderData = {
    id: id,
    reason: reason,
  }
  const reqList = {
    form_id: formId
  }
  console.log("paidCancelOrder", formId)
  const url = serviceUtils.getRequestUrl('paidCancelOrder', id, 1, reqList)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', paidCancelOrderData, header.header);
}

/**
 * 获取客服联系信息
 * @returns {*}
 */
function serviceHelp() {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('servicehelp')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
}

/**
 * 检查是否配置支付密码
 * @returns {*}
 */
function rechargePwd() {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('rechargepwd')
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header)
}

/**
 * 余额支付
 * @param interOrderNo
 * @param password
 * @returns {*}
 */
function mryxPayCheckout(interOrderNo, password, passwordV2) {
  const url = serviceUtils.getPayRequestUrl('balancepay')
  const data = {
    inter_order_no: interOrderNo,
    // password: password,
    password_v2: passwordV2
  }
  return serviceUtils.genPromise(url, 'POST', data)
}

/**
 * 支付成功获取信息
 * @param orderId
 * @returns {*}
 */
function orderSuccess(orderId) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('orderSuccess', orderId)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header)
}

/**
 * 发送验证码
 * @param sendData
 * @returns {*}
 */
function sendCheckCode(sendData) {
  const url = serviceUtils.getPayRequestUrl('mobilecode')
  const data = {
    sp_no: sendData.spNo,
    user_id: sendData.userId,
    mobile_no: sendData.phoneNumber,
    type: sendData.type
  }
  return serviceUtils.genPromise(url, 'POST', data)
}

/**
 * 校验验证码
 * @param sendData
 * @returns {*}
 */
function verifyMobileCode(sendData) {
  const strData = "?sp_no=" + sendData.spNo + "&user_id=" + sendData.userId + "&mobile_no="+ sendData.phoneNumber +
      "&sign_method=" + sendData.signMethod + "&sign=" + sendData.sign + "&mobile_code=" + sendData.checkCode
  const url = serviceUtils.getPayRequestUrl('verifymobilecode') + strData
  return serviceUtils.genPromise(url, 'POST')
}

/**
 * 设置余额支付密码
 * @param sendData
 * @returns {*}
 */
function bindPwd(sendData) {
  // const strData = "?sp_no=" + sendData.spNo + "&user_id=" + sendData.userId + "&mobile_no="+ sendData.phoneNumber +
      // "&sign_method=" + sendData.signMethod + "&sign=" + sendData.sign + "&access_token=" + sendData.accessToken
  const url = serviceUtils.getPayRequestUrl('bindpwd')
  const data = {
    sp_no: sendData.spNo + '==',
    user_id: sendData.userId,
    mobile_no: sendData.phoneNumber,
    // sign_method: sendData.signMethod,
    // sign: sendData.sign,
    access_token: sendData.accessToken,
    // password: sendData.passWord,
    password_v2: sendData.passwordV2
  }
  return serviceUtils.genPromise(url, 'POST', data)
}

/**
 * 获取红包，并分享
 *
 * @param {any} {orderId[订单id], userId[用户id]}
 * @returns
 */
function getRedPacketSign({orderId, userId}) {
  const app = getApp()
  let reqList = {
    orderId: orderId,
    senderId: userId
  }
  const url = serviceUtils.getRequestUrl('newpackage', '', 1, reqList)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', {}, header.header)
}

/**
 * 订单红包
 * 
 * @param {any} {orderId[订单id], userId[用户id], sign[签名]} 
 * @returns 
 */
function orderRedPacket({orderId, userId, sign}) {
  const app = getApp()
  let reqList = {
    orderid: orderId,
    userid: userId,
    sign: sign
  }
  const url = serviceUtils.getRequestUrl('orderredpacket', '', 1, reqList)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header)
}

module.exports = {
  getAllOrderItems:getAllOrderItems,
  getOrderDetail:getOrderDetail,
  orderTrace:orderTrace,
  orderVerify:orderVerify,
  orderPrepay:orderPrepay,
  cancelOrder:cancelOrder,
  paidCancelOrder:paidCancelOrder,
  serviceHelp:serviceHelp,
  rechargePwd:rechargePwd,
  mryxPayCheckout:mryxPayCheckout,
  sendCheckCode:sendCheckCode,
  verifyMobileCode:verifyMobileCode,
  bindPwd:bindPwd,
  orderSuccess:orderSuccess,
  getRedPacketSign:getRedPacketSign,
  orderRedPacket:orderRedPacket
}