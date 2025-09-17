<template>
  <view class="grid-section">
    <view class="grid">
      <view class="grid-item" @tap="emitTap('search')">
        <image class="gi-ico" src="/static/home/icon-1.png" />
        <text class="gi-text">快速找车</text>
      </view>

      <view class="grid-item" @tap="emitTap('coupon')">
        <image class="gi-ico" src="/static/home/icon-2.png" />
        <text class="gi-text">领优惠券</text>
      </view>

      <view class="grid-item" @tap="emitTap('cert')">
        <image class="gi-ico" src="/static/home/icon-3.png" />
        <text class="gi-text">学生认证</text>
      </view>

      <view class="grid-item" @tap="emitTap('promo')">
        <image class="gi-ico" src="/static/home/icon-4.png" />
        <text class="gi-text">推广奖励</text>
      </view>

      <view class="grid-item" @tap="emitTap('inviteReward')">
        <image class="gi-ico" src="/static/home/icon-5.png" />
        <text class="gi-text">晒单好礼</text>
      </view>

      <view class="grid-item" @tap="emitTap('communityBenefits')">
        <image class="gi-ico" src="/static/home/icon-6.png" />
        <text class="gi-text">社群福利</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'GridMenu',
  methods: {
    emitTap(key) {
      // 统一出口，父组件监听 @tap 即可收到 { key }
      this.$emit('select', key)
    },
  },
}
</script>

<style scoped>
.grid-section{
  width:710rpx; margin:20rpx auto; background:#fff; border-radius:24rpx; overflow:hidden;
  box-shadow:0 8rpx 24rpx rgba(0,0,0,.06); padding:24rpx 0 8rpx; position:relative; z-index:1;
}
.grid{ width:680rpx; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); grid-column-gap:0; grid-row-gap:8rpx; }
.grid-item{ height:182rpx; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.gi-ico{ width:140rpx; height:140rpx; }
.gi-text{ margin-top:-8rpx; width:120rpx; height:50rpx; line-height:38rpx; text-align:center; font-weight:600; font-size:28rpx; color:#1F1F1F; }
</style>
