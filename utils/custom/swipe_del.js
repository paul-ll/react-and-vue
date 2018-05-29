/**
 * 获取当前页面
 */
function getPage(){
	const pages = getCurrentPages()
	const page = pages[pages.length - 1]
	return page
}

/**
 * 获取滑动起点
 */
function swipeStart(event){
	const page = getPage()
	const startPointX = event.changedTouches[0].clientX
	const startPointY = event.changedTouches[0].clientY
	let currentId = event.currentTarget.dataset.cartItemId
	page.setData({
		startPointX: startPointX,
		startPointY: startPointY,
		currentId: currentId
	})
}

/**
 * 监听触摸位置
 */
/*function swipeMove(event){
	const page = getPage()
	let movePointX = event.changedTouches[0].clientX
	let movePointY = event.changedTouches[0].clientY
	let moveLengthX = movePointX - page.data.startPointX
	let moveLengthY = movePointY - page.data.startPointY
	if(moveLengthX <= -50){
		moveLengthX = -50
	}else if (moveLengthX >=0){
		moveLengthX = 0
	}
	
	// 当触发上下滑动的时候阻止左右滑动
	if(Math.abs(moveLengthY) >= 10){
		page.setData({
			swipeDel: 'transition: all 20ms ease-out;transform: translateX(0px)'
		})
		return
	}

	page.setData({
		swipeDel: 'transition: all 20ms ease-out;transform: translateX(' + moveLengthX + 'px)'
	})
}*/

/**
 * 获取触摸结束位置
 */
function swipeEnd(event){
	console.log(event)
	const page = getPage()
	let endPointX = event.changedTouches[0].clientX
	let endPointY = event.changedTouches[0].clientY
	let endLengthX = endPointX - page.data.startPointX
	let endLengthY = endPointY - page.data.startPointY

	// let currentId = event.currentTarget.dataset.cartItemId
	// let previousId = page.data.previousId ? page.data.previousId : ""

	
	if(endLengthX <= -25) {
		endLengthX = -50
	}else {
		endLengthX = 0
	}
	let currentId = event.currentTarget.dataset.cartItemId
	let previousId = page.data.currentId ? page.data.currentId : ""
	if (currentId != previousId) {
		return
	} 
	// 当触发上下滑动的时候阻止左右滑动
	if(Math.abs(endLengthY) >= 30 && Math.abs(endLengthX) <= 3){
		// page.setData({
		// 	swipeDel: 'transition: all 20ms ease-out;transform: translateX(0px)'
		// })
		return
	}

	page.setData({
		swipeDel: 'transition: all 100ms ease-in-out;transform: translateX(' + endLengthX + 'px)',
		previousId: previousId
	})
}

module.exports = {
	swipeStart,
	// swipeMove,
	swipeEnd
}