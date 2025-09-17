<template>
  <view v-if="order" class="order-card">
    <!-- 标题 -->
    <view class="hd">
      <view class="bar" />
      <text class="title">最近订单</text>
    </view>

    <!-- 内容 -->
    <view class="row">
      <image class="time-ico" src="/static/icons/time.png" mode="widthFix" />
      <view class="info">
        <text class="site one-line">{{ order.site || '丰泽区｜坪山加油站（勿停充电桩）' }}</text>
        <text class="time">{{ order.time || '2025-08-04 08:20:20' }}</text>
      </view>
      <button class="btn" @tap="$emit('reuse', order)">一键用车</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RecentOrderCard',
  props: { order: { type: Object, default: null } }
}
</script>

<style scoped>
/* 外层卡片 */
.order-card {
  width: 710rpx;
  min-height: 224rpx;
  margin: 20rpx auto 0;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.05);
  padding: 20rpx;
  box-sizing: border-box;
}

/* 标题行 */
.hd {
  display: flex;
  align-items: center;
  height: 44rpx;
  margin-bottom: 12rpx;
}
.bar {
  width: 8rpx;
  height: 36rpx;
  background: #0DD64B;
  border-radius: 4rpx;
  margin-right: 12rpx;
}
.title {
  font-weight: 500;
  font-size: 32rpx;
  color: #222222;
  line-height: 44rpx;
}

/* 内容行 */
.row {
  display: flex;
  align-items: center;
}
.time-ico {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.site {
  font-weight: 500;
  font-size: 28rpx;
  color: #444;
  line-height: 38rpx;
}
.time {
  font-size: 28rpx;
  color: #aaa;
  line-height: 38rpx;
}
.one-line {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 按钮 */
.btn {
  width: 144rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: linear-gradient(316deg, #F3A03A 0%, #FFC868 100%);
  border-radius: 316rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #fff;
  padding: 0;
  border: none;
  align-self: center; /* 按钮垂直居中 */
}
</style>
