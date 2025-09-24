<template>
  <scroll-view scroll-y class="home-wrap scroll">
    <view class="home">
      <!-- 背景 -->
      <image class="bg-home" src="/static/home/bg-home.png" mode="widthFix" />

      <!-- 顶部导航：首页不显示返回键（兼容你新 TitleBar 的 showLeft/backType） -->
      <TitleBar
        title="首页"
        background="transparent"
        :show-left="false"
        back-type="home"
      />

      <!-- 搜索胶囊 -->
      <SearchCapsule
        :locationName="locationName"
        @pick-city="pickCity && pickCity()"
        @search="goSearch"
      />

      <!-- 欢迎横幅 -->
      <HeroBanner />

      <!-- 学生认证：与推荐用车同宽，左右对齐 -->
      <StudentBanner
        :certified="isCertified"
        @go-cert="goCertification"
      />

      <!-- 推荐用车卡片 -->
      <RecommendedCard
        :car="(recommendedCars && recommendedCars[0]) || {}"
        :formatImage="formatImage"
        @use="onUseCar"
      />

      <!-- 九宫格 -->
      <GridMenu @select="onGridTap" />

      <!-- 常用网点 -->
      <SitesCard :sites="frequentLocations" @tap="(loc)=>onNetPointClick(loc.id)" />

      <!-- 最近订单 -->
      <RecentOrderCard
        v-if="recentOrder && (recentOrder.site || recentOrder.time)"
        :order="recentOrder"
        @reuse="repeatOrder"
      />

      <!-- 广告 & 客服 -->
      <image class="cta-img" src="/static/home/广告区.png" mode="widthFix" />
      <text class="kefu">客服电话：400-123-1234（8:30~22:00）</text>
    </view>
  </scroll-view>

  <!-- 认证 / 押金弹窗（保持原有） -->
  <AuthVerifyDialog
    v-model="showAuth"
    title="实名认证"
    desc="请上传您本人的身份证、驾驶证，并尽快完成实名认证信息"
    tip="根据国家法律法规要求，需要上传有效的实名认证信息，避免影响后续使用"
    confirm-text="立即认证"
    cancel-text="以后再说"
    reward-text="可获得10元立减券"
    @confirm="goAuth"
  />
  <DepositDialogPro
    v-model:show="show"
    :depositAmount="800"
    :zhimaThreshold="650"
    icon="/static/login/mascot-hero.png"
    @pay="goPay"
    @authorize="goZhimaAuth"
    @later="onLater"
  />

  <!-- 浮动“我的”（吸边 + 角标喜爱） -->
  <FloatMine :adsorb="true" :enableLike="true" @like="onMineLike" />

  <!-- 未登录提示条（喜爱 + 下拉关闭） -->
  <LoginBanner
    v-if="!logined"
    :show="true"
    :enableLike="true"
    @login="onBannerLogin"
    @like="onBannerLike"
    @close="onBannerClose"
  />
</template>

<script>
import TitleBar        from '@/components/header/TitleBar.vue'
import SearchCapsule   from '@/components/home/SearchCapsule.vue'
import HeroBanner      from '@/components/home/HeroBanner.vue'
import StudentBanner   from '@/components/home/StudentBanner.vue'
import RecommendedCard from '@/components/home/RecommendedCard.vue'
import GridMenu        from '@/components/home/GridMenu.vue'
import SitesCard       from '@/components/home/SitesCard.vue'
import RecentOrderCard from '@/components/home/RecentOrderCard.vue'

import AuthVerifyDialog from '@/components/home/AuthVerifyDialog.vue'
import DepositDialogPro from '@/components/pay/DepositDialog.vue'

import FloatMine   from '@/components/common/FloatMine.vue'
import LoginBanner from '@/components/common/LoginBanner.vue'

export default {
  name: 'HomeIndex',
  components: {
    TitleBar, SearchCapsule, HeroBanner, StudentBanner, RecommendedCard,
    GridMenu, SitesCard, RecentOrderCard, AuthVerifyDialog, DepositDialogPro,
    FloatMine, LoginBanner,
  },
  data() {
    return {
      logined: false,

      showAuth: false,
      show: false,

      locationName: '定位中...',
      isCertified: false,

      recommendedCars: [],
      frequentLocations: [],

      recentOrder: { site: '丰泽区｜坪山加油站（勿停充电桩）', time: '2025-08-04 08:20:20' },
    }
  },
  methods: {
    pickCity(){ uni.showToast({ title:'选择城市未接入', icon:'none' }) },
    goSearch(){ uni.navigateTo({ url: '/pkg-biz/pages/find/find' }) },
    goCertification(){ uni.navigateTo({ url: '/pkg-auth/pages/auth/idcard' }) },

    onUseCar(car){
      if(!car || !car.carId) return uni.showToast({ title:'车辆信息缺失', icon:'none' })
      this.showAuth = true
      // 真下单：const id = encodeURIComponent(car.carId); uni.navigateTo({ url:`/pkg-order/pages/confirm-order/index?carId=${id}` })
    },

    // 九宫格事件改为 @select，避免与原生 tap 冲突
    onGridTap(key){
      if(key==='search') return this.goSearch()
      if(key==='coupon') return this.goCoupon()
      if(key==='cert')   return this.goCertification()
      if(key==='promo')  return this.gopromo()
      if(key==='inviteReward') return this.goInviteReward()
      if(key==='communityBenefits')  return this.goCommunityBenefits()
    },

    goCoupon(){ uni.navigateTo({ url: '/pkg-benefit/pages/coupon/index' }) },
    gopromo(){ uni.navigateTo({ url: '/pkg-benefit/pages/promo/index' }) },
	goInviteReward(){ uni.navigateTo({ url: '/pkg-benefit/pages/share_rewards/index' }) },
	goCommunityBenefits(){ uni.navigateTo({ url: '/pkg-benefit/pages/group/index' }) },
    goMe(){ uni.navigateTo({ url: '/pkg-biz/pages/me/index' }) },
    onNetPointClick(){ uni.navigateTo({ url: '/pkg-biz/pages/find/find' }) },
    repeatOrder(){ uni.navigateTo({ url: '/pkg-order/pages/order/list?reuse=1' }) },

    goAuth(){ uni.navigateTo({ url: '/pkg-auth/pages/auth/idcard?from=auth-bottom' }); this.showAuth=false },
    goPay(){ uni.showToast({ title:'去支付（待接）', icon:'none' }) },
    goZhimaAuth(){ uni.showToast({ title:'芝麻授权（待接）', icon:'none' }) },
    onLater(){ this.show = false },

    formatImage(img){
      if (!img) return '/static/car1.png'
      if (/^https?:\/\//i.test(img)) return img
      const base = (getApp && getApp().globalData && getApp().globalData.BASE_URL) || ''
      const origin = base.replace(/\/api\/?$/i, '')
      return origin + img
    },

    onMineLike(){},
    onBannerLogin(){},
    onBannerLike(){},
    onBannerClose(){},
  },
}
</script>

<style scoped>
/* ===== 基础 ===== */
.home-wrap{ height:100vh; background:linear-gradient(180deg,#CFFAE6 0%,#F7F9FB 70%); }
.scroll{ height:100%; overflow:hidden; }
.home{ position:relative; box-sizing:border-box; }
.one-line{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }

/* 背景 */
.bg-home{ position:absolute; left:0; top:0; width:752rpx; height:1624rpx; z-index:0; pointer-events:none; }

/* 广告 & 客服 */
.cta-img{ width:704rpx; height:208rpx; margin:20rpx auto 0; display:block; border-radius:20rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.06); }
.kefu{ display:block; width:560rpx; height:36rpx; line-height:36rpx; margin:12rpx auto 40rpx; text-align:center; color:#9E9E9E; font-size:26rpx; }
</style>
