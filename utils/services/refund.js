const serviceUtils = require('../service_utils.js')
const netManager = require('net_manager.js');

// 退款列表
function refundList(orderid) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('refundList', orderid, 1, {}, false)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', {}, header.header);
}


function refund(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('refund', '', 1, {}, false)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', param, header.header);
}

function refundUpload(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('refundUpload', '', 1, {}, false)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

function uploadImg(param,filePath) {
  const url = serviceUtils.configs.uploadHost + '/' + param.filename;
  const headers = {
    Authorization:param.upload_token,
    'Content-Type':'multipart/form-data',
  }
  const formData = {
      Authorization: param.upload_token,
      FileName: param.filename
  }
  return netManager.uploadFile(url, filePath, formData, headers);
}

function refundCommit(param){
  const app = getApp()
  const url = serviceUtils.getRequestUrl('refundCommit', '', 1, {}, false)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'POST', param, header.header);
}

function progressDetail(param) {
  const app = getApp()
  const url = serviceUtils.getRequestUrl('progressDetail', '', 1, {}, false)
  const header = app.getAddressHeader()
  return serviceUtils.genPromise(url, 'GET', param, header.header);
}

module.exports = {
  refundList,
  refund,
  refundUpload,
  uploadImg,
  progressDetail,
  refundCommit
}