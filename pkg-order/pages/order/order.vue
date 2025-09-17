<template>
  <view class="container">
    <view class="header">车辆详情</view>
    <image :src="car.image" class="car-image" />
    <view class="car-info">
      <text>车型: {{ car.name }}</text>
      <text>电量: {{ car.battery }}%</text>
      <text>起步价: {{ car.price }} 元</text>
    </view>
    <button class="btn-order" @click="placeOrder">立即下单</button>
  </view>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
// import { showToast, navigateBack } from '@dcloudio/uni-app'

const car = reactive({
  name: '小鹏P7',
  battery: 85,
  price: 10,
  image: '/static/car1.png',
})

function placeOrder() {
  // TODO: 调用下单接口
  uni.showToast({ title: '下单成功，祝您用车愉快！' })
  setTimeout(() => {
    // navigateBack()
  }, 1500)
}

onMounted(() => {
  // TODO: 通过参数加载具体车辆信息
})
</script>

<style scoped>
.container {
  padding: 20px;
  text-align: center;
}
.header {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
.car-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  margin-bottom: 10px;
}
.car-info {
  font-size: 16px;
  margin-bottom: 20px;
}
.btn-order {
  background: #67c23a;
  color: white;
  padding: 12px;
  border-radius: 10px;
}
</style>
