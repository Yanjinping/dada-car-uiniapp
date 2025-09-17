<template>
  <view class="card-wrap" v-if="show && info">
    <view class="card">
      <view class="header">{{ info.title }}</view>
      <view class="desc">经纬度：{{ info.latitude }}, {{ info.longitude }}</view>
      <view class="btns">
        <button class="btn" @tap="$emit('toDetail', info)">查看详情</button>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  show: Boolean,
  info: Object
})
</script>

<style scoped>
.card-wrap {
  position: fixed;
  bottom: 30rpx;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 999;
}
.card {
  width: 90%;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}
.header {
  font-size: 32rpx;
  font-weight: bold;
}
.desc {
  margin-top: 12rpx;
  color: #666;
}
.btns {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
}
.btn {
  background-color: #33cc99;
  color: #fff;
  border-radius: 8rpx;
  padding: 10rpx 30rpx;
}
</style>
