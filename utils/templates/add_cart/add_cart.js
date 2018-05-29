function addToCart() {
  let pages = getCurrentPages()
  let curPage = pages[pages.length - 1]
  this.__page = curPage
  this.__timeout = null
  //附加到page上，方便访问
  curPage.addcart = this

  return this
}

let isAnimationEnd = true;
//加车动画
addToCart.prototype.animateAddToCart = function (label_id, endX, endY) {
  let that = this.__page
  if (!isAnimationEnd) {
    // 判断是否已空闲，如果在执行中，则直接return
    return;
  }
  isAnimationEnd = false;
  // 获取所有推荐商品的位置
  wx.createSelectorQuery().select(label_id).boundingClientRect(function (rect) {
    // console.log("===================================", rect);
    let cartX = endX - (rect.width / 2 + rect.left);      //结束位置（横向偏移位置）
    let cartY = endY - rect.top - rect.height / 2;        //结束位置（纵向偏移位置）
    let animationX = flyX(cartX, rect.left, 0.1);     //创建横向动画
    let animationY = flyY(cartY, rect.top, 0.1);       //创建纵向动画
    let imgUrl = rect.dataset.imgUrl;
    that.setData({
      '__addcart__.anViewY': `width:${rect.width}px;height:${rect.height}px;top:${rect.top}px;border-radius:50%`,
      '__addcart__.anViewX': `width:${rect.width}px;height:${rect.height}px;left:${rect.left}px;background: url(${imgUrl});background-size: 100% 100%;border-radius:50%`,
      '__addcart__.animationX': animationX.export(),
      '__addcart__.animationY': animationY.export(),
    })
    setTimeoutES6(400).then(() => {
      that.setData({
        '__addcart__.animationX': flyX(0, 0, 1, 0).export(),
        '__addcart__.animationY': flyY(0, 0, 1, 0).export(),
        '__addcart__.anViewY': '',
        '__addcart__.anViewX': '',
      })
      isAnimationEnd = true;
    })
  }).exec();
  let setTimeoutES6 = (sec) => { // Promise 化 setTimeout
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve() }, sec)
    })
  }
  let flyX = (cartX, oriX, scale, duration) => { // 水平动画
    let animation = wx.createAnimation({
      duration: duration || 400,
      timingFunction: 'linear',
    })
    animation.translateX(cartX).scaleX(scale).step()
    return animation
  }

  let flyY = (cartY, oriY, scale, duration) => { // 垂直动画
    let animation = wx.createAnimation({
      duration: duration || 400,
      timingFunction: 'ease-in',
    })
    animation.translateY(cartY).scaleY(scale).step()
    return animation
  }
}



module.exports = {
  addToCart
}