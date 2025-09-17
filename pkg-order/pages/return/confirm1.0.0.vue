<template>
  <view class="container">
    <!-- 订单完成提示 -->
    <view class="result-card">
      <view class="result-title">🎉 还车成功！</view>
      <view class="result-desc">感谢您使用嗒嗒用车，以下是本次订单费用</view>
    </view>

    <!-- 费用明细 -->
    <view class="card">
      <view class="section-title">📊 本次费用明细</view>
      <view class="item">基础费用：¥ {{ feeDetail.basic }}</view>
      <view class="item">时长费用：¥ {{ feeDetail.time }}</view>
      <view class="item">里程费用：¥ {{ feeDetail.mileage }}</view>
      <view class="item">优惠抵扣：- ¥ {{ feeDetail.discount }}</view>
      <view class="total">总费用：¥ {{ feeDetail.total }}</view>
    </view>

    <!-- 操作按钮 -->
    <button class="btn-confirm" @click="goHome">返回首页</button>
    <button class="btn-detail" @click="goOrderDetail">查看订单详情</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrderFee } from '../api/index.js'

const feeDetail = ref({ basic: 8.00, time: 4.00, mileage: 2.00, discount: 5.00, total: 9.00 })

onMounted(async () => {
  try {
    const res = await getOrderFee({ orderId: 1 })
    feeDetail.value = res
  } catch (e) {
    console.error('❌ 获取费用失败', e)
    uni.showToast({ title: '获取费用失败', icon: 'none' })
  }
})

function goHome() {
  uni.reLaunch({ url: '/pages/home/index' })
}

function goOrderDetail() {
  uni.navigateTo({ url: '/pages/order/detail?orderId=1' })
}
</script>

<style scoped>
.container { padding: 24rpx; background-color: #f9f9f9; }
.result-card { background-color: #E6F7FF; border-radius: 20rpx; padding: 30rpx; text-align: center; margin-bottom: 24rpx; }
.result-title { font-size: 36rpx; font-weight: bold; margin-bottom: 12rpx; color: #409EFF; }
.result-desc { font-size: 26rpx; color: #666; }
.card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.section-title { font-weight: bold; font-size: 30rpx; margin-bottom: 12rpx; }
.item { font-size: 26rpx; color: #555; margin-bottom: 8rpx; }
.total { font-size: 32rpx; color: #e64e37; font-weight: bold; margin-top: 12rpx; }
.btn-confirm { background-color: #07C160; color: #fff; padding: 24rpx; border-radius: 20rpx; font-size: 30rpx; text-align: center; margin-bottom: 20rpx; }
.btn-detail { background-color: #f0f0f0; color: #333; padding: 20rpx; border-radius: 20rpx; font-size: 28rpx; text-align: center; }
</style>
