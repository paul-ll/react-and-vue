//以下代码需要在上线发布之前修改为false，禁止日志输出，关闭自定义测试入口，关闭自定义访问地址
const DEBUG_MODE = true;
//是否输出插桩方法调用栈
const DEBUG_STACK_MODE = false;

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//只获取年月日
function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/')
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getRequest(url) {
  let theRequest = new Object();
  let index = url.indexOf("?")
  if (index != -1) {
    let str = url.substr(index + 1);
    let strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
    }
  }
  return theRequest;
}

/**
 * 判断对象是否为空
 * @param Object
 * @returns {boolean}
 */
function gIsEmptyObject(Object) {
  for (let t in Object) {
    return false
  }
  return true
}

/**
 * 将对象转为url参数格式
 * 
 * @param {any} params {a: 1, b: 2, c: 3}
 * @returns "a=1&b=2&c=3"
 */
function buildQuery(params) {
  let str = ''
  let arr = []
  if (!params || gIsEmptyObject(params)) {
    return ''
  }
  for (let key in params) {
    arr.push(key + '=' + params[key])
  }
  return arr.join('&')
}


function getCurrentPage() {
  const pagesArray = getCurrentPages();
  const currentPage = pagesArray[pagesArray.length - 1];
  return currentPage;
}

/**
 * 获取当前日期 格式: 2017-8-18
 * 
 * @returns 2017-8-18
 */
function getNowFormatDate() {
  let date = new Date()
  let strDate = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
  return strDate
}

// 十进制颜色
function deciToHex(color, defaultColor) {
  // 指定个非法的值不生效
  if (color && color[0] === '#') {
    return color
  }
  var c = defaultColor || ''
  color = parseInt(color)
  if (color === undefined || color > 16777215 || color < 0 || color === null) {
    return c
  }
  c = color.toString(16)
  c = leftZeroPad(c, 6)
  c = '#' + c
  return c
}
// 左填充
function leftZeroPad(val, minLength) {
  var MANY_ZEROS = '000000000000000000'
  if (typeof (val) !== 'string') {
    val = String(val)
  }
  return (MANY_ZEROS.substring(0, minLength - val.length)) + val
}

var index = 0;

//同来统计方法调用的时间间隔，用来优化性能
function logTime(arg) {
  index++;

  const app = getApp();
  let current_date = new Date();

  let offsetTime = 0;
  if (app && app.globalData.lastTimeLogFunctionCallTime !== 0) {
    if (app.globalData.startTotalTime == 0) {
      app.globalData.startTotalTime = current_date.getTime();
    }
    offsetTime = current_date.getTime() - app.globalData.lastTimeLogFunctionCallTime;
  }

  let desc = current_date.getMinutes() + "分" + current_date.getSeconds() + '秒' + current_date.getMilliseconds() + "毫秒";

  if (app && app.globalData.startTotalTime != 0) {
    let totalStartTime = new Date(current_date.getTime() - app.globalData.startTotalTime);
    desc += ", 启动总耗时: " + totalStartTime.getMinutes() + "分" + totalStartTime.getSeconds() + "秒" + totalStartTime.getMilliseconds() + "毫秒";
  }
  if (offsetTime != 0) {
    let time = new Date(offsetTime);
    desc += ", 与上一次调用的差值为: " + time.getSeconds() + "秒" + time.getMilliseconds() + "毫秒";
    if (DEBUG_STACK_MODE) {
      let currentCallStack = (new Error).stack;
      desc += ", 当前的调用栈为: " + currentCallStack;
    }
  }

  logi('TIME_TAG ==> ' + index + (arg ? " " + arg : "") + ' 当前方法的调用时间为: ' + desc);

  if (app) {
    app.globalData.lastTimeLogFunctionCallTime = current_date.getTime();
  }
}

function logi(infoMsg) {
  if (DEBUG_MODE) {
    console.info(infoMsg);
  }
}

function logDebugInfo() {
  if (DEBUG_MODE) {
    console.debug(...arguments);
  }
}

function loge(error) {
  if (DEBUG_MODE) {
    console.error(error);
  }
}

function createUUID() {
  return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function matchSt(text, color) {
  let decolor = color || '#ff4891'
  let l1 = `<text style="color:${decolor}">`
  let l2 = `</text>`
  text = text.replace(/\#\_\$([^\#\_\$]*)\#\_\$/g, function () {
    return `${l1}${arguments[1]}${l2}`
  })
  return text;
}


module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  gIsEmptyObject: gIsEmptyObject,
  getRequest: getRequest,
  buildQuery: buildQuery,
  getNowFormatDate,
  deciToHex,
  logTimeTag: logTime,
  logi,
  DEBUG_MODE,
  logDebugInfo,
  loge,
  createUUID,
  leftZeroPad,

  matchSt,
  getCurrentPage,
}