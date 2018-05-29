/**
 * 获取当前页面
 */
function getPage(){
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    return page
}

/**
 * 是否超时
 * @param  {object}  data 订单数据
 */
function isOverTime(data){
    const page = getPage()
    if(typeof(data) == 'object'){
        if(((data.status == 'PAID' || data.stauts == 'SHIPPED') && data.chrome_info.over_time <= 0 && data.chrome_info != null )){
            page.setData({
                isOverTime: true
            })
        }
    }
}

/**
 * 倒计时动画
 * @param  {Boolean} isClearTimer 是否清除定时器
 * @param  {object}  resData      订单数据
 */
function countDownCanvas(cvs, isClearTimer, resData){
    let app = getApp()
    let appData = app.globalData.userMemberType
    const page = getPage()
    if(page.data.countTimer == null) {
        page.data.countTimer = setInterval(countTimerFn, 1000)
    }
    // canvas画布初始化
    if(isClearTimer) {
        clearInterval(page.data.countTimer)
        page.setData({
            countTimer: null
        })
    }
    countTimerFn()

    function countTimerFn(){
        let totalMS = page.data.totalMS
        let totalOverTime = page.data.totalOverTime
        let totalPercent = totalMS / totalOverTime
        if(totalMS <= 0) {
            clearInterval(page.data.countTimer)
            page.setData({
                countTimer: null
            })
            page.isOverTime(resData)
        }
        cvs.clearRect(0, 0, 120, 120)
        cvs.translate(60,60)
        cvs.rotate(270 * Math.PI/180)
        cvs.setStrokeStyle("#eaeaea")
        cvs.setLineWidth(3)
        cvs.arc(0, 0, 50, 0, 2 * Math.PI)
        cvs.stroke()
        cvs.closePath()

        cvs.beginPath()
        cvs.setStrokeStyle("#ff4891")
        cvs.arc(0, 0, 50, 2 * Math.PI - Math.PI * 2 * totalPercent, 2 * Math.PI)
        cvs.stroke()
        cvs.draw()

        totalMS -= 1
        var countTime = formatDuring(totalMS)
        page.setData({
            totalMS: totalMS,
            countTime: countTime
        })
        function formatDuring(mss) {
            // var days = parseInt(mss / (1000 * 60 * 60 * 24));
            var hours = parseInt(mss / (60 * 60));
            var minutes = parseInt((mss % (60 * 60)) / (60)) > 9 ? parseInt((mss % (60 * 60)) / (60)) : '0' + parseInt((mss % (60 * 60)) / (60))
            var seconds = (mss % 60) > 9 ? (mss % 60) : '0' + (mss % 60)
            return hours + ":" + minutes + ":" + seconds;
        }
    }
}

module.exports = {
    isOverTime: isOverTime,
    countDownCanvas: countDownCanvas
}