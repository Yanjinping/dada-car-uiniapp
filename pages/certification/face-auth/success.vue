<template>
  <view class="container">
    <image src="/static/success.png" class="status-icon" mode="aspectFit" />
    <view class="title">实名认证成功</view>
    <view class="desc">您已通过人脸识别认证</view>
    <button class="btn" @click="goBack">返回首页</button>
  </view>
</template>

<script setup>
function goBack() {
  uni.navigateTo({ url: '/pages/home/home' }) // 可根据需要修改
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
  color: #07c160;
}
.desc {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666;
}
.btn {
  margin-top: 60rpx;
  width: 80%;
  background-color: #07c160;
  color: white;
  font-size: 30rpx;
}
</style>
