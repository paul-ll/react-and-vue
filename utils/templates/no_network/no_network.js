function reconnect() {
    const crtPage = getCurrentPages();
    const len = crtPage.length
    const page = crtPage[len - 1]
    page.setData({
        'network.reconnecting': true,
        needRefresh: true,
    })
    page.onShow()

    // if(typeof page[fn] == 'function') {
    //   page[fn]()
    // } else {
    // }
    setTimeout(function () {
        page.setData({
            'network.reconnecting': false,
            needRefresh: false
        })
    }, 4000)
    
}

module.exports = {
    reconnect: reconnect
}