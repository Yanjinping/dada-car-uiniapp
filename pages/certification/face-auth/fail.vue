<template>
  <view class="container">
    <image src="/static/fail.png" class="status-icon" mode="aspectFit" />
    <view class="title">实名认证失败</view>
    <view class="desc">请检查身份证是否清晰、人脸是否正脸</view>
    <button class="btn" @click="retry">重新认证</button>
  </view>
</template>

<script setup>
function retry() {
  // 返回认证页或触发重新请求 token
  uni.navigateBack(); // 或跳转发起认证流程页
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  min-height: 100vh;
}
.status-icon {
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 40rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #f54e4e;
}
.desc {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666;
  text-align: center;
}
.btn {
  margin-top: 60rpx;
  width: 80%;
  background-color: #f54e4e;
  color: white;
  font-size: 30rpx;
}
</style>
