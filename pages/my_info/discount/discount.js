//discount.js 折扣卡
const discountCard = require('../../../utils/services/discountcard.js')

Page({
	data: {
		discountcard: {}
	},
	onLoad: function (){
        console.log(" ------------------------------my_info.discount.onload------------------------------ ")
	},
	onShow: function (){
		const that = this;
		discountCard.discountCard().then(function (res){
			const resData = res.data;
			console.log("onShow.discountCard.res", resData)
			that.setData({
				discountcard : resData
			})
		})
	}
})