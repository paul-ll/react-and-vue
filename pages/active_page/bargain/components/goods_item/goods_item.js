Component({
  properties: {
    // 商品信息
    goodsInfo: {
      type: Object,
      value: null,
      observer: function(newVal, oldVal) {}
    },
    // 是否显示底部boder
    showBorder: {
      type: Boolean,
      value: true
    }, 
    // 高度
    height: {
      type: Number,
      value: 278
    },
    // 是否显示二级标题
    showSubtitle: Boolean, 
    // 类型 -1：砍价商品  0~2：我的砍价商品（进行中、成功、失败三种状态）3：砍价详情 
    type: Number 
  },

  data: {
    // 默认商品图片
    defaltImg: '/images/default_goods_img.png'
  },

  attached: function(){
  },
  moved: function(){
  },
  detached: function(){
  },
  methods: {
    // 点击按钮以外的区域
    onGoodsTap (evt) {
      const {type} = this.data
      // 点击砍价详情页的商品 没反应
      if (type === 3) return
      const {groupId, sku} = this.data.goodsInfo
      // 表单ID 用于消息推送
      const {formId} = evt.detail
      this.triggerEvent("goodsTapEvent", {type, groupId, sku, formId})
    },
    // 点击查看商品券按钮
    onLookUpPrizeTap () {
      const {type} = this.data
      const {groupId} = this.data.goodsInfo
      this.triggerEvent("goodsTapEvent", {type, groupId, btnName: 'lookUpPrize'})
    },
    // 点击再砍一次按钮
    onRetryTap (evt) {
      const {type} = this.data
      const {groupId} = this.data.goodsInfo
      this.triggerEvent("goodsTapEvent", {type, groupId, btnName: 'retry'})
    },
    onShowOffTap () {
    },
    onImgLoaded (evt) {
      const {src} = evt.currentTarget.dataset
    },
    countDownEndHandler (evt) {
      // 倒计时结束
    }
  }
})