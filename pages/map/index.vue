<template>
  <view class="page">

    <!-- 顶部渐变 + 自定义导航 -->
    <view class="hero">
      <view class="nav">
        <view class="nav-left" @click="goBack">‹</view>
        <view class="nav-title">找车</view>
        <view class="nav-right">
          <!-- <view class="dot"></view> -->
          <!-- <view class="dot"></view> -->
          <!-- <view class="camera"></view> -->
        </view>
      </view>

      <!-- 位置搜索胶囊 -->
      <view class="search-pill">
        <text class="loc-ico">📍</text>
        <text class="loc-text">{{ currentNetName || '请选择网点' }}</text>
      </view>

      <!-- 顶部筛选三连（车型/续航/评分） -->
      <view class="filters">
        <view class="filter-item" @click="onTapFilter('type')">
          <text>车型</text><text class="arrow">▾</text>
        </view>
        <view class="filter-item" @click="onTapFilter('range')">
          <text>续航</text><text class="arrow">▾</text>
        </view>
        <view class="filter-item" @click="onTapFilter('score')">
          <text>评分</text><text class="arrow">▾</text>
        </view>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view scroll-y class="content">

      <!-- 网点卡片（离你最近的网点） -->
      <view class="net-card" v-if="netPoints.length">
        <view class="net-tag">离你最近的网点</view>

        <view class="net-row">
          <text class="net-ico">🚗</text>
          <text class="net-name">{{ firstNet.netName }}</text>
          <text class="net-tip">（勿停车充电桩）</text>
          <view class="net-fold" @click="fold = !fold">{{ fold ? '收起' : '展开' }} ▾</view>
        </view>

        <view class="net-sub" v-if="!fold">
          <view class="sub-item">
            <text class="sub-ico">📍</text><text>{{ firstNet.distanceKm ? formatDistance(firstNet.distanceKm) : '50m' }}</text>
          </view>
          <view class="sub-item">
            <text class="sub-ico">🚘</text><text>{{ firstNet.carNum ?? 10 }}</text>
          </view>
          <view class="sub-item" @click.stop="navToNet(firstNet)">
            <text class="sub-ico">🧭</text><text>导航</text>
          </view>
        </view>
      </view>

      <!-- 推荐车辆列表 -->
      <view v-if="loadingCars" class="skeleton-box">
        <view class="skeleton" v-for="n in 3" :key="n"></view>
      </view>

      <view v-else>
        <view v-if="!recommendedCars.length" class="empty">暂无可用车辆</view>

        <view v-for="car in recommendedCars" :key="car.carId" class="car-card" @click.stop="useCar(car.carId)">
          <!-- 车型角标 -->
          <view class="model-chip">{{ car.modelName || '北汽EC200' }}</view>

          <view class="car-main">
            <!-- 车图（占位） -->
            <image class="car-img" :src="formatImage(car.carImage) || '/static/home/che-pic.png'" mode="widthFix"></image>

            <!-- 右侧信息 -->
            <view class="car-info">
              <view class="plate">
                <text class="plate-city">{{ (car.carNum || '闽C·D12345').slice(0,1) }}</text>
                <text class="plate-dot">·</text>
                <text class="plate-num">{{ (car.carNum || '闽C·D12345').slice(2) }}</text>
              </view>

              <view class="stats">
                <view class="stat">
                  <text class="stat-ico">🔋</text>
                  <text>{{ (car.restEnergy ?? 100) + '%' }}</text>
                </view>
                <view class="stat">
                  <text class="stat-ico">🛣</text>
                  <text>{{ (car.remainKm ?? 150) + 'km' }}</text>
                </view>
              </view>

              <view class="stars">
                <text v-for="i in 5" :key="i" class="star" :class="{ on: (car.score ?? 5) >= i }">★</text>
              </view>

              <!-- 价格行 -->
				<view class="price-line">
				  <text class="yen">¥</text>
				  <text class="price-num">{{ car.price ?? (car.basePrice ?? 8) }}</text>
				  <text class="price-qi">起</text>
				</view>
				
				<!-- 立即用车按钮 -->
				<button class="btn-green" @click.stop="useCar(car.carId)">立即用车</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 其它网点列表（可点切换） -->
      <view class="section-title">可用车辆网点</view>
      <view v-if="!netPoints.length" class="empty">暂无网点</view>
      <view v-for="point in netPoints" :key="point.id" class="net-row-lite" @click="selectNet(point)">
        <view class="lite-left">
          <text>📍 {{ point.netName }}</text>
          <text v-if="point.id === currentNetId" class="current">(当前)</text>
        </view>
        <view class="lite-right">{{ formatDistance(point.distanceKm) }} / 车位 {{ point.parkSpaceNum || 0 }}</view>
      </view>

      <!-- 附近打卡 -->
      <view class="section-title">附近车主打卡</view>
      <view v-if="!nearbyCheckins.length" class="empty">暂无动态</view>
      <view v-for="(item, idx) in nearbyCheckins" :key="idx" class="checkin">
        {{ item.user }} 刚刚从 {{ item.location }} 出发 🚗
      </view>

    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRecommendedCars, getNearbyNets } from '@/api/index.js'

/** —— 状态（沿用你原有的字段/接口） —— */
const recommendedCars = ref([])
const netPoints = ref([])
const currentNetId = ref(null)
const currentNetName = ref('')
const loadingCars = ref(false)
const loadingNets = ref(false)
const fold = ref(false)
const longitude = 118.589
const latitude = 24.911
const nearbyCheckins = ref([
  { user: '张三', location: '滨江公园' },
  { user: '李雷', location: '仰恩图书馆' }
])

const firstNet = computed(() => netPoints.value[0] || {})

/** —— 交互 —— */
function goBack(){ uni.navigateBack({ fail:()=>{} }) }
function onTapFilter(type){ uni.showToast({ title:'筛选：' + type, icon:'none' }) }
function navToNet(net){ uni.showToast({ title:'打开导航', icon:'none' }) }

function formatImage(url){ return url }
function formatDistance(km){
  if (typeof km !== 'number' || isNaN(km)) return '未知'
  const m = Math.round(km * 1000)
  return m >= 1000 ? (m/1000).toFixed(1) + ' km' : m + ' m'
}

function selectNet(point){
  currentNetId.value = point.id
  currentNetName.value = point.netName
  fetchCars()
}

async function fetchCars(){
  loadingCars.value = true
  try{
    const res = await getRecommendedCars({ netId: currentNetId.value, page:1, size:5 })
    recommendedCars.value = (res.data || []).sort((a,b)=> (b.aiWeight ?? 0) - (a.aiWeight ?? 0))
  }catch(e){
    console.error(e)
    uni.showToast({ title:'车辆加载失败', icon:'none' })
  }finally{
    loadingCars.value = false
  }
}

async function fetchData(){
  loadingNets.value = true
  try{
    const netRes = await getNearbyNets({ longitude, latitude, radius:30000, size:3 })
    netPoints.value = netRes.data || []
    if (netPoints.value.length){
      currentNetId.value = netPoints.value[0].id
      currentNetName.value = netPoints.value[0].netName
      await fetchCars()
    }
  }catch(e){
    console.error(e)
    uni.showToast({ title:'加载失败', icon:'none' })
  }finally{
    loadingNets.value = false
  }
}

function useCar(carId){
  uni.setStorageSync('carId', carId)
  uni.navigateTo({ url:`/pages/confirm-order/index?carId=${carId}` })
}

onMounted(fetchData)
</script>

<style scoped>
/* 页面基底 */
.page{background:#f7f9fb;height:100vh;display:flex;flex-direction:column}
.content{flex:1}

/* 顶部渐变 */
.hero{
  background:linear-gradient(180deg,#55e18a 0%, #36cf79 60%, #36cf7900 100%);
  padding: 24rpx 24rpx 36rpx 24rpx;
  border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx;
}
/* 自定义导航 */
.nav{height:88rpx;display:flex;align-items:center;justify-content:space-between}
.nav-left{width:80rpx;height:80rpx;border-radius:40rpx;background:#ffffff30;color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:40rpx}
.nav-title{color:#2c2c2c;font-weight:700;font-size:36rpx;letter-spacing:2rpx}
.nav-right{width:180rpx;display:flex;justify-content:flex-end;align-items:center;gap:16rpx}
.dot{width:14rpx;height:14rpx;background:#ffffff90;border-radius:50%}
.camera{width:44rpx;height:44rpx;border-radius:22rpx;border:4rpx solid #ffffffa0}

/* 搜索位置胶囊 */
.search-pill{
  margin-top: 12rpx;
  height: 72rpx;
  background:#fff;border-radius:100rpx;padding:0 24rpx;
  display:flex;align-items:center;box-shadow:0 8rpx 24rpx rgba(0,0,0,.06)
}
.loc-ico{font-size:30rpx;margin-right:8rpx}
.loc-text{font-size:28rpx;color:#666;flex:1}

/* 筛选条 */
.filters{
  margin-top: 20rpx; background:#ffffffcc;border-radius:16rpx;height:72rpx;
  display:flex;align-items:center;justify-content:space-around;
  box-shadow:0 6rpx 16rpx rgba(0,0,0,.05)
}
.filter-item{font-size:28rpx;color:#333;display:flex;align-items:center;gap:8rpx}
.arrow{font-size:24rpx;color:#888}

/* 网点卡片 */
.net-card{
  margin: 24rpx; background:#fff; border-radius:20rpx; padding: 20rpx;
  box-shadow:0 8rpx 24rpx rgba(0,0,0,.06)
}
.net-tag{
  align-self:flex-start;background:#ffe9c6;color:#ff9b00;border-radius:12rpx;
  padding:6rpx 14rpx;font-size:22rpx;display:inline-block;margin-bottom:10rpx
}
.net-row{display:flex;align-items:center;gap:10rpx}
.net-ico{font-size:30rpx}
.net-name{font-size:30rpx;font-weight:700}
.net-tip{font-size:26rpx;color:#333}
.net-fold{margin-left:auto;color:#333;background:#f6f6f6;padding:8rpx 18rpx;border-radius:24rpx;font-size:26rpx}
.net-sub{display:flex;gap:28rpx;margin-top:12rpx}
.sub-item{display:flex;align-items:center;gap:6rpx;color:#4f5561;font-size:26rpx}

/* 车卡 */
.car-card{
  margin: 0 24rpx 24rpx 24rpx; background:#fff;border-radius:24rpx;overflow:hidden;
  box-shadow:0 10rpx 28rpx rgba(0,0,0,.08)
}
.model-chip{
  position:absolute;margin:16rpx 0 0 16rpx;background:#e7fff1;color:#19bf6f;
  font-size:24rpx;border-radius:24rpx;padding:6rpx 16rpx
}
.car-main{display:flex;gap:20rpx;padding:24rpx}
.car-img{width:300rpx}
.car-info{flex:1;display:flex;flex-direction:column}

/* 车牌 */
.plate{display:flex;align-items:baseline;gap:6rpx;margin-bottom:6rpx}
.plate-city{font-size:40rpx;font-weight:800;color:#333}
.plate-dot{font-size:40rpx;color:#333}
.plate-num{font-size:40rpx;font-weight:800;color:#333}

/* 电量/续航 */
.stats{display:flex;gap:24rpx;margin:10rpx 0}
.stat{display:flex;align-items:center;gap:6rpx;color:#19bf6f;font-size:26rpx}
.stat-ico{font-size:28rpx}

/* 星级 */
.stars{margin:4rpx 0 8rpx 0}
.star{font-size:26rpx;color:#e6e6e6;margin-right:6rpx}
.star.on{color:#ffb400}

/* 价格 + 按钮 */
.price-line{display:flex;align-items:baseline;gap:4rpx;margin:4rpx 0 12rpx 0}
.yuan{font-size:28rpx;color:#ff2f2f}
.price{font-size:44rpx;color:#ff2f2f;font-weight:800}
.qi{font-size:26rpx;color:#ff2f2f}
.btn-green{
  margin-top:auto;background:linear-gradient(180deg,#33d37b,#26c36f);
  color:#fff;border:none;border-radius:60rpx;height:76rpx;font-size:30rpx
}

/* 网点列表（下方） */
.section-title{margin:8rpx 24rpx 12rpx 24rpx;font-size:28rpx;color:#333}
.net-row-lite{
  margin:0 24rpx; padding:22rpx 0; border-bottom:1px solid #eee;
  display:flex;justify-content:space-between;align-items:center
}
.lite-left{font-size:28rpx}
.current{color:#409EFF;margin-left:8rpx}
.lite-right{color:#666;font-size:26rpx}

/* 打卡 */
.checkin{margin:0 24rpx 12rpx 24rpx;background:#f2f6fc;border-radius:14rpx;padding:16rpx;font-size:26rpx}

/* 骨架屏/空态 */
.skeleton-box{padding:0 24rpx;display:flex;flex-direction:column;gap:20rpx}
.skeleton{height:280rpx;background:linear-gradient(90deg,#f3f3f3 25%,#ecebeb 50%,#f3f3f3 75%);
  background-size:400% 100%;animation:shimmer 1.2s infinite;border-radius:20rpx}
@keyframes shimmer{0%{background-position:-400rpx 0}100%{background-position:400rpx 0}}
.empty{margin:24rpx 0;text-align:center;color:#999;font-size:26rpx}
</style>
