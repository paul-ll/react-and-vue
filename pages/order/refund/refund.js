// pages/order/refund/refund.js
const app = getApp()
const refund = require('../../../utils/services/refund.js')
const thirdApi = require('../../../utils/services/third_api.js')
const appInteriorSkip = require('../../../utils/services/app_interior_skip.js')
const no_network = require('../../../utils/templates/no_network/no_network.js')
const requestAna = require('../../../utils/service_utils.js').requestAna
const serviceUtils = require('../../../utils/service_utils.js')
const utilMd5 = require('../../../utils/md5.js')
const netManager = require('../../../utils/services/net_manager');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: {},
    problem: '',
    inputValue: '',
    count: 0,
    refundPrice: 0,
    problemTitleOne: '',
    problemTitleTwo: '',
    labelArrOne: [],
    labelArrTwo: [],
    labelArr: [],
    selectlabelOne: [],
    selectlabelTwo: [],
    proportion: '',
    refundImgArr: [],
    showBounce: false,
    orderId: "",
    orderItemId: "",
    imageCount: 0,
    itemImagesArr: [],
    nodata: {
      noData: false,
      imgUrl: '',
      noDataText: ''
    },
    haveData: false,
    loading: true,
    network: {
      reconnecting: false,
      noNetwork: false
    },
    loadingHidden: true,
    imageHost:netManager.configs.imageHost,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      orderId: options.orderId,
      orderItemId: options.orderItemId,
    })
    new app.globalData.WeToast()

    this.addData()
  },
  // 重新加载数据
  reconnect: function () {
    let that = this;
    that.setData({
      loading: true,
      'network.noNetwork': false,
    })

    that.addData();
  },
  // 重新加载数据
  noDataAction: function () {
    let that = this;
    that.setData({
      loading: true,
      'nodata.noData': false,
    })
    that.addData();
  },
  addData: function () {
    let that = this;
    let param = {
      order_id: that.data.orderId,
      order_item_id: that.data.orderItemId
    }

    refund.refund(param).then(res => {

      if (res.data.code == 0) {
        let result = res.data.result;
        that.setData({
          loading: false,
          haveData: true,
          result: result,
          problemTitleOne: result.attach[0].name,
          problemTitleTwo: result.attach[1].name,
          labelArrOne: result.attach[0].items,
          labelArrTwo: result.attach[1].items
        })
      }
      else {
        that.setData({
          loading: false,
          haveData: false,
          'nodata.noData': true,
          'nodata.imgUrl': '/images/net_nodata.png',
          'nodata.noDataText': "加...加...加...加载失败了，请稍后重试～"
        })
      }
    }, error => {
      // 设置无网络
      that.setData({
        loading: false,
        haveData: false,
        'network.noNetwork': true,
      })
    })
  },
  inputAction: function (e) {
    let count = e.detail.value.length
    if (count <= 100) {
      this.setData({
        count: count,
        inputValue: e.detail.value
      })
    }
    else {
      this.setData({
        count: count,
        inputValue: this.data.inputValue
      })
    }
  },
  oneAction: function () {
    let that = this
    that.setData({
      problem: 'one',
      labelArr: that.data.labelArrOne
    })
  },
  twoAction: function () {
    let that = this
    that.setData({
      problem: 'two',
      labelArr: that.data.labelArrTwo
    })
  },
  closeBounced: function () {
    this.setData({
      showBounce: false
    })
  },
  showBounced: function () {
    this.setData({
      showBounce: true
    })
  },
  thirtyAction: function () {
    let that = this
    that.setData({
      proportion: 'little',
      refundPrice: that.data.result.refund_payment.little / 100.0
    })
  },
  fiftyAction: function () {
    let that = this
    that.setData({
      proportion: 'half',
      refundPrice: that.data.result.refund_payment.half / 100.0
    })
  },
  hundredAction: function () {
    let that = this
    that.setData({
      proportion: 'all',
      refundPrice: that.data.result.refund_payment.all / 100.0
    })
  },
  labelAction: function (e) {
    let that = this;

    for (let i = 0; i < that.data.labelArr.length; i++) {
      if (e.target.dataset.item.tag == that.data.labelArr[i].tag) {
        if (that.data.labelArr[i].select == 'true') {
          // 选中的再次选择去掉选中
          that.data.labelArr[i].select = 'false';
          if (that.data.problem == 'one') {
            for (let j = 0; j < that.data.selectlabelOne.length; j++) {
              if (e.target.dataset.item.tag == that.data.selectlabelOne[j].tag) {
                // 从选中的数组中删除已经选中的
                that.data.selectlabelOne.splice(j, 1)
              }
            }
          }
          if (that.data.problem == 'two') {
            for (let j = 0; j < that.data.selectlabelTwo.length; j++) {
              if (e.target.dataset.item.tag == that.data.selectlabelTwo[j].tag) {
                that.data.selectlabelTwo.splice(j, 1)
              }
            }
          }
        }
        else {
          if (that.data.problem == 'one' && that.data.selectlabelOne.length >= 3) {
            thirdApi.showModal('提示', '问题标签最多选3个')
            return;
          }
          if (that.data.problem == 'two' && that.data.selectlabelTwo.length >= 3) {
            thirdApi.showModal('提示', '问题标签最多选3个')
            return;
          }
          // 添加选中的标签
          that.data.labelArr[i].select = 'true';
          if (that.data.problem == 'one') {
            that.data.selectlabelOne.push(that.data.labelArr[i])
          }
          if (that.data.problem == 'two') {
            that.data.selectlabelTwo.push(that.data.labelArr[i])
          }
        }

      }
    }
    that.setData({
      labelArr: that.data.labelArr
    })

    if (that.data.problem == 'one') {
      that.setData({
        labelArrOne: that.data.labelArr
      })
    }
    if (that.data.problem == 'two') {
      that.setData({
        labelArrTwo: that.data.labelArr
      })
    }

  },
  addAction: function () {
    let that = this
    thirdApi.chooseImage(5 - that.data.refundImgArr.length).then(res => {
      let imgArr = that.data.refundImgArr.concat(res.tempFilePaths)
      that.setData({
        refundImgArr: imgArr
      })
    })
  },
  closeAction: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.data.refundImgArr.splice(index, 1);
    that.setData({
      refundImgArr: that.data.refundImgArr
    })
  },
  sureAction: function () {
    let that = this;
    let param = {
      order_id: parseInt(that.data.orderId),
      order_item_id: parseInt(that.data.orderItemId),
      broken_degree: that.data.proportion,
      customer_msg: that.data.inputValue,
    }


    if (that.data.problem == 'one') {
      param.selected_attach = {
        'name': that.data.result.attach[0].name,
        'category': that.data.result.attach[0].category,
        'items': that.data.selectlabelOne
      }
    }
    if (that.data.problem == 'two') {
      param.selected_attach = {
        'name': that.data.result.attach[1].name,
        'category': that.data.result.attach[1].category,
        'items': that.data.selectlabelTwo
      }
    }
    let imagesArr = [];
    // refundImgArr 原始的图片url
    that.data.itemImagesArr = []
    for (let i = 0; i < that.data.refundImgArr.length; i++) {
      let imagePath = that.data.refundImgArr[i];
      let arr = imagePath.split(".");
      let imageType = arr[arr.length - 1]
      let name = utilMd5.hexMD5(that.data.orderId + '_' + that.data.orderItemId + '_' + (new Date().getTime()) + '_' + (10000000 + parseInt('' + (99999999 - 10000000) * Math.random()))) + '.' + imageType


      let item = {
        'content-type': 'image/' + imageType,
        'filename': name
      }
      // 获取授权 需要的参数
      imagesArr.push(item)

      const url = serviceUtils.configs.downHost + '/' + name;
      let imageItem = {
        'url': url
      }
      // commit 需要的图片url
      that.data.itemImagesArr.push(imageItem)
    }
    param.item_images = that.data.itemImagesArr

    let imgParam = {
      images: imagesArr
    }
    that.data.imageCount = 0

    if (that.data.problem == '') {
      thirdApi.showModal('请完善以下内容', '问题类型')
      return;
    }

    if (param.broken_degree == '') {
      thirdApi.showModal('请完善以下内容', '损坏比例')
      return;
    }

    if (param.customer_msg == '') {
      thirdApi.showModal('请完善以下内容', '问题描述')
      return;
    }

    if (param.selected_attach.items.length == 0) {
      thirdApi.showModal('请完善以下内容', '问题标签')
      return;
    }

    if (imagesArr.length == 0) {
      thirdApi.showModal('请完善以下内容', '图片')
      return;
    }

    that.setData({
      loadingHidden: false
    })

    refund.refundUpload(imgParam).then(res => {
      if (res.data.code == 0) {
      }
      else {
        if (res.data.msg) {
          that.wetoast.toast({
            title: res.data.msg
          })
        }
        else {
          that.wetoast.toast({
            title: '图片上传失败'
          })
        }
        that.setData({
          loadingHidden: true
        })
        return;
      }
      for (let i = 0; i < res.data.result.length; i++) {
        let resultParam = res.data.result[i]
        refund.uploadImg(resultParam, that.data.refundImgArr[i]).then(res => {
          that.data.imageCount++;
          if (that.data.imageCount == that.data.refundImgArr.length) {
            refund.refundCommit(param).then(re => {
              if (re.data.code == 0) {
                that.setData({
                  loadingHidden: true
                })
                appInteriorSkip.redirectToReFundProgress(that.data.orderId, that.data.orderItemId)
              }
              else {
                if (re.data.msg) {
                  that.wetoast.toast({
                    title: re.data.msg
                  })
                }
                that.setData({
                  loadingHidden: true
                })
              }
            }, error => {
              that.wetoast.toast({
                title: '暂无网络'
              })
              that.setData({
                loadingHidden: true
              })
            })
          }
        })
      }
    }, error => {
      that.wetoast.toast({
        title: '暂无网络'
      })
      that.setData({
        loadingHidden: true
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})