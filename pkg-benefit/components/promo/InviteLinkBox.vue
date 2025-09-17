<template>
  <view class="link-box">
    <!-- 左侧小红点 -->
    <view class="dot"></view>

    <!-- 文案区 -->
    <view class="link-wrap">
      <text class="prefix">复制邀请链接给好友：</text>
      <text class="link">{{ link }}</text>
    </view>

    <!-- 复制按钮 -->
    <button class="btn-copy" @tap="copy">复制</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  link: { type: String, default: '' }
})

function copy() {
  uni.setClipboardData({
    data: props.link,
    success: () => {
      uni.showToast({ title: '邀请链接已复制', icon: 'none' })
    }
  })
}
</script>

<style scoped>
.link-box {
  width: 690rpx;
  height: 108rpx;
  margin: 20rpx auto;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  border-radius: 32rpx;
  background: rgba(255, 242, 236, 0.9);
  border: 2rpx solid rgba(255,255,255,0.5);
  backdrop-filter: blur(4rpx);
  box-sizing: border-box;
}

.dot {
  width: 23rpx;
  height: 23rpx;
  border-radius: 50%;
  background: #FE4100;
  margin-right: 12rpx;
}

.link-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.prefix {
  font-family: "AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight: 400;
  font-size: 28rpx;
  color: #FF5A00;
  line-height: 38rpx;
  white-space: nowrap;
}

.link {
  font-family: "AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight: 400;
  font-size: 28rpx;
  color: #1BBD43;
  line-height: 38rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-copy {
  width: 116rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 48rpx;
  margin-left: 12rpx;
  background: linear-gradient(270deg, #E8E535 0%, #25DC37 100%);
  font-size: 28rpx;
  color: #FFFFFF;
  text-align: center;
  padding: 0;
}
</style>
