<template>
  <uni-popup ref="refPop" type="bottom" background-color="#fff">
    <view class="panel">
      <view class="title">计费说明</view>
      <scroll-view scroll-y class="content"><slot /></scroll-view>
      <button class="ok" @click="close">我知道了</button>
    </view>
  </uni-popup>
</template>

<script setup>
const refPop = ref(null)
function open(){ refPop.value && refPop.value.open() }
function close(){ refPop.value && refPop.value.close() }
defineExpose({ open, close })
</script>

<style scoped>
.panel{border-top-left-radius:24rpx;border-top-right-radius:24rpx;padding:24rpx;max-height:70vh}
.title{font-size:34rpx;font-weight:700;text-align:center;margin-bottom:12rpx}
.content{max-height:48vh}
.ok{width:100%;margin-top:24rpx;background:linear-gradient(180deg,#6eea8d,#08b54e);color:#fff;border:none;border-radius:999rpx;padding:20rpx 0}
</style>
