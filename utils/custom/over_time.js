/**
 * Created by Flame on 2016/12/28.
 */

/**
 * 获取当前页面
 */
// function getPage(){
//     const pages = getCurrentPages()
//     const page = pages[pages.length - 1]
//     return page
// }


/**
 * 需要一个目标日期，初始化时，先得出到当前时间还有剩余多少秒
 * 1.将秒数换成格式化输出为XX天XX小时XX分钟XX秒 XX
 * 2.提供一个时钟，每1000ms运行一次，渲染时钟，再总ms数自减1000
 * 3.剩余的秒次为零时，return，给出tips提示说，已经截止
 */

/* 毫秒级倒计时 */
function countdown(that, order_no, totalMicroSecond) {
    // 渲染倒计时时钟
    if(that.data.overTimeList == null){
        return;
    }
    let overTimeList = that.data.overTimeList
    overTimeList[order_no] = dateformat(totalMicroSecond)
    that.setData({
        overTimeList: overTimeList,
    });


    if (totalMicroSecond <= 0) {
        overTimeList[order_no] = {}
        that.setData({
            overTimeList: overTimeList,
        })
        // timeout则跳出递归
        return;
    }
    setTimeout(function() {
        // 放在最后--
        totalMicroSecond -= 1000;
        countdown(that, order_no, totalMicroSecond);
    }, 1000)
}

// 时间格式化输出，如3:25:19。每1000ms都会调用一次
function dateformat(micro_second) {
    // 秒数
    let second = Math.floor(micro_second / 1000);
    // 小时位
    let hour = Math.floor(second / 3600);
    // 分钟位
    let min = Math.floor((second - hour * 3600) / 60);
    // 秒位
    let sec = (second - hour * 3600 - min * 60); // equal to => var sec = second % 60;
    // 毫秒位，保留2位
    let micro_sec = Math.floor((micro_second % 1000) / 10);

    let fmt = (hour < 10 ? '0' + hour : hour) + ':' + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
    return fmt;
}

module.exports = {
    countdown: countdown
}
