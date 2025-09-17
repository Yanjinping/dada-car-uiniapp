<template>
  <view class="car-scroll-section">
    <text class="section-title">{{ title }}</text>
    <scroll-view scroll-x class="scroll-content">
      <view 
        v-for="car in cars" 
        :key="car.id" 
        class="car-card"
        @click="handleCarClick(car)"
      >
        <image :src="car.image" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ car.name }}</text>
          <text class="price">¥{{ car.price }}/小时</text>
          <text class="distance">{{ car.distance }}m</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  cars: CarItem[]
}>()

const handleCarClick = (car: CarItem) => {
  uni.navigateTo({
    url: `/pages/car/detail?id=${car.id}`
  })
}
</script>

<style scoped>
.car-scroll-section {
  margin: 30rpx 0;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .scroll-content {
    white-space: nowrap;
    
    .car-card {
      display: inline-block;
      width: 280rpx;
      margin-right: 20rpx;
      border-radius: 16rpx;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
      
      image {
        width: 100%;
        height: 180rpx;
      }
      
      .info {
        padding: 16rpx;
        
        .name {
          font-size: 28rpx;
          display: block;
        }
        
        .price {
          color: #F0AD4E;
          font-weight: bold;
        }
        
        .distance {
          color: #999;
          font-size: 24rpx;
          display: block;
        }
      }
    }
  }
}
</style>