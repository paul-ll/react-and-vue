const app = getApp()
const utils = require('../../../utils/util.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const orderService = require('../../../utils/services/order.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const thirdApi = require('../../../utils/services/third_api.js')
const addressService = require('../../../utils/services/address.js')
const categoryService = require('../../../utils/services/categories.js')
const servicesUtils = require('../../../utils/service_utils')
const { reconnect } = require('../../../utils/templates/no_network/no_network.js')
const welcomePolite = require('../../../utils/services/welcomePolite.js')
Page({
      /**
       * 页面的初始数据
       */
      data: {
				pageData:'',
				network: {
					noNetwork: false,
					reconnecting: false
				},
				isLoaded:false,
				isShowMask:false,
				productDetail:null,
        btnText:'领取新人福利，查看更多好商品'
      },
    
      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function (options) {
				thirdApi.showToast('加载中', 'loading', 10000)   
				if (options.last_page) {
					app.globalData.lastPage = options.last_page
					delete options.last_page // 埋点数据需要
				}
				this.setData({
					options: options
				})
				new app.globalData.WeToast()
				this.initPage()
      },
      initPage: function () {
		
		const that = this
		if (!app.globalData.wxappLogin) {
		  app.getUserInfo(wxappLogin => {
			utils.logi(wxappLogin)
			app.globalData.wxappLogin = wxappLogin
			
			app.getAddressInfo(() => {
			  that.getPageData()
			},false)
		  })
		} else {
		  this.getPageData()
		}
        
	  },
	  getPageData() {
		let params = this.data.options
        const that = this;
		let info = {
		  inviteCode: params.inviteCode,
		  inviteId: params.inviteId,
		}
		  welcomePolite.gitActiveWelcomePolite(info.inviteCode,info.inviteId).then((res) => {
			let resData = res.data 
		  // 将10进制色值转为16进制
		  if (resData.code == 0) {
			for (let key in resData.color_info) {
			  resData.color_info[key] = utils.deciToHex(resData.color_info[key])
			}
			resData.bgcolor = utils.deciToHex(resData.bgcolor)
			if (resData.status_text) {
			  this.wetoast.toast({ title: resData.status_text, duration: 2000 })      
			}
			this.setData({
				pageData: resData,
				'network.noNetwork': false,
			  isLoaded:true,
			})
		  } else {
			this.wetoast.toast({ title: resData.msg || '网络异常, 请稍后重试~', duration: 2000 }) 
			that.setData({
				isLoaded:true,
				'network.noNetwork': true
			}) 
		  }
		  thirdApi.hideToast()      
		}, (err) => {
		  thirdApi.hideToast()      
			this.wetoast.toast({ title: err.data.msg || '网络异常, 请稍后重试~', duration: 2000 })
			that.setData({
					isLoaded:true,
          'network.noNetwork': true
        })
		  utils.logi(err)
		})
	  },
	  getStationCode: function () {
		return categoryService.getAllCategories()
		},
		postClick:function(event){
			let productSku = event.currentTarget.dataset.sku
			const that = this
			categoryService.getSkuDetail(productSku).then(function (res) {
				let resData = res.data
				// code值存在且不为0时, 说明拉取信息出错
				console.log(resData)
				if (resData.code) {
					that.wetoast.toast({ title: resData.msg || '请求出错啦~', duration: 2000 })      
					return
				}
				if (that.data.productId) {
					let productSku = event.currentTarget.dataset.sku
					let name = event.currentTarget.dataset.name
					let index = event.currentTarget.dataset.index
				requestAna('click_tj_skusv', 'weixin_get_voucher', {
							skus: productSku,
							pos:index,
							p_titles:name,
				})  
				}
				if (resData.vip_price_pro && resData.vip_price_pro.price_up) {
					// 将十进制数值转化为色值
					resData.vip_price_pro.price_up.color = utils.deciToHex(resData.vip_price_pro.price_up.color)
					resData.vip_price_pro.price_down.color = utils.deciToHex(resData.vip_price_pro.price_down.color)
				}
				that.setData({
					productDetail: resData,
					isShowMask:true,
				})
			}, function (err) {
				that.wetoast.toast({ title: err.msg || "请求出错啦~", duration: 2000 })
				that.setData({
					'network.noNetwork': true,
			})
			}).catch(res => utils.logi("getSkuDetail.catch.res", res));
		},
	  productClick (event) {
        let productSku = event.currentTarget.dataset.sku
        let name = event.currentTarget.dataset.name
        let index = event.currentTarget.dataset.index
		requestAna('click_tj_skusv', 'weixin_get_voucher', {
            skus: productSku,
            pos:index,
            p_titles:name,
		})    
		appInteriorSkip.productDetail({productSku})
	  },
	  goToIndexPage () {
			requestAna('invite_page', 'receive_red_package')  
			if (!app.globalData.wxappLogin) {
				app.getUserInfo(wxappLogin => {
				utils.logi(wxappLogin)
				app.globalData.wxappLogin = wxappLogin
				
				app.getAddressInfo(() => {
					this.getWelcomePack();
				},false)
				})
			} else {
				this.getWelcomePack();
			}
	
        },
        goToMore(){
            appInteriorSkip.switchTabIndex()
        },
			getWelcomePack() {
            const that = this;
            let params = this.data.pageData;
            const inviteCode = params.share_invite_content.inviteCode;
            const inviteId = params.share_invite_content.inviteId;
						const openid = params.share_invite_content.openid;
				welcomePolite.gitActiveWelcomePoliteEnter(inviteCode,inviteId,openid).then((res) => {
				let resData = res.data
				requestAna('invite_page', 'receive_red_package')    
			console.log(resData)
				// 将10进制色值转为16进制
				if (resData.code == 0) {
				for (let key in resData.color_info) {
					resData.color_info[key] = utils.deciToHex(resData.color_info[key])
				}
				resData.bgcolor = utils.deciToHex(resData.bgcolor)
				if (resData.msg) {
					that.wetoast.toast({ title: resData.msg, duration: 2000 })      
				}
				setTimeout(function () {
					appInteriorSkip.switchTabIndex()
			}, 2000)
				
				} else {
           that.wetoast.toast({ title: resData.msg || '网络异常, 请稍后重试~', duration: 2000 })    
				}
				thirdApi.hideToast()      
			}, (err) => {
				thirdApi.hideToast()      
				that.wetoast.toast({ title: err.data.msg || '网络异常, 请稍后重试~', duration: 2000 })
				that.setData({
					'network.noNetwork': true,
			})
				utils.logi(err)
			})
			},
      /**
       * 生命周期函数--监听页面初次渲染完成
       */
      onReady: function () {
      
      },
			maskClick:function(){
				this.setData({
					isShowMask:false
				})
			},
      /**
       * 生命周期函数--监听页面显示
       */
      onShow: function () {
				
      },
    
      /**
       * 生命周期函数--监听页面隐藏
       */
      onHide: function () {
      
      },
			reconnect:function(){
			
				this.setData({
					isLoaded:false,
				})
				this.initPage()
			},
      /**
       * 生命周期函数--监听页面卸载
       */
      onUnload: function () {
      
      },
    
      /**
       * 页面相关事件处理函数--监听用户下拉动作
       */
      onPullDownRefresh: function () {
      
      },
    
      /**
       * 页面上拉触底事件的处理函数
       */
      onReachBottom: function () {
      
      },
			goToIndexHome:function(){
				requestAna('receive_coupon', 'product_detail_popup')
				if (!app.globalData.wxappLogin) {
					app.getUserInfo(wxappLogin => {
					utils.logi(wxappLogin)
					app.globalData.wxappLogin = wxappLogin
					
					app.getAddressInfo(() => {
						this.getWelcomePack();
					},false)
					})
				} else {
					this.getWelcomePack();
				} 
			},
      /**
       * 用户点击右上角分享
       */
      onShareAppMessage: function () {
        let that = this;
				let title = "";
				console.log(that.data.pageData)
        if (that.data.pageData.share_invite_content.miniAppShareInfo.miniTitle){
          title =that.data.pageData.share_invite_content.miniAppShareInfo.miniTitle
        }
        let miniImgUrl = '';
        if (that.data.pageData.share_invite_content.miniAppShareInfo.miniImgUrl) {
          miniImgUrl = that.data.pageData.share_invite_content.miniAppShareInfo.miniImgUrl
        }
        let path = '';
				if (that.data.pageData.share_invite_content.miniAppShareInfo.miniPath) {
					path = that.data.pageData.share_invite_content.miniAppShareInfo.miniPath
				}
        return {
          title: title,
          imageUrl: miniImgUrl,
          path: path,
        }
      }
    })