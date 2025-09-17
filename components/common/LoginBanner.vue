<template>
  <view
    v-if="visible"
    class="login-banner"
    :style="{ transform: `translateY(${offsetY}px)` }"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
  >
    <image src="/static/icons/hongbao2.png" class="icon" mode="widthFix" />
    <!-- 关键：类名要和样式一致（msg）-->
    <text class="msg">登录后可领取新人优惠哦~</text>

    <button class="btn" @tap="goLogin">登录</button>
  </view>
</template>

<script>
export default {
  name: 'LoginBanner',
  props: {
    show: { type: Boolean, default: true },
    enableLike: { type: Boolean, default: false },
    storageKey: { type: String, default: 'LOGIN_BANNER' },
  },
  data() {
    return { visible: true, liked: false, startY: 0, offsetY: 0 }
  },
  mounted() {
    const closed = !!uni.getStorageSync(this.key('CLOSED'))
    this.visible = this.show && !closed
    this.liked = !!uni.getStorageSync(this.key('LIKE'))
  },
  methods: {
    key(sfx){ return `${this.storageKey}_${sfx}` },
    goLogin(){ this.$emit('login'); uni.navigateTo({ url:'/pages/login/index' }) },
    toggleLike(){ this.liked=!this.liked; uni.setStorageSync(this.key('LIKE'), this.liked); this.$emit('like',{liked:this.liked}) },
    touchStart(e){ this.startY = e.touches?.[0]?.clientY || 0; this.offsetY = 0 },
    touchMove(e){ const y=e.touches?.[0]?.clientY||0; const dy=y-this.startY; this.offsetY=Math.max(0,dy) },
    touchEnd(){ if(this.offsetY>40){ this.visible=false; uni.setStorageSync(this.key('CLOSED'),true); this.$emit('close') } this.offsetY=0 },
  },
}
</script>

<style scoped>
.login-banner{
  position: fixed;
  left: 0; right: 0; bottom: 0;
  z-index: 999;
  background: rgba(0,0,0,0.8);
  border-radius: 24rpx 24rpx 0 0;
  padding: 36rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  display: flex; align-items: center; gap: 16rpx;
  box-sizing: border-box;
}

/* 图标尺寸（按标注 48×60rpx 更接近） */
.icon{ width:48rpx; height:60rpx; flex: 0 0 48rpx; }

/* 文字要占满剩余空间，避免被按钮压住 */
.msg{
  flex: 1;
  font-size: 32rpx; line-height: 44rpx;
  color: #fff; opacity: .95;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}

/* 右侧按钮固定宽高 */
.btn{
  flex: 0 0 144rpx;
  width: 144rpx; height: 64rpx; line-height: 64rpx;
  text-align: center;
  border: 0; padding: 0;
  border-radius: 16rpx;
  background: #1BBD43;
  color: #fff; font-size: 32rpx; font-weight: 400;
}
</style>
