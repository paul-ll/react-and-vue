const app = getApp()
const serviceUtils = require('../service_utils.js')

function getQuestionlist(reqList={}) {
  const url = serviceUtils.getRequestUrl('questionlist', '', 1, reqList)
  return serviceUtils.genPromise(url, 'GET');
}

function getQuestionAnswer(reqList={}) {
  const url = serviceUtils.getRequestUrl('questionanswer', '', 1, reqList)
  return serviceUtils.genPromise(url, 'GET');
}

function getQuestionOptions(reqList={}) {
  const url = serviceUtils.getRequestUrl('questionoptions', '', 1, reqList)
  return serviceUtils.genPromise(url, 'GET');
}

module.exports = {
  getQuestionlist:getQuestionlist,
  getQuestionAnswer:getQuestionAnswer,
  getQuestionOptions:getQuestionOptions
}