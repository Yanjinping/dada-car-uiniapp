<template>
  <view class="container">
    <!-- 车辆信息 -->
    <view class="card">
      <view class="car-header">
        <image class="car-image" :src="car.image || '/static/car_ec200.png'" />
        <view>
          <view class="car-name">{{ car.carModel || '未知车型' }} · {{ car.seatNum || 5 }}座</view>
          <view class="car-sub">{{ car.carNum || '未知车牌' }} | 续航 {{ car.remainMile || '--' }} km</view>
        </view>
      </view>
      <view class="location">📍 {{ car.netPointName || '未知网点' }}</view>
    </view>

    <!-- 操作按钮 -->
    <view class="button-group">
      <button class="btn-action" @click="control('open')">开门</button>
      <button class="btn-action" @click="control('close')">关门</button>
      <button class="btn-action" @click="control('horn')">鸣笛</button>
      <button class="btn-action" @click="control('find')">找车</button>
    </view>

    <!-- 次要操作 -->
    <view class="button-row">
      <button class="btn-gray" @click="onShowFee">查看费用</button>
      <button class="btn-gray" @click="onCallService">客服警察</button>
    </view>

    <!-- 行程信息 -->
    <view class="trip-info">⏱ 已用 {{ usedMinutes }} 分钟</view>

    <!-- 打卡+备注 -->
    <view class="button-row">
      <button class="btn-card" @click="onTakePhoto">📸 打卡拍照</button>
      <button class="btn-card" @click="onAddRemark">📝 添加备注</button>
    </view>

    <!-- 分享 -->
    <button class="btn-confirm" @click="onShare">分享动态</button>
  </view>
  
  <button class="btn-confirm" @click="onReturn">我要还车</button>

</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { openCar, closeCar, hornCar, findCar, getFee } from '../api/index.js'

const car = ref({})
const carId = ref(0)
const orderStartTime = ref(Date.now())
const usedMinutes = ref(0)

onLoad((options) => {
  try {
    const parsedCar = JSON.parse(decodeURIComponent(options.car || '{}'))
    car.value = parsedCar
    carId.value = parsedCar.carId || 0
    orderStartTime.value = Date.now()
    startTimer()
  } catch (e) {
    console.error('❌ 车辆解析失败:', e)
  }
})

const startTimer = () => {
  setInterval(() => {
    const now = Date.now()
    usedMinutes.value = Math.floor((now - orderStartTime.value) / 60000)
  }, 60000)
}

async function control(action) {
  try {
    if (!carId.value) throw new Error('缺少车辆ID')
    if (action === 'open') await openCar({ carId: carId.value })
    if (action === 'close') await closeCar({ carId: carId.value })
    if (action === 'horn') await hornCar({ carId: carId.value })
    if (action === 'find') await findCar({ carId: carId.value })
    uni.showToast({ title: `${action}成功`, icon: 'success' })
  } catch {
    uni.showToast({ title: `${action}失败`, icon: 'none' })
  }
}

async function onReturn() {
  uni.navigateTo({ url: '/pages/order/detail?carId=' + carId.value })
	
  try {
 //    // 1. 先调用后端还车接口
 //    await returnCar({ orderId: car.value.orderId })

 //    // 2. 获取还车后的最终费用
 //    const feeRes = await getFee({ orderId: car.value.orderId })
 //    const amount = feeRes.totalFee || 0

 //    // 3. 自动跳转到支付页，传入金额和订单号
 //    uni.navigateTo({
 //      // url: `/pages/order/pay?orderId=${car.value.orderId}&amount=${amount}`
 //    })
	
  } catch (e) {
    uni.showToast({ title: '还车失败', icon: 'none' })
  }
}



function onShowFee() {
  uni.navigateTo({ url: '/pages/order/fee' })
}

function onCallService() {
  uni.makePhoneCall({ phoneNumber: '12345678900' })
}

function onTakePhoto() {
  uni.chooseImage({
    count: 1,
    success: res => {
      console.log('📸 上传图片路径：', res.tempFilePaths[0])
      uni.showToast({ title: '照片上传成功', icon: 'success' })
    }
  })
}

function onAddRemark() {
  uni.navigateTo({ url: '/pages/remark/add?carId=' + carId.value })
}

function onShare() {
  uni.navigateTo({ url: '/pages/dynamic/share?carId=' + carId.value })
}
</script>

<style scoped>
.container { padding: 24rpx; background: #f9f9f9; }
.card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); }
.car-header { display: flex; align-items: center; margin-bottom: 14rpx; }
.car-image { width: 140rpx; height: 88rpx; margin-right: 24rpx; border-radius: 12rpx; }
.car-name { font-size: 32rpx; font-weight: bold; margin-bottom: 4rpx; }
.car-sub { font-size: 26rpx; color: #666; }
.location { font-size: 26rpx; color: #333; margin-top: 10rpx; }

.button-group, .button-row {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: 24rpx;
  gap: 20rpx;
}
.btn-action {
  background-color: #409EFF;
  color: #fff;
  padding: 24rpx 40rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  flex: 1 1 40%;
  text-align: center;
}
.btn-gray {
  background-color: #e0e0e0;
  color: #333;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  flex: 1 1 45%;
  text-align: center;
}
.btn-card {
  background-color: #fff;
  border: 2rpx solid #ccc;
  color: #000;
  font-size: 26rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  flex: 1 1 45%;
  text-align: center;
}
.trip-info {
  font-size: 26rpx;
  text-align: center;
  margin-bottom: 20rpx;
  color: #333;
}
.btn-confirm {
  background-color: #007aff;
  color: #fff;
  font-size: 30rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  text-align: center;
}
.btn-confirm {
  background-color: #07C160;
  color: #fff;
  font-size: 30rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  text-align: center;
  margin-top: 30rpx;
}

</style>
