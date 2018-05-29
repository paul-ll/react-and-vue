const redPacketService = require('../../services/red_packet.js')
/**
 * 获取当前页面
 */
function getPage(){
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    return page
}

function closeRedPacket() {
    const page = getPage()
    page.setData({
        'redPacket.smaller': 'smaller',
    })
    setTimeout(function () {
        page.setData({
            isShowPop: 0,
        })
    }, 500)
}

function getRedPacket(formId, orderId) {
    const page = getPage()
    page.setData({
        'redPacket.changeBtn': true
    })
    redPacketService.getRedPacket(formId, orderId).then(res => {
        setTimeout(function() {
            page.setData({
                'redPacket.resultImg': res.data.resultImg
            })
        }, 1000)
    }, error => {
        console.log("get red packet error", error)
        page.setData({
            'redPacket.changeBtn': false
        })
    }).catch(res => {
        console.log("get red packet catch", res)
        page.setData({
            'redPacket.changeBtn': false
        })
    })
}

module.exports = {
    closeRedPacket: closeRedPacket,
    getRedPacket: getRedPacket
}
