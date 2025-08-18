<template>
  <scroll-view scroll-y class="scroll-wrapper">
    <view class="container">
      <!-- 顶部 -->
      <view class="top-bar">
         <view class="location">
                 <span class="icon">📍</span>
                 <span class="scrolling-text">{{ locationName }}</span>
         </view>
		 
        <view class="search-bar" @click="goSearch">
          <icon type="search" size="20" />
          <text class="search-text">搜索车辆/网点</text>
        </view>
        <image class="avatar" :src="user.avatar" @click="goMe" />
      </view>

      <!-- 学生认证 Banner -->
      <view v-if="!isCertified" class="certify-banner" @click="goCertification">
        🎁 学生认证立减 ¥5，点击认证
      </view>

      <!-- 推荐用车 -->
      <view class="section-title">🚗 推荐用车</view>
      <scroll-view scroll-x class="car-scroll" @scroll="onScroll"  >
        <view class="car-card-h" v-for="car in recommendedCars" 
		:key="car.carId" @click="onUseCar(car)"
		:class="{'car-selected': selectedCar && selectedCar.carId === car.carId}" 
		:style="getCarStyle(index)">
          <image :src="formatImage(car.carImage)" class="car-image-h" mode="aspectFill" />
          <view class="car-meta-h">
            <text class="car-num">{{ car.carNum }}</text>
            <view class="badge-row">
              <view class="badge">🔋 {{ car.restEnergy }}%</view>
              <view class="badge">📍 {{ (car.distanceKm).toFixed(1) }} km</view>
            </view>
            <text class="price">¥{{ car.price }} 起</text>
            <button class="btn-use" >立即用车</button>
          </view>
        </view>
      </scroll-view>

      <!-- 快捷入口 -->
      <view class="section-title">⚡ 快捷入口</view>
      <view class="function-grid">
        <view class="func-item" v-for="item in funcList" :key="item.name" @click="onFuncClick(item.name)">
          <view class="icon-bg">
            <icon :type="item.icon" size="40" color="#409EFF" />
          </view>
          <text class="func-label">{{ item.label }}</text>
        </view>
      </view>

      <!-- 常用网点 -->
      <view class="section-title">📍 常用网点</view>
      <view class="locations" v-for="loc in frequentLocations" :key="loc.id">
		<text @click="onNetPointClick(loc.id)">{{ loc.name }}</text>
      </view>

      <!-- 最近订单 -->
      <view v-if="recentOrder.time && recentOrder.carName" class="rec-section">
        <view class="section-title">🕘 最近订单</view>
        <view class="recent-order" @click="repeatOrder">
          🚘 {{ recentOrder.time }} · {{ recentOrder.carName }}
        </view>
      </view>

      <!-- 群引导 CTA -->
      <view class="group-join" @click="goJoinGroup">
        加入仰恩大学车友群，领专属福利 >
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getHomePage,getRecommendedCars } from '@/api/home'

// 变量定义
const locationName = ref('定位中...')
const isCertified = ref(false)
const user = reactive({ avatar: '/static/avatar.png' })
const recommendedCars = reactive([])
const frequentLocations = reactive([])
const recentOrder = reactive({ time: '', carName: '' })
const loadingCars = ref(false)

const selectedCar = ref(null);  // 存储当前选中的车辆
const scrollLeft = ref(0);  // 当前滚动位置
const scrollWidth = ref(0);  // 滚动容器的宽度
const index = ref(0); // 定义 index

const funcList = reactive([
  { icon: 'car', name: '找车', label: '找车' },
  { icon: 'gift', name: '领券', label: '领券' },
  { icon: 'user', name: '极速认证', label: '极速认证' },
  { icon: 'star', name: '积分', label: '我的积分' },
  { icon: 'share', name: '推广', label: '推广奖励' },
  { icon: 'chat', name: '晒单', label: '' },
])

// 滑动事件处理
const onScroll = (event) => {
  scrollLeft.value = event.detail.scrollLeft;  // 获取当前的滚动位置
  // 根据滚动位置计算当前显示的车辆
  updateSelectedCar();
};

// 计算当前选中的车辆
const updateSelectedCar = () => {
  const index = Math.floor(scrollLeft.value / scrollWidth.value);  // 根据滚动位置计算当前选中的车
  if (recommendedCars[index]) {
    selectedCar.value = recommendedCars[index];
  }
};
// 动态样式，凸显当前显示的车
const getCarStyle = (index) => {
  if (selectedCar.value && recommendedCars[index].carId === selectedCar.value.carId) {
    return {
      transform: 'scale(1.1)', // 放大当前车
      transition: 'transform 0.3s ease',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // 高亮阴影
      opacity: 1
    };
  }
   return {
      transform: 'scale(0.7)',  // 其他车辆缩小
      opacity: 0.7              // 其他车辆透明度稍低
    };
};

// 页面跳转函数
function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}
function onUseCar(car) {
  uni.navigateTo({ url: `/pages/confirm-order/index?carId=${car.carId}` })
}
function goCertification() {
	console.debug("goCertification")
  uni.navigateTo({ url: '/pages/certification/index' })
}
function goMe() {
  uni.navigateTo({ url: '/pages/me/index' })
}
function repeatOrder() {
  uni.navigateTo({ url: '/pages/order/index?reuse=1' })
}
function onFuncClick(name) {
  const pages = {
    '找车': '/pages/map/index',
    '领券': '/pages/coupon/index',
    '极速认证': '/pages/certification/index',
    '积分': '/pages/points/index',
    '推广': '/pages/promo/index',
    '晒单': '/pages/me/index'
  }
  uni.navigateTo({ url: pages[name] || '/' })
}
function goJoinGroup() {
  uni.showModal({
    title: '加入车友群',
    content: '加入仰恩大学车友群，享受专属福利和活动。',
    confirmText: '加入微信群',
    success(res) {
      if (res.confirm) {
        uni.previewImage({ urls: ['/static/group_qrcode.png'] })
      }
    }
  })
}
function formatImage(img) {
  if (!img) return '/static/car1.png'
  return img.startsWith('http') ? img : `http://localhost:8081${img}`
}

// 页面加载数据
onMounted(async () => {
  console.log('🏁 HomePage mounted，准备请求数据...')

  scrollWidth.value = uni.getSystemInfoSync().windowWidth; // 获取滚动容器的宽度

  try {
    const res = await getHomePage({
      longitude: 118.629039,
      latitude: 24.911498
    })
    console.log('✅ 首页接口响应：', res)

    const data = res.data || {}

    //  检查是否有未支付订单
    if (data.unpaidOrder && data.unpaidOrder.orderStatus === 'proceeding') {
      uni.setStorageSync('currentOrderNum', data.unpaidOrder.orderNum)
    
      // 提示一下
      uni.showToast({
        title: '您有未完成订单，即将跳转到支付订单页面',
        icon: 'none',
        duration: 1500
      })
    
      // 延迟跳转到支付页（确保提示能被看到）
      setTimeout(() => {
        uni.redirectTo({
          // url: `/pages/confirm-order/index?isPayment=true&orderNum=${data.unpaidOrder.orderNum}&carId=${data.unpaidOrder.carId}`
        })
      }, 1200)
    
      return // 中断其他加载逻辑
    }


    locationName.value = data.locationName || '当前位置'
    isCertified.value = data.certified || false
    user.avatar = data.avatar ?? '/static/avatar.png'

    // 推荐车辆
    recommendedCars.splice(0, recommendedCars.length, ...(data.recommendedCars || []))

    // 常用网点
    frequentLocations.splice(0, frequentLocations.length, ...(data.frequentNetPoints || []))

    // 最近订单处理
    if (data.recentOrder) {
      recentOrder.time = data.recentOrder.time
      recentOrder.carName = data.recentOrder.carName
    } else {
      recentOrder.time = ''
      recentOrder.carName = ''
    }

    console.log('🚘 推荐车辆数组：', data.recommendedCars)

  } catch (e) {    console.error('❌ 首页加载失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})


// 点击常用网点时，直接从本地存储的数据中获取推荐车辆
async function onNetPointClick(netId) {
 console.log('🚘 onNetPointClick：', netId)
  loadingCars.value = true
  try {
    const res = await getRecommendedCars({
      netId: netId,
      page: 1,
      size: 5
    })
    // ✅ 加入 AI 推荐排序（降序）
    const sortedCars = (res.data || []).sort((a, b) => {
      return (b.aiWeight ?? 0) - (a.aiWeight ?? 0)
    })
	  // 使用 splice 清空并插入排序后的推荐车辆数据
	recommendedCars.splice(0, recommendedCars.length, ...sortedCars);
  } catch (e) {
    console.error('❌ 获取车辆失败', e)
    uni.showToast({ title: '车辆加载失败', icon: 'none' })
  } finally {
    loadingCars.value = false
  }
}
</script>

<style scoped>
	
.scroll-wrapper {
  height: 100vh;
}

.container {
  padding: 24rpx;
  background: #f5f7fa;
  box-sizing: border-box;
}

/* 顶部栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}


.location {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 32rpx;
  max-width: 160rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}
.icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}
.scrolling-text {
  display: inline-block;
  white-space: nowrap;
  font-size: 32rpx;
  color: #333;
  animation: scrollLeftToRight 10s linear infinite;  /* 滚动动画 */
}

@keyframes scrollLeftToRight {
  0% {
    transform: translateX(100%); /* 从容器的右侧开始 */
  }
  50% {
    transform: translateX(0); /* 滚动到图标的位置，开始滚动 */
  }
  70% {
    transform: translateX(0); /* 停留在图标处，等待文字滚动完 */
  }
  100% {
    transform: translateX(-100%); /* 完全滚动到左侧，消失 */
  }
}

.search-bar {
  flex: 1;
  margin-left: 20rpx;
  background: #ffffff;
  padding: 12rpx 20rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.search-text {
  color: #999;
  margin-left: 10rpx;
  font-size: 26rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-left: 20rpx;
  border: 2rpx solid #409EFF;
}

/* 学生认证 */
.certify-banner {
  background: #fff2e8;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  color: #ff4d4f;
  font-weight: bold;
  text-align: center;
  font-size: 28rpx;
  animation: flash 1.5s infinite alternate;
}

@keyframes flash {
  0% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 标题 */
.section-title {
  font-weight: bold;
  margin: 20rpx 0 16rpx;
  font-size: 30rpx;
  color: #333;
}

/* 推荐用车卡片 */
.car-scroll {
  white-space: nowrap;
  overflow-x: scroll;
  padding: 10rpx 0 10rpx 10rpx;
}

.car-card-h {
  width: 580rpx;
  display: inline-block;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.05);
  margin-right: 20rpx;
  vertical-align: top;
    transition: transform 0.3s ease;  /* 放大时的平滑过渡 */
}
.car-selected {
  transform: scale(1.1); /* 放大选中的车 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 高亮阴影 */
}

.car-image-h {
  width: 100%;
  height: 240rpx;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  object-fit: cover;
}

.car-meta-h {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-height: 200rpx;
}

.car-num {
  font-weight: bold;
  font-size: 28rpx;
  margin-bottom: 6rpx;
}

.badge-row {
  display: flex;
  gap: 12rpx;
}

.badge {
  background: #eef6ff;
  color: #3b8cff;
  padding: 6rpx 16rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
}

.price {
  color: #e64e37;
  font-weight: bold;
  font-size: 30rpx;
  margin-top: 4rpx;
}

.btn-use {
  background: linear-gradient(to right, #36d1dc, #5b86e5);
  color: white;
  margin-top: 12rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  padding: 16rpx 0;
  box-shadow: 0 4rpx 10rpx rgba(91, 134, 229, 0.4);
}

/* 常用网点 */
.locations {
  background: #e6f7ff;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  display: inline-block;
  margin: 0 10rpx 10rpx 0;
  font-size: 26rpx;
  color: #409EFF;
}

/* 最近订单 */
.recent-order {
  background: #fffbe8;
  padding: 16rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 24rpx;
}

/* 快捷入口 */
.function-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20rpx 0;
}

.func-item {
  width: 32%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
  transition: transform 0.15s ease;
}

.func-item:active {
  transform: scale(0.95);
  opacity: 0.85;
}

.icon-bg {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}

.func-label {
  font-size: 26rpx;
  color: #333;
}

/* 群引导 CTA */
.group-join {
  background: linear-gradient(to right, #ebf5ff, #e6f7ff);
  padding: 24rpx;
  text-align: center;
  border-radius: 20rpx;
  color: #409EFF;
  font-weight: bold;
  font-size: 28rpx;
  margin-bottom: 40rpx;
}
</style>
