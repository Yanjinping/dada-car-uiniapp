<template>
  <view class="container">
    <view class="points-box">
      当前积分：<text class="score">{{ points }}</text>
    </view>

    <view class="exchange-list">
      <view class="item" v-for="(item, index) in exchangeItems" :key="index">
        <view class="title">{{ item.name }}</view>
        <view class="desc">需要积分：{{ item.need }}</view>
        <button :disabled="points < item.need" @click="exchange(item)">立即兑换</button>
      </view>
    </view>

    <view class="footer">
      <button @click="goRecord">查看兑换记录</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const points = ref(126)

const exchangeItems = ref([
  { id: 1, name: '5元优惠券', need: 50 },
  { id: 2, name: '周卡租车券', need: 120 },
])

function exchange(item) {
  if (points.value < item.need) {
    uni.showToast({ title: '积分不足', icon: 'none' })
    return
  }

  // 模拟兑换成功
  points.value -= item.need
  uni.showToast({ title: '兑换成功，券已发放', icon: 'success' })

  // TODO: 调用后端接口 + 记录兑换记录
}

function goRecord() {
  uni.navigateTo({ url: '/pages/points/record' })
}
</script>

<style scoped>
.container { padding: 20rpx; }
.points-box { font-size: 32rpx; font-weight: bold; color: #409eff; margin-bottom: 20rpx; }
.score { font-size: 48rpx; color: #f56c6c; }
.exchange-list .item {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}
.item .title { font-weight: bold; margin-bottom: 6rpx; }
.footer { text-align: center; margin-top: 20rpx; }
</style>
