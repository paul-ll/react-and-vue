const {leftZeroPad} = require('../../../../../utils/util.js')
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    // 倒计时时间戳
    timeStamp: { 
      type: Number,
      value: 0,
      observer: function(newVal, oldVal){
        this._startTimer()
      }
    },
    // 类型  0: 有背景图模式   1:无背景图模式
    type: { 
      type: Number,
      value: 0
    },
    // 靠左、靠右或者居中显示  只能是flex布局中的justify-content对应的值 默认靠左
    align: { 
      type: String,
      value: 'flex-start'
    },
    sku: String  // 商品sku
  },

  data: {
    // 定时器句柄 用于取消
    timerId: null
  },

  attached: function(){
    this._startTimer()
  },
  moved: function(){},
  detached: function(){
    clearTimeout(this.data.timerId)
  },

  methods: {
    // 开启定时器
    _startTimer() {
      clearTimeout(this.data.timerId)
      this._countdown()
    },

    // 倒计时
    _countdown() {
      if (typeof this.data.timeStamp !== 'number') return
      
      this._getTimeSegments(this.data.timeStamp)

      // 记录定时器ID
      this.data.timerId = setTimeout(() => {
        if (this.data.timeStamp > 100) {
          this.data.timeStamp -= 100;
          // 递归执行倒计时
          this._countdown();
        } else {
          // 倒计时结束 触发自定义事件
          this.triggerEvent('countDownEnd', { sku: this.data.sku })
        }
      }, 100)
    },

    // 时间戳转 时、分、秒、毫秒 片段
    _getTimeSegments(microSeconds) {

      if (microSeconds < 0) {
        return;
      }

      const totalSeconds = Math.floor(microSeconds / 1000); // 总秒数
      const hour = leftZeroPad(Math.floor(totalSeconds / 3600), 2) ; // 剩余小时    
      const min = leftZeroPad(Math.floor((totalSeconds - hour * 3600) / 60), 2);  // 剩余分钟    
      const sec = leftZeroPad((totalSeconds - hour * 3600 - min * 60), 2); // 剩余秒
      const microSec = leftZeroPad(Math.floor((microSeconds % 1000) / 100), 1);
      // 更新时分秒显示
      this.setData({hour, min, sec, microSec})
    }
  }
})