<template>
	<view class="container">
		<!-- 当前网点 -->
		<view class="location">
			<text class="location-icon">📍</text>
			<text>{{ currentNetName || '请选择网点' }}</text>
			<button class="refresh-btn" @click="refreshData">刷新</button>
		</view>

		<!-- 推荐用车 -->
		<view class="section-title">🚗 推荐用车</view>
		
		<view v-if="loadingCars" class="skeleton-box">
		  <view class="skeleton-card" v-for="n in 3" :key="n"></view>
		</view>
		
		<view v-if="recommendedCars.length === 0" class="empty-text">暂无可用车辆</view>
		<view v-for="car in recommendedCars" :key="car.carId" class="car-card">
			<view class="car-info">
				<text class="car-name">🚘 {{ car.carNum }}</text>
				<text class="car-net">{{ car.netName || '未知网点' }}</text>
			</view>
			<view class="car-meta">
				<text>🔋 {{ car.restEnergy ?? 0 }}%</text>
				<text>📍 {{ formatDistance(car.distanceKm) }}</text>
				<text>⭐ {{ car.score ?? 4.8 }} 分</text>
				<text>💰 ¥{{ car.price ?? 10 }} 起</text>
			</view>
			<view class="car-remark">「{{ car.remark || '这台车电量很稳，体验不错' }}」</view>
			<view class="car-usage">好评使用 {{ car.usedCount ?? 0 }} 次</view>
			<button class="btn-use" @click="useCar(car.carId)">立即用车</button>
		</view>

		<!-- 可用车辆网点 -->
		<view class="section-title">📍 可用车辆网点</view>
		<view v-if="netPoints.length === 0" class="empty-text">暂无网点</view>
		<view v-for="point in netPoints" :key="point.id" class="net-point" @click="selectNet(point)">
			<view class="net-left">
				📍 {{ point.netName }}
				<text v-if="point.id === currentNetId" style="color: #409EFF; margin-left: 8rpx;">(当前)</text>
			</view>
			<view class="net-right">
				{{ formatDistance(point.distanceKm) }} / 车位 {{ point.parkSpaceNum || 0 }}
			</view>
		</view>

		<!-- 附近车主打卡动态 -->
		<view class="section-title">👥 附近车主打卡</view>
		<view v-if="nearbyCheckins.length === 0" class="empty-text">暂无动态</view>
		<view v-for="(item, index) in nearbyCheckins" :key="index" class="checkin-box">
			<text class="checkin-text">{{ item.user }} 刚刚从 {{ item.location }} 出发 🚗</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRecommendedCars, getNearbyNets } from '@/api/index.js'

// 📌 车辆/网点数据
const recommendedCars = ref([])
const netPoints = ref([])

// 📌 打卡动态
const nearbyCheckins = ref([
  { user: '张三', location: '滨江公园' },
  { user: '李雷', location: '仰恩图书馆' }
])

// 📌 当前定位与选中的网点
const currentNetId = ref(null)
const currentNetName = ref('')

// 📌 假定位（后续可改为微信授权定位）
const longitude = 118.589
const latitude = 24.911

const loadingCars = ref(false)
const loadingNets = ref(false)

// 📌 格式化距离显示
function formatDistance(km) {
  if (typeof km !== 'number' || isNaN(km)) return '未知'
  const m = km * 1000
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`
}

// 📌 用户点击某网点
function selectNet(point) {
  currentNetId.value = point.id
  currentNetName.value = point.netName
  fetchCars()
}

// 📌 获取推荐车辆（含 AI 排序）
async function fetchCars() {
  loadingCars.value = true
  try {
    const res = await getRecommendedCars({
      netId: currentNetId.value,
      page: 1,
      size: 5
    })
    // ✅ 加入 AI 推荐排序（降序）
    recommendedCars.value = (res.data || []).sort((a, b) => {
      return (b.aiWeight ?? 0) - (a.aiWeight ?? 0)
    })
  } catch (e) {
    console.error('❌ 获取车辆失败', e)
    uni.showToast({ title: '车辆加载失败', icon: 'none' })
  } finally {
    loadingCars.value = false
  }
}

// 📌 加载网点 + 默认车辆
async function fetchData() {
  loadingNets.value = true
  try {
    const netRes = await getNearbyNets({
      longitude,
      latitude,
      radius: 30000,
      size: 3
    })
	
	
    netPoints.value = netRes.data || []

    if (netPoints.value.length > 0) {
      const first = netPoints.value[0]
      currentNetId.value = first.id
      currentNetName.value = first.netName
      await fetchCars()
    }
  } catch (e) {
    console.error('❌ 获取网点失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loadingNets.value = false
  }
}

// 📌 用户主动刷新
function refreshData() {
  fetchData()
}

// 📌 用车跳转
function useCar(carId) {
uni.setStorageSync('carId',carId)
  uni.navigateTo({
    url: `/pages/confirm-order/index?carId=${carId}`
  })
}

// 页面初始化加载
onMounted(() => {
  fetchData()
})
</script>


<style scoped>
	.container {
		padding: 24rpx;
		background-color: #fff;
	}

	.location {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		font-size: 28rpx;
	}

	.location-icon {
		margin-right: 8rpx;
	}

	.refresh-btn {
		font-size: 26rpx;
		color: #007aff;
		background: none;
		border: none;
	}

	.section-title {
		font-weight: bold;
		margin-top: 30rpx;
		margin-bottom: 20rpx;
		font-size: 32rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #999;
		text-align: center;
		margin: 20rpx 0;
	}

	.car-card {
		background: #f9f9f9;
		padding: 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 20rpx;
	}

	.car-info {
		display: flex;
		justify-content: space-between;
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.car-net {
		color: #666;
	}

	.car-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		font-size: 24rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.car-remark {
		font-size: 24rpx;
		color: #444;
		margin-bottom: 4rpx;
	}

	.car-usage {
		font-size: 22rpx;
		color: #888;
		margin-bottom: 12rpx;
	}

	.btn-use {
		background: #409eff;
		color: #fff;
		text-align: center;
		padding: 14rpx 0;
		font-size: 28rpx;
		border-radius: 12rpx;
	}

	.net-point {
		display: flex;
		justify-content: space-between;
		padding: 16rpx 0;
		border-bottom: 1px solid #eee;
		font-size: 28rpx;
	}

	.net-left {
		font-weight: 500;
	}

	.net-right {
		color: #666;
		font-size: 26rpx;
	}

	.checkin-box {
		background: #f2f6fc;
		padding: 16rpx;
		border-radius: 12rpx;
		margin-bottom: 12rpx;
	}

	.checkin-text {
		font-size: 26rpx;
		color: #333;
	}
	.skeleton-box {
	  display: flex;
	  flex-direction: column;
	  gap: 20rpx;
	}
	
	.skeleton-card {
	  height: 200rpx;
	  background: linear-gradient(90deg, #f3f3f3 25%, #ecebeb 50%, #f3f3f3 75%);
	  background-size: 400% 100%;
	  animation: shimmer 1.2s infinite;
	  border-radius: 16rpx;
	}
	
	@keyframes shimmer {
	  0% {
	    background-position: -400rpx 0;
	  }
	  100% {
	    background-position: 400rpx 0;
	  }
	}

</style>