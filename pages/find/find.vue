<template>
  <view class="page">
    <!-- 顶部渐变 + 自定义导航 -->
    <view class="hero">
      <view class="nav">
        <view class="nav-left" @click="goBack">‹</view>
        <view class="nav-title">还车</view>
        <view class="nav-right"></view>
      </view>

      <!-- 搜索胶囊（仅展示态，可扩展搜索） -->
      <view class="search-pill">
        <text class="loc-ico">🔍</text>
        <text class="loc-text">搜索网点名称</text>
      </view>
    </view>

    <scroll-view scroll-y class="content">
      <view v-if="loading" class="skeleton-box">
        <view class="skeleton" v-for="n in 4" :key="n"></view>
      </view>

      <view v-else>
        <view v-if="!stations.length" class="empty">未找到相关网点</view>

        <view v-for="(s,idx) in stations" :key="s.id" class="row">
          <view class="row-left">
            <view class="title">
              <text class="ico">🚗</text>
              <text class="t-locate">{{ s.district || '-' }}</text>
              <text class="t-name"> | {{ s.netName }}</text>
            </view>
            <view class="tips" v-if="s.tips">{{ s.tips }}</view>
            <view class="sub">
              <text class="sub-ico">📏</text><text class="sub-t">{{ formatDistance(s.distanceKm) }}</text>
              <text class="sub-ico" style="margin-left:24rpx">🅿</text><text class="sub-t"> {{ s.parkSpaceNum || 0 }}</text>
              <view class="nav-link" @click.stop="navTo(s)">导航</view>
            </view>
          </view>

          <view class="row-right">
            <button class="btn-choose" @click="pick(s)">选择</button>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNearbyNets } from '@/api/index.js'

const stations = ref([])
const loading = ref(false)
const longitude = 118.589
const latitude  = 24.911

function goBack(){ uni.navigateBack({ fail:()=>{} }) }
function formatDistance(km){
  if (typeof km !== 'number' || isNaN(km)) return '未知'
  const m = Math.round(km * 1000)
  return m >= 1000 ? (km.toFixed(1) + ' km') : (m + ' m')
}
function navTo(s){ uni.showToast({ title:'打开导航', icon:'none' }) }
function pick(s){
  // 写入本地，返回上一页由找车页 onShow 接收
  uni.setStorageSync('pickedNet', s)
  uni.navigateBack()
}

async function fetchStations(){
  loading.value = true
  try{
    const res = await getNearbyNets({ longitude, latitude, radius:30000, size:50 })
    stations.value = res?.data || []
  }catch(e){
    console.error(e)
    uni.showToast({ title:'加载失败', icon:'none' })
  }finally{
    loading.value = false
  }
}
onMounted(fetchStations)
</script>

<style scoped>
.page{background:#f7f9fb;height:100vh;display:flex;flex-direction:column}
.content{flex:1}

/* 顶部渐变 */
.hero{
  background:linear-gradient(180deg,#55e18a 0%, #36cf79 60%, #36cf7900 100%);
  padding: 24rpx 24rpx 36rpx 24rpx;
  border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx;
}
.nav{height:88rpx;display:flex;align-items:center;justify-content:space-between}
.nav-left{width:80rpx;height:80rpx;border-radius:40rpx;background:#ffffff30;color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:40rpx}
.nav-title{color:#2c2c2c;font-weight:700;font-size:36rpx;letter-spacing:2rpx}

/* 搜索胶囊 */
.search-pill{
  margin-top: 12rpx; height: 72rpx; background:#fff; border-radius:100rpx;
  padding:0 24rpx; display:flex; align-items:center; box-shadow:0 8rpx 24rpx rgba(0,0,0,.06)
}
.loc-ico{font-size:30rpx;margin-right:8rpx}
.loc-text{font-size:28rpx;color:#999;flex:1}

/* 列表行 */
.row{
  margin: 16rpx 24rpx; padding: 18rpx; background:#fff; border-radius:16rpx;
  display:flex; align-items:flex-start; justify-content:space-between; gap:20rpx;
  box-shadow:0 6rpx 16rpx rgba(0,0,0,.05)
}
.row-left{flex:1}
.title{display:flex;align-items:center;gap:6rpx;font-size:30rpx;color:#333;font-weight:700}
.ico{font-size:30rpx}
.t-locate{color:#2c2c2c}
.t-name{color:#2c2c2c}
.tips{color:#333;font-size:26rpx;margin-top:6rpx}
.sub{display:flex;align-items:center;margin-top:10rpx}
.sub-ico{font-size:26rpx;color:#4f5561;margin-right:6rpx}
.sub-t{font-size:26rpx;color:#4f5561}
.nav-link{margin-left:24rpx;font-size:26rpx;color:#19bf6f}

.row-right{align-self:center}
.btn-choose{
  background:#ffd568;color:#333;border:none;border-radius:999rpx;height:60rpx;line-height:60rpx;
  padding:0 24rpx;font-size:26rpx
}

/* 骨架/空态 */
.skeleton-box{padding:0 24rpx;display:flex;flex-direction:column;gap:16rpx;margin-top:12rpx}
.skeleton{height:120rpx;background:linear-gradient(90deg,#f3f3f3 25%,#ecebeb 50%,#f3f3f3 75%);
  background-size:400% 100%;animation:shimmer 1.2s infinite;border-radius:16rpx}
@keyframes shimmer{0%{background-position:-400rpx 0}100%{background-position:400rpx 0}}
.empty{margin:24rpx 0;text-align:center;color:#999;font-size:26rpx}
</style>
