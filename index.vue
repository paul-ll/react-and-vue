<template>
  <div class="packet-together">
    <!-- 活动结束, 开团上限 -->
    <section class="active-over bg-red" v-if="false">
      <div class="golden"></div>
      <div class="logo-tx">
        <img src="../../assets/red-packet-together/logo-tengxun.png" alt="">
      </div>
      <div class="strawberry"></div>
      <p>活动已结束<br/>看看其他活动吧</p>
      <!--<p>今日参与活动次数已满<br/>看看其他活动吧</p>-->
      <ul class="card-box">
        <li>
          <img src="https://j-image.missfresh.cn/img_20180322143745083.png?iopcmd=convert&dst=png&q=80" alt="">
        </li>
        <li>
          <img src="https://j-image.missfresh.cn/img_20180322143745083.png?iopcmd=convert&dst=png&q=80" alt="">
        </li>
      </ul>
    </section>

    <!-- 开团, 用户参与成功了 -->
    <section class="active-open bg-red">
      <!-- 固定UI区域 -->
      <div class="golden"></div>
      <div class="page-title">
        <img src="../../assets/red-packet-together/page-title-01.png" alt="">
      </div>
      <div class="strawberry"></div>

      <!-- 团状态: 进行中, 有倒计时 -->
      <div class="count-down" v-if="false">
        <p>距离结束</p>
        <count-down :end="'3599991'"></count-down>
      </div>

      <!-- 团状态: 成功, 失败 -->
      <div class="open-status" v-if="true">
        <p>很遗憾，该红包已经过期</p>
      </div>

      <!-- 内容区 -->
      <div class="light">
        <div class="content-area">
          <div class="rule-btn">活动规则</div>
          
          <!-- 需要根据页面状态改变的小熊图标 -->
          <i class="icon-bear icon-bear-fail"></i>

          <!-- 开团时, 参与的用户, 进行中, 过期 -->
          <div v-if="true">
            <ul class="open-user-box">
              <li class="open-user-bg">
                <div class="user-icon" :style="'background-image:url('+userHeadImg+')'">
                  <i class="hat"></i>
                </div>
              </li>
              <li class="user-defu-bg"></li>
              <li class="open-user-bg"></li>
              <li class="user-defu-bg"></li>
            </ul>
            <!-- 活动进行中 -->
            <div>
              <p class="txt">拆成功还有机会获得额外
                <span>【现金奖励】</span>
              </p>
              <div class="btn-control btn-share" v-if="false"></div>
              <div class="btn-control btn-open" v-if="true"></div>
            </div>
          </div>

          <!-- 开团成功 -->
          <div v-if="false">
            <ul class="join-user-box">
              <li class="join-user-item">
                <div class="user-item-img">
                  <img :src="userHeadImg" alt="">
                </div>
                <div class="user-item-name">
                  <h4>用户名</h4>
                  <p class="message">祝您，身体健康</p>
                </div>
                <div class="user-item-count">
                  <span>30</span>
                  <em>元</em>
                </div>
              </li>
              <li class="join-user-item lucky-item">
                <div class="user-item-img">
                  <img :src="userHeadImg" alt="">
                </div>
                <div class="user-item-name">
                  <h4>用户名</h4>
                  <p class="message">祝您，身体健康</p>
                </div>
                <div class="user-item-count">
                  <span>30</span>
                  <em>元</em>
                </div>
                <i class="icon-bear-paw">
                  <!-- 手气最佳印章 -->
                </i>
              </li>
              <li class="join-user-item">
                <div class="user-item-img">
                  <img :src="userHeadImg" alt="">
                </div>
                <div class="user-item-name">
                  <h4>用户名</h4>
                  <p class="message">祝您，身体健康</p>
                </div>
                <div class="user-item-count">
                  <span>30</span>
                  <em>元</em>
                </div>
              </li>
              <li class="join-user-item">
                <div class="user-item-img">
                  <img :src="userHeadImg" alt="">
                </div>
                <div class="user-item-name">
                  <h4>用户名</h4>
                  <p class="message">祝您，身体健康</p>
                </div>
                <div class="user-item-count">
                  <span>30</span>
                  <em>元</em>
                </div>
              </li>
            </ul>
            <div v-if="false">
              <p class="txt">获得50元红包
                <span class="under-line" @click="goIndex">去使用</span>
              </p>
              <div class="btn-control btn-open"></div>
            </div>
            <div v-if="true">
              <p class="txt">
                今日参与活动次数已满
              </p>
              <div class="btn-control btn-use"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import baseDialog from 'components/base/base-dialog.component'
import countDown from 'components/red-packet-together/count-down.component'
// loading页
import loadingMask from 'directives/loading-mask.directive'
import { toast } from 'sdk/ui/toast'
import { redirect } from 'sdk/page'
import { parseQuery } from 'sdk/http'

import { requestInfo } from 'sdk/user.api'
import { requestOpenGroup, requestJoinGroup, requestShowGroup } from 'sdk/red-packet-together.api'
import { requestAna } from 'sdk/analytics'
import { setShareInfo, openShareControls, setShareButtonShow, setShareType } from 'sdk/share'
import { goLogin } from 'sdk/auth'
export default {
  data: function () {
    return {
      loadingPage: true,
      nickName: '',
      userHeadImg: 'https://thirdwx.qlogo.cn/mmopen/PuG35fyQfhel4fekTMDrPYqeyPmCiapQJuB9O5FpRjKUgoCSO0xXeozR33dLrZN3qyGLT56hDbZoKGlYSFfeRHyD5bdboCFibl/132',
      showDialog: false,
      showDialogA: false,
      showDialogB: false,
      isJoin: '',
      isGoing: '',
      isExceedOpenLimit: '', // 是否满足参加同一个团长限制
      limit: '', // 参加活动次数总限制
      defaultImg: '',
      // noUserImg: '',
      errPage: {
        show: false,
        errorTxt: '',
        errorBtn: ''
      },
      haveGroupOn: '',
      redPacket: {},
      groupon: {},
      commander: {},
      grouponMemberList: [],
      awardList: [],
      redDetail: '',
      shareInfo: {}
    }
  },
  directives: {
    loadingMask
  },
  components: {
    baseDialog,
    countDown
  },
  created () {
    // 控制分享渠道展示
    setShareType('wechat,wechatTimeline')
  },
  mounted () {

  },
  computed: {
    adverDate () {
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1 + ''
      var day = date.getDate() + ''
      return year + month + day
    },
    getDevice () {
      var source = ''
      if (window.mf && window.mf.getAppDeviceInfo) {
        var resObj = JSON.parse(window.mf.getAppDeviceInfo())
        if (resObj.plantform === 'ios') {
          source = 'ios'
        } else if (resObj.plantform === 'android') {
          source = 'android'
        } else {
          source = ''
        }
      }
      return source
    },
    ...mapGetters({
      isLogin: 'isLogin'
    }),
    isInApp () {
      if (window.mf && window.mf.getLocalShopCartGoods) {
        return true
      }
      return false
    },
    isOpen () {
      var query = parseQuery(window.location.href)
      if (query.grouponCode && query.grouponCode.length) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    gotoLogin () {
      goLogin()
    },
    errData () {
      this.loadingPage = false
      this.errPage.errorBtn = '重新加载'
      this.errPage.errorTxt = '商城太火爆啦, 重试一下吧~'
      this.errPage.show = true
      this.errPage.target = 'reload'
    },
    pageReload (type) {
      if (type === 'home') {
        redirect({
          type: 'home'
        })
      } else {
        window.location.reload()
      }
    },
    goIndex (type) {
      setTimeout(function () {
        redirect({
          type: 'home'
        })
      }, 300)
    },
    openGroup (data) {
      requestOpenGroup(data).then((resp) => {
        var res = resp.data
        this.setPacketData(resp)
        if (res) {
          // 存储当前用户开团的团码, 查看我的红包团时, 跳转页面会用到
          window.localStorage.setItem('myGrouponCode', res.groupon.grouponCode)

          // 开团打点
          requestAna('get_into', 'group_page', {
            'promotion_id': res.groupon.grouponCode,
            'p_title': this.getDevice
          })
        }
      }, () => {
        this.errData()
      })
    },
    joinGroup (data) {
      requestShowGroup(data).then((resp) => {
        var res = resp.data
        this.setPacketData(resp)
        // 首先调show接口, 拿到当前的团状态, 未成团, 可参与再请求参团接口
        if (res && !res.isJoin && res.groupon.status === 1) {
          requestJoinGroup(data).then((resp) => {
            this.setPacketData(resp)

            if (res && res.groupon.grouponCode) {
              // 参团打点
              requestAna('get_into', 'group_page', {
                'promotion_id': res.groupon.grouponCode,
                'p_title': this.getDevice
              })
            }
          }, () => {
            this.errData()
          })
        }
      }, () => {
        this.errData()
      })
    },
    setPacketData (resp) {
      if (resp.code === 4) {
        // code4代表活动结束了
        toast(resp.message)
        this.errPage.errorBtn = '返回首页'
        this.errPage.errorTxt = resp.message
        this.errPage.show = true
        this.errPage.target = 'home'
        this.loadingPage = false
      } else if (resp.code === 10 || resp.code !== 0) {
        // code10服务器需要引流
        toast(resp.message)
        this.loadingPage = false
        this.errPage.errorBtn = '重新加载'
        this.errPage.errorTxt = resp.message
        this.errPage.show = true
        this.errPage.target = 'reload'
        this.loadingPage = false
      } else {
        var res = resp.data

        // 是否满足参加同一个团长限制: 0否 1是
        this.isExceedOpenLimit = res.isExceedOpenLimit

        // 参加活动次数总限制: 0否, 1是       
        this.limit = res.limit
        console.log('res.isExceedOpenLimit: ' + res.isExceedOpenLimit)
        if (res.groupon.status === 1 && res.isJoin === 1 && res.isCommander) {
          // 团长开团展示的弹屏
          this.showDialog = true
        } else if (res.groupon.status === 1 && res.isJoin === 1 && this.isOpen && this.isExceedOpenLimit <= 1) {
          // 用户参团展示的弹屏
          this.showDialogA = true
          window.localStorage.setItem('packetTogether', this.adverDate)
        } else if (res.groupon.status === 1 && res.isJoin === 0 && this.isOpen && this.isExceedOpenLimit >= 1) {
          // 当前用户, 已经给开团用户参过团了
          toast('加入失败，你今天已经加入过TA的团了～')
        } else if (res.groupon.status === 1 && res.isJoin === 0 && this.isOpen && res.limit > 0) {
          // 用户参团时, 总次数已经达到限制了
          toast('你今天活动次数已用完，请明天再来吧～')
        }

        // 已成团已参与展示的弹屏
        if (res.groupon.status === 2 && res.isJoin === 1) {
          this.showDialogB = true
        }



        // 红包金额
        this.redPacket = res.redPacket

        // 团状态 1进行中 2已成团 3未成团
        this.groupon = res.groupon

        // 邀请人数
        this.commander.shortNum = res.commander.shortNum
        this.commander.nickName = res.commander.nickName

        // 是否参团
        this.isJoin = res.isJoin
        this.isGoing = res.isGoing

        // 是否团长
        this.isCommander = res.isCommander

        // 是否有参与的团
        this.haveGroupOn = res.haveGroupOn

        // 当用户没有默认头像, 设置默认头像
        if (res.grouponMemberList) {
          for (let i = 0; i < res.grouponMemberList.length; i++) {
            let item = res.grouponMemberList[i]
            if (item.userHeadImg) {
            } else {
              item.userHeadImg = require('assets/red-header.png')
            }
          }
        }

        // 设置参与的用户数量
        this.grouponMemberList = res.grouponMemberList
        if (res.grouponMemberList.length < res.redPacket.groupNumber) {
          var num = res.redPacket.groupNumber - res.grouponMemberList.length
          for (var i = 0; i < num; i++) {
            var groupMember = {
              userNickName: '',
              userHeadImg: ''
            }
            this.grouponMemberList.push(groupMember)
          }
        }

        // 当用户没有默认头像, 设置默认头像
        if (res.awardList) {
          for (let i = 0; i < res.awardList.length; i++) {
            let item = res.awardList[i]
            if (item.userHeadImg) {
            } else {
              item.userHeadImg = require('assets/red-header.png')
            }
          }
        }
        // 参与人
        this.awardList = res.awardList

        // 红包数据
        this.redDetail = res.redDetail
        this.loadingPage = false

        // 设置分享
        let shareUrl = window.location.origin + window.location.pathname + '?grouponCode=' + this.groupon.grouponCode
        res.share_info.wx_url = shareUrl
        res.share_info.friend_url = shareUrl
        res.share_info.miniAppShareInfo.miniPath = res.share_info.miniAppShareInfo.miniPath + '?grouponCode=' + this.groupon.grouponCode

        this.shareInfo = res.share_info
        setShareInfo(this.shareInfo)

        // 展示APP里页面右上角的分享
        setShareButtonShow()

        // 打点
        if (res.groupon.status === 1 && res.isJoin === 1) {
          requestAna('bbs_show', 'group_page', {
            'promotion_id': res.groupon.grouponCode,
            'class': res.redPacket.id,
            'p_title': this.getDevice
          })
        }
        if (res.groupon.status === 2 && res.isJoin === 1) {
          requestAna('success_show', 'group_page', {
            'promotion_id': res.groupon.grouponCode,
            'class': res.redPacket.id,
            'p_title': this.getDevice
          })
        }
      }
    }
  }
}
</script>
<style lang="scss">
.packet-together {
  li {
    list-style: none;
  }
  .bg-red {
    background-color: #F02441;
    position: relative;
  }
  .golden {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: url('../../assets/red-packet-together/golden.png') no-repeat;
    background-size: 100% 100%;
  }
  .strawberry {
    width: 70px;
    height: 200px;
    position: absolute;
    right: 0;
    background: url('../../assets/red-packet-together/strawberry.png') no-repeat;
    background-size: 100% 100%;
  }
  .rule-btn {
    position: absolute;
    right: 0;
    width: 70px;
    height: 24px;
    text-align: center;
    background-color: rgba(0, 0, 0, .3);
    line-height: 24px;
    color: #fff;
    font-size: 12px;
    border-top-left-radius: 100px;
    border-bottom-left-radius: 100px;
  }
  .logo-tx {
    width: 100%;
    height: 13px;
    text-align: center;
    img {
      width: 100px;
    }
  }
  .icon-bear {
    position: absolute;
    left: 50%;
    margin-left: -30px;
  }
  .icon-bear-wait {
    width: 60px;
    height: 35px;
    background: url('../../assets/red-packet-together/icon-bear-wait.png') no-repeat;
    background-size: 100% 100%;
  }
  .icon-bear-love {
    width: 61px;
    height: 64px;
    background: url('../../assets/red-packet-together/icon-bear-love.png') no-repeat;
    background-size: 100% 100%;
  }
  .icon-bear-fail {
    width: 65px;
    height: 45px;
    margin-left: -35px;
    background: url('../../assets/red-packet-together/icon-bear-fail.png') no-repeat;
    background-size: 100% 100%;
  }
  .active-over {
    width: 100%;
    padding-top: 37px;
    min-height: 300px;
    box-sizing: border-box;
    overflow: hidden;
    p {
      width: 100%;
      margin-top: 20px;
      line-height: 30px;
      text-align: center;
      font-size: 20px;
      color: #fff;
    }
    .card-box {
      width: 100%;
      margin-top: 28px;
      padding: 0 15px;
      box-sizing: border-box;
      position: relative;
      z-index: 5;
      li {
        list-style: none;
        width: 168px;
        float: left;
        img {
          width: 100%;
        }
      }
      li:nth-of-type(2) {
        float: right;
      }
    }
    .strawberry {
      bottom: -50px;
    }
  }
  .btn-control {
    width: 296px;
    height: 55px;
    margin: 4px auto 0;
  }
  .btn-share {
    background: url('../../assets/red-packet-together/btn-share.gif') no-repeat;
    background-size: 100% 100%;
  }
  .btn-open {
    background: url('../../assets/red-packet-together/btn-open.gif') no-repeat;
    background-size: 100% 100%;
  }
  .btn-use {
    background: url('../../assets/red-packet-together/btn-use.gif') no-repeat;
    background-size: 100% 100%;
  }
  .under-line {
    text-decoration: underline;
  }
  .active-open {
    padding-top: 10px;
    padding-bottom: 10px;
    .strawberry {
      top: 190px;
    }
    .icon-bear-love {
      top: -44px;
    }
    .icon-bear-wait {
      top: -10px;
    }
    .icon-bear-fail {
      top: -25px;
    }
    .page-title {
      width: 100%;
      text-align: center;
      img {
        width: 300px;
      }
    }
    .count-down {
      width: 100%;
      text-align: center;
      &>p {
        color: #fff;
        font-size: 14px;
        line-height: 30px;
      }
    }
    .open-status {
      width: 100%;
      text-align: center;
      transform: translateY(-10px);
      p {
        font-size: 18px;
        color: #FDE5A3;
      }
    }
    .light {
      width: 350px;
      height: 350px;
      padding-top: 15px;
      background: url('../../assets/red-packet-together/light.gif') no-repeat;
      background-size: 100% 100%;
      margin: 30px auto 0;
      position: relative;
      z-index: 5;
      box-sizing: border-box;
    }
    .content-area {
      width: 320px;
      height: 320px;
      margin: 0 auto;
      background: url('../../assets/red-packet-together/content-area.png') no-repeat;
      background-size: 100% 100%;
      .rule-btn {
        top: -40px;
        right: -12px;
      }
    }
    .open-user-box {
      width: 244px;
      margin: 0 auto;
      padding-top: 5px;
      overflow: hidden;
      li {
        float: left;
        margin-top: 10px;
      }
      li:nth-of-type(2n) {
        float: right;
      }
    }
    .user-defu-bg {
      width: 93px;
      height: 102px;
      background: url('../../assets/red-packet-together/user-defu-bg.png') no-repeat left 34px;
      background-size: 100% 62px;
    }
    .open-user-bg {
      width: 100px;
      height: 102px;
      background: url('../../assets/red-packet-together/join-user-bg.png') no-repeat;
      background-size: 100% 100%;
      text-align: center;
      .user-icon {
        display: inline-block;
        width: 40px;
        height: 40px;
        border-radius: 40px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        transform: translateY(84%);
        position: relative;
        .hat {
          position: absolute;
          top: -10px;
          right: 0;
          width: 23px;
          height: 20px;
          background-image: url('../../assets/red-packet-together/hat.png');
          background-size: 100% 100%;
        }
      }
    }
    .txt {
      width: 100%;
      text-align: center;
      color: #EAA256;
      font-size: 12px;
      line-height: 18px;
      margin-top: 10px;
      span {
        color: #F02441;
      }
    }
    .join-user-box {
      padding-top: 10px;
      .join-user-item+.join-user-item {
        margin-top: 5px;
      }
      .join-user-item {
        width: 100%;
        height: 50px;
        padding: 0 30px;
        box-sizing: border-box;
        display: flex;
        position: relative;
      }
      .icon-bear-paw {
        position: absolute;
        top: 0;
        right: -12px;
        width: 56px;
        height: 58px;
        background: url('../../assets/red-packet-together/icon-bear-paw.png') no-repeat;
        background-size: 100% 100%;
      }
      .user-item-img {
        width: 55px;
        height: 41px;
        img {
          width: 41px;
          height: 41px;
          border-radius: 41px;
        }
      }
      .user-item-name {
        width: 110px;
        h4,
        p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        h4 {
          width: 100%;
          font-weight: normal;
          font-size: 14px;
          color: #030303;
        }
        p {
          display: inline-block;
          max-width: 120px;
          height: 20px;
          line-height: 20px;
          padding: 0 5px;
          font-size: 12px;
          background: #E8A454;
          color: #fff;
        }
      }
      .user-item-count {
        max-width: 100px;
        padding-left: 5px;
        flex: 1;
        text-align: right;
        span,
        em {
          line-height: 50px;
          display: inline-block;
        }
        span {
          font-size: 36px;
          color: #CB7900;
        }
        em {
          font-size: 14px;
          color: #BE6500;
        }
      }
      .lucky-item {
        .message {
          background: #DA0B2B;
        }
      }
    }
  }
}
</style>