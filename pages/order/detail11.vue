<template>
  <view class="container">
    <!-- 车辆信息 -->
    <view class="card">
      <view class="car-header">
        <image class="car-image" :src="carInfo.image || '/static/car_ec200.png'" />
        <view>
          <view class="car-name">{{ carInfo.carModel || '未知车型' }} · {{ carInfo.seatNum || 4 }}座</view>
          <view class="car-sub">{{ carInfo.carNum || '未知车牌' }} | 起点：{{ carInfo.netPointName }}</view>
        </view>
      </view>
    </view>

    <!-- 套餐 + 优惠券 -->
    <view class="card">
      <view class="section-title">使用信息</view>
      <view class="item">🎁 套餐：{{ comboInfo.name || '未使用' }}（¥{{ comboInfo.comboRent || 0 }}）</view>
      <view class="item">🎟️ 优惠券：{{ couponInfo.name || '未使用' }}（-¥{{ couponInfo.discount || 0 }}）</view>
    </view>

    <!-- 费用明细 -->
    <view class="card">
      <view class="section-title">订单费用明细</view>
      <view class="fee-row" v-for="(item, index) in feeList" :key="index">
        <view class="label">{{ item.label }}</view>
        <view class="value">¥{{ item.amount }}</view>
      </view>
      <view class="total-highlight">应付总金额：¥{{ totalAmount }}</view>
    </view>

    <!-- 支付按钮 -->
    <button class="btn-confirm" @click="onPay">确认支付</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
// import { getOrderFee, payOrder } from '@/api/index.js'

const orderId = ref('')
const carInfo = ref({})
const totalAmount = ref(0)
const feeList = ref([])

const comboInfo = ref({})     // 套餐信息
const couponInfo = ref({})    // 优惠券信息

onLoad(async (options) => {
  orderId.value = options.orderId || ''
  carInfo.value = JSON.parse(decodeURIComponent(options.car || '{}'))

  try {
    const res = await getOrderFee({ orderId: orderId.value })
    totalAmount.value = res.totalFee || 0

    // 展示细项费用
    feeList.value = res.feeDetails || [
      { label: '套餐费用', amount: res.comboFee || 0 },
      { label: '服务费', amount: res.serviceFee || 0 },
      { label: '其他费用', amount: res.extraFee || 0 }
    ]

    comboInfo.value = res.comboInfo || {}
    couponInfo.value = res.couponInfo || {}

  } catch {
    uni.showToast({ title: '加载费用失败', icon: 'none' })
  }
})

async function onPay() {
  try {
    await payOrder({ orderId: orderId.value })
    uni.showToast({ title: '支付成功', icon: 'success' })
    uni.redirectTo({ url: '/pages/remark/add?carId=' + carInfo.value.carId })
  } catch {
    uni.showToast({ title: '支付失败', icon: 'none' })
  }
}
</script>

<style scoped>
.container { padding: 24rpx; background-color: #f9f9f9; }
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}
.car-header {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}
.car-image {
  width: 140rpx;
  height: 88rpx;
  margin-right: 24rpx;
  border-radius: 12rpx;
}
.car-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 4rpx;
}
.car-sub {
  font-size: 26rpx;
  color: #666;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.fee-row {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  margin-bottom: 8rpx;
  color: #555;
}
.total-highlight {
  font-size: 32rpx;
  font-weight: bold;
  color: #e64e37;
  margin-top: 16rpx;
}
.item {
  font-size: 26rpx;
  color: #444;
  margin-bottom: 10rpx;
}
.btn-confirm {
  background-color: #07C160;
  color: white;
  font-size: 30rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  text-align: center;
}
</style>
