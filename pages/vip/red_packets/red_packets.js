const app = getApp()
const vip = require('../../../utils/services/vip.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const {reconnect}  = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const netManager = require('../../../utils/services/net_manager');
const utils = require('../../../utils/util.js')

Page({

  data: {
    packets:[],
    network: {
      noNetwork: false,
      reconnecting: false
    },
    isLoad:false,
    showDialog:false    
    // status  0未领取；1已领取；2已使用；3已过期  
  },
  reconnect,
  onLoad: function (options) {
    new app.globalData.WeToast()
    this.getRedPackets()//获取红包列表
  },
  getRedPackets(){
     vip.getRedPackets().then(res =>{
      wx.setNavigationBarTitle({
        title: res.data.data.page_title
      })
      var results = res.data.data.results
      if(results&&results.length){
          results=results.map(item=>{
            item.preferential_price_length = (item.preferential_price/100 + '').length
            return item
          })
      }
      this.setData({
        packets:results,
        'network.noNetwork': false,
        isLoad: true
      })    
    }, res =>{
        this.setData({
            'network.noNetwork': true,
            isLoad: true
        });
    }).catch(res => console.log(res));
  },
  tovip(){
    appInteriorSkip.switchTabVip()
  },
  closeDialog(){
    this.setData({
      showDialog :false
    })
  },
  goBuyVip(){
    this.setData({
      showDialog :false
    })
    appInteriorSkip.navigateToOpenVip();
  },
  receiveRedPacket(e){  
    var id = e.currentTarget.dataset.id
    let reqList = {
      voucher_internal_id:id
    }
    vip.receiveRedPacket(reqList).then(res =>{
       var resp = res.data 
       if (resp.data.result === true) {
          this.wetoast.toast({title: resp.msg || '领取成功!'})
          this.data.packets = this.data.packets.map(item=>{
            if(item.voucher_internal_id == id){
              item.status = 1
            }
            return item
          })
          this.setData({packets :this.data.packets})
        } else if (resp.code === 1001) {
           this.setData({showDialog :true})
        }
    }, res =>{
      if (err.data.code === 1001) {
          this.setData({showDialog :true})
          return
      }
      this.wetoast.toast({
        title: err.data.msg || '网络请求失败，请稍后重试！'
      })
       
    }).catch(res => console.log(res));
  },
  
  onPullDownRefresh: function () {
    this.getRedPackets()
  }
})