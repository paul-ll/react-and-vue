Component({
  behaviors: [],
  properties: {
    // 是否显示标志
    isShow: { 
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal){
        this.setData({
          isShow: newVal
        })
      }
    },
    hasSpecialField: Boolean, // 是否有要特殊显示的字段
    specialField: Object,
    // 弹框上面的信息
    dialogInfo: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal){
        const {cutText} = this.data.dialogInfo
        if (typeof cutText !== 'string') return
        const seperator = '#_$'
        if (cutText.indexOf(seperator) > 0) {
          const segments = cutText.split(seperator)
          const fieldStart = segments[0]
          const fieldEnd = segments[2]
          const field = segments[1]
          this.data.hasSpecialField = true
          this.data.specialField = {fieldStart, fieldEnd, field}
          const {hasSpecialField, specialField} = this.data
          this.setData({ hasSpecialField, specialField })
        }
      }
    }
  },

  data: {
  },
  attached: function(){
  },
  moved: function(){},
  detached: function(){
  },

  methods: {
    onButtonClick (evt) {
      this.triggerEvent('buttonTapEvent', {type: evt.target.dataset.type})
    },
    onCloseTap () {
      this._closeAlert()
    },
    onMaskTap () {
      this._closeAlert()
    },
    countDownEndHandler () {},
    // 弹框蒙层上禁止滚动底部页面
    preventTouchMove () {},
    preventTap () {},
    _closeAlert () {
     this.setData({
      isShow: false
     })
   }
  }
})