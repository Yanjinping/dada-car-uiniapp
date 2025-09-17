<template>
  <view class="container">
    <!-- 车辆信息卡片 -->
    <view class="card">
      <view class="car-header">
        <image class="car-image" src="/static/car_ec200.png" />
        <view>
          <view class="car-name">北汽 EC200 · 4座</view>
          <view class="car-sub">闽CD23163 | 续航 133 km</view>
        </view>
      </view>
      <view class="location">📍 丰泽区 市税务局（专属车位，注意朝向）</view>
    </view>

    <!-- 操作区 -->
    <view class="button-group">
      <button class="btn-action" @click="onOpen">开门</button>
      <button class="btn-action" @click="onClose">关门</button>
      <button class="btn-action" @click="onHorn">鸣笛</button>
      <button class="btn-action" @click="onFindCar">找车</button>
    </view>

    <!-- 订单操作 -->
    <view class="button-row">
      <button class="btn-cancel" @click="onCancel">取消订单</button>
      <button class="btn-detail" @click="onShowFee">费用详情</button>
    </view>

    <!-- 还车按钮 -->
    <button class="btn-confirm" @click="onReturn">我要还车</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { openCar, closeCar, hornCar, findCar, cancelOrder, getFee, returnCar } from '../api/index.js'

async function onOpen() { await control('open'); }
async function onClose() { await control('close'); }
async function onHorn() { await control('horn'); }
async function onFindCar() { await control('find'); }

async function control(action) {
  try {
    let res
    if (action === 'open') res = await openCar({ carId: 1 })
    if (action === 'close') res = await closeCar({ carId: 1 })
    if (action === 'horn') res = await hornCar({ carId: 1 })
    if (action === 'find') res = await findCar({ carId: 1 })
    uni.showToast({ title: `${action}成功`, icon: 'success' })
  } catch (e) {
    console.error(`❌ ${action}失败`, e)
    uni.showToast({ title: `${action}失败`, icon: 'none' })
  }
}

async function onCancel() {
  uni.showModal({
    title: '确认取消订单？',
    success: async res => {
      if (res.confirm) {
        await cancelOrder({ orderId: 1 })
        uni.showToast({ title: '订单已取消', icon: 'success' })
        uni.reLaunch({ url: '/pages/home/index' })
      }
    }
  })
}

async function onShowFee() {
  const res = await getFee({ orderId: 1 })
  uni.showModal({ title: '费用详情', content: `当前费用：¥${res.totalFee}` })
}

async function onReturn() {
  await returnCar({ orderId: 1 })
  uni.showToast({ title: '还车成功', icon: 'success' })
  uni.reLaunch({ url: '/pages/home/index' })
}
</script>

<style scoped>
.container { padding: 24rpx; background-color: #f9f9f9; }
.card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.car-header { display: flex; align-items: center; margin-bottom: 14rpx; }
.car-image { width: 140rpx; height: 88rpx; margin-right: 24rpx; border-radius: 12rpx; }
.car-name { font-size: 32rpx; font-weight: bold; margin-bottom: 4rpx; }
.car-sub { font-size: 26rpx; color: #666; }
.location { font-size: 26rpx; color: #333; margin-top: 10rpx; }
.button-group { display: flex; justify-content: space-around; margin-bottom: 24rpx; }
.btn-action { background-color: #409EFF; color: #fff; padding: 20rpx 40rpx; border-radius: 16rpx; font-size: 28rpx; }
.button-row { display: flex; justify-content: space-between; margin-bottom: 24rpx; }
.btn-cancel { background-color: #ccc; color: #333; padding: 20rpx; border-radius: 16rpx; font-size: 28rpx; flex: 1; margin-right: 10rpx; }
.btn-detail { background-color: #f0f0f0; color: #333; padding: 20rpx; border-radius: 16rpx; font-size: 28rpx; flex: 1; margin-left: 10rpx; }
.btn-confirm { background-color: #07C160; color: #fff; padding: 24rpx; border-radius: 20rpx; font-size: 30rpx; text-align: center; }
</style>
