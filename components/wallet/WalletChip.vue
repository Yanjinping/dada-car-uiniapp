<template>
  <view class="chip" @tap="$emit('toggle')">
    <image class="ico" src="/static/icons/wallet.png" mode="widthFix" />
    <text class="title">嗒嗒钱包</text>
    <text class="amount">{{ amount }}</text>
    <text class="arrow">{{ expanded ? '▾' : '▸' }}</text>
  </view>
</template>

<script setup>
defineProps({
  amount: { type: String, default: '¥ 0.00' },
  expanded: { type: Boolean, default: false }
})
defineEmits(['toggle'])
</script>

<style scoped>
.chip{
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(255,255,255,.85);
  display: flex; align-items: center;
  padding: 0 16rpx;
  gap: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,.06);
}
.ico{ width: 28rpx; }
.title{ font-size: 24rpx; color: #7a5b3a; }
.amount{ margin-left: 8rpx; font-size: 26rpx; font-weight: 600; color: #7a5b3a; }
.arrow{ margin-left: auto; color: #9a7d58; }
</style>
