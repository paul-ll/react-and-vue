function flodUp () {
  let page = currtPage()
  if (page.data.isShowDisplayDetail) {
    page.setData({
      isShowDisplayDetail: false
    })
  } else {
    page.setData({
      isShowDisplayDetail: true
    })
  }
}

function currtPage () {
  let pages = getCurrentPages()
  return pages[pages.length - 1]
}

module.exports = {
  flodUp
}