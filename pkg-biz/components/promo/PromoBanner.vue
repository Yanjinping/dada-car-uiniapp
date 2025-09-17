<template>
  <view class="banner">
    <image class="logo" src="/static/logo-dada.png" mode="widthFix" />
    <view class="slogans">
      <text class="big">邀请好友</text>
      <view class="chip"><text>完成首单</text></view>
      <text class="big strong">赚现金红包</text>
    </view>

    <view class="rules" @tap="$emit('open-rules')">奖励规则</view>

    <image class="car" src="/static/illus-car.png" mode="widthFix" />
  </view>
</template>

<script setup>
defineEmits(['open-rules'])
</script>

<style scoped>
.banner{ position:relative; margin:20rpx 24rpx 0; padding:36rpx 24rpx 140rpx; border-radius:24rpx; background:linear-gradient(180deg,#FFD7A6 0%, #FFB868 100%); overflow:hidden;}
.logo{ width:160rpx;}
.slogans{ margin-top:20rpx; display:flex; align-items:center; flex-wrap:wrap; gap:12rpx;}
.big{ font-size:52rpx; font-weight:800; color:#fff;}
.strong{ text-shadow: 0 4rpx 0 rgba(0,0,0,.08);}
.chip{ padding:8rpx 18rpx; border-radius:999rpx; background:#DDF3D8; color:#2E8B57; font-size:26rpx; font-weight:700;}
.rules{ position:absolute; right:24rpx; top:24rpx; padding:10rpx 16rpx; border-radius:20rpx; background:rgba(0,0,0,.15); color:#fff; font-size:24rpx;}
.car{ position:absolute; right:-10rpx; bottom:0; width:360rpx;}
</style>
