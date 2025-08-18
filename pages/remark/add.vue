<template>
  <view class="container">
    <view class="section">
      <view class="title">为本次用车打个分吧</view>
      <view class="stars">
        <text v-for="n in 5" :key="n" @click="rating = n">
          <text :style="{ color: n <= rating ? '#FFD700' : '#ccc', fontSize: '48rpx' }">★</text>
        </text>
        <text class="score-text">{{ rating }}分</text>
      </view>
    </view>

    <view class="section">
      <view class="title">写下你的感受或建议</view>
      <textarea
        class="textarea"
        v-model="remark"
        placeholder="例如：这台车电量足，干净整洁，动力也不错~"
        maxlength="100"
      />
    </view>

    <view class="section">
      <view class="title">上传现场照片（选填）</view>
      <view class="photo-box">
        <view v-if="photo" class="photo-preview">
          <image :src="photo" mode="aspectFill" />
        </view>
        <button v-else class="photo-btn" @click="choosePhoto">选择照片</button>
      </view>
    </view>

    <button class="submit-btn" @click="onSubmit">提交评价</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const rating = ref(5)
const remark = ref('')
const photo = ref('')
const carId = ref(0)
const userId = uni.getStorageSync('userId')
const orderId = ref(0) // 可根据传参补充

onLoad((options) => {
  carId.value = Number(options.carId || 0)
  orderId.value = Number(options.orderId || 0)
})

function choosePhoto() {
  uni.chooseImage({
    count: 1,
    success: res => {
      photo.value = res.tempFilePaths[0]
    }
  })
}

function onSubmit() {
  if (!carId.value || !userId) {
    uni.showToast({ title: '缺少用户或车辆信息', icon: 'none' })
    return
  }
  uni.request({
    url: 'http://localhost:8080/api/car/remark/submit',
    method: 'POST',
    data: {
      carId: carId.value,
      userId,
      orderId: orderId.value,
      rating: rating.value,
      remark: remark.value
    },
    success: () => {
      uni.showToast({ title: '评价成功', icon: 'success' })
      uni.reLaunch({ url: '/pages/home/index' })
    },
    fail: () => {
      uni.showToast({ title: '提交失败', icon: 'none' })
    }
  })
}
</script>

<style scoped>
.container {
  padding: 30rpx;
}
.section {
  margin-bottom: 40rpx;
}
.title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.stars {
  display: flex;
  align-items: center;
}
.score-text {
  margin-left: 20rpx;
  font-size: 26rpx;
}
.textarea {
  width: 100%;
  height: 160rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.photo-box {
  display: flex;
  align-items: center;
}
.photo-preview image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}
.photo-btn {
  background-color: #eeeeee;
  font-size: 26rpx;
  color: #333;
  padding: 20rpx;
  border-radius: 12rpx;
}
.submit-btn {
  background-color: #07C160;
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  text-align: center;
}
</style>
