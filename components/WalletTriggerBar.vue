<template>
  <view class="bar" @click="$emit('click')">
    <image src="/static/benefit/icon-wallet.png" class="ico" mode="widthFix" />
    <text class="t">嗒嗒钱包</text>
    <text class="amt">{{ amountText }}</text>
    <text class="caret">⌄</text>
  </view>
</template>
<script setup>
defineProps({ amountText: String })
</script>
<style scoped>
.bar{ height:72rpx; background:#FFF1DE; border-radius:16rpx; display:flex; align-items:center; padding:0 16rpx; }
.ico{ width:32rpx; margin-right:8rpx; }
.t{ color:#A86B2D; font-size:26rpx; }
.amt{ margin-left:12rpx; color:#A86B2D; font-weight:700; }
.caret{ margin-left:auto; color:#A86B2D; }
</style>