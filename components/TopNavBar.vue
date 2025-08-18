<template>
  <view class="nav-bar" :style="{'height': barHeight + 'px'}">
    <view class="nav-left" :style="{'margin-top': capsuleTop + 'px', height: capsuleHeight + 'px'}">
      <image class="back-icon" src="https://qiniu.dadayc.com/miniapp/homepage_timesharing_icon_user@3x.png" mode="aspectFit" @tap="goBack"></image>
    </view>
    <view class="nav-title" :style="{ 'margin-left': (capsuleWidth + 26) + 'px' }">{{ title }}</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '导航栏'
  }
})

const barHeight = ref(88)
const capsuleTop = ref(0)
const capsuleHeight = ref(32)
const capsuleWidth = ref(32)

onMounted(() => {
  const info = uni.getMenuButtonBoundingClientRect?.() || {}
  barHeight.value = info.bottom + 10
  capsuleTop.value = info.top || 44
  capsuleHeight.value = info.height || 32
  capsuleWidth.value = info.width || 32
})

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.nav-bar {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}
.nav-left {
  display: flex;
  align-items: center;
}
.back-icon {
  width: 40rpx;
  height: 40rpx;
}
.nav-title {
  font-size: 32rpx;
  font-weight: 600;
}
</style>
