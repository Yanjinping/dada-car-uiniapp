<template>
  <view class="page">
    <!-- 顶部渐变区 -->
    <view class="hero">
      <TitleBar title="找车" background="transparent" />
      <!-- 搜索胶囊 -->
      <view class="search-wrap">
        <image class="ico" src="/static/icons/dingwei.png" mode="widthFix" />
        <input
          class="inp"
          :value="keyword"
          placeholder="坪山加油站"
          confirm-type="search"
          @input="onInput"
          @confirm="doSearch"
        />
      </view>

      <!-- 筛选条 -->
      <view class="filters">
        <view class="filter-item" @tap="openFilter('type')">
          <text>车型</text>
          <image class="down" src="/static/icons/arrow-drop-down-fill.png" mode="widthFix" />
        </view>
        <view class="filter-item" @tap="openFilter('range')">
          <text>续航</text>
          <image class="down" src="/static/icons/arrow-drop-down-fill.png" mode="widthFix" />
        </view>
        <view class="filter-item" @tap="openFilter('score')">
          <text>评分</text>
          <image class="down"  src="/static/icons/arrow-drop-down-fill.png" mode="widthFix" />
        </view>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view scroll-y class="list">
      <view
        v-for="(np, idx) in nets"
        :key="np.id"
        class="net-card"
      >
        <view v-if="idx === 0" class="tip">离你最近的网点</view>

        <!-- 网点头部 -->
        <view class="net-head">
          <image class="car-ico" src="/static/icons/cheliang.png" mode="widthFix" />
          <view class="net-title">
            <text class="district">{{ np.areaName || '' }}</text>
            <text class="sep"> | </text>
            <text class="name">{{ np.netName }}</text>
          </view>

          <view class="fold-btn" @tap="toggleNet(np)">
            <text  class="t">{{ np.expanded ? '收起' : '选车' }}</text>
            <image class="down" :class="{ up: np.expanded }" src="/static/icons/arrow-drop-down-fill.png" mode="widthFix" />
          </view>
        </view>

        <!-- 网点附属信息 -->
        <view class="net-sub">
          <view class="sub-item">
            <image class="sico" src="/static/icons/juli.png" mode="widthFix" />
            <text>{{ formatDistance(np.distance) }}</text>
          </view>
          <view class="sub-item">
            <image class="sico" src="/static/icons/cheliang.png" mode="widthFix" />
            <text>{{ np.carCount }}</text>
          </view>
          <view class="sub-item link" @tap="goNav(np)">
            <image class="sico" src="/static/icons/daohang.png" mode="widthFix" />
            <text>导航</text>
          </view>
        </view>

        <!-- 车辆列表（展开） -->
        <view v-show="np.expanded" class="cars">
          <view
            v-for="car in np.cars"
            :key="car.id"
            class="car-card"
          >
            <view class="badge">{{ car.model || '车型' }}</view>

            <image class="photo" :src="car.image || '/static/car1.png'" mode="widthFix" />

            <view class="info">
              <view class="plate">{{ car.plate }}</view>

              <view class="stats">
                <view class="stat">
                  <text class="tiny-ico">🔋</text>
                  <text>{{ car.power }}%</text>
                </view>
                <view class="stat">
                  <text class="tiny-ico">🕒</text>
                  <text>{{ car.range }}km</text>
                </view>
              </view>

              <view class="stars">
                <text v-for="n in 5" :key="n">{{ n <= Math.round(car.score || 5) ? '★' : '☆' }}</text>
              </view>

              <view class="price">
                <text class="yen">¥</text>{{ car.priceStart }}<text class="qi">起</text>
              </view>

              <button class="btn-use" @tap="useNow(car, np)">立即用车</button>
            </view>
          </view>
        </view>
      </view>

      <view v-if="nets.length === 0" class="empty">未找到符合条件的网点</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted  } from 'vue'
import {  onLoad } from '@dcloudio/uni-app'
import TitleBar from '@/components/header/TitleBar.vue'

import { getNetList } from '../../api/net'   // 如果你就写在同文件：删掉这行；若单独放 api 模块，请改成你的真实路径

const keyword = ref('')
const allNets = ref([])
const nets = ref([])
const locating = ref(false)
const page = ref(0)
const size = ref(20)

/** 从接口返回里提取“数组” */
function pickArray(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload) return []
  // 常见结构兼容：{ data: [] } / { data: { list: [] } } / { records: [] } / { content: [] }
  if (Array.isArray(payload.data)) return payload.data
  if (payload.data && Array.isArray(payload.data.list)) return payload.data.list
  if (payload.data && Array.isArray(payload.data.records)) return payload.data.records
  if (payload.data && Array.isArray(payload.data.content)) return payload.data.content
  if (Array.isArray(payload.list)) return payload.list
  if (Array.isArray(payload.records)) return payload.records
  if (Array.isArray(payload.content)) return payload.content
  return []
}

/** 统一规范化为前端需要的网点字段 */
function normalizeNets(list) {
  return (list || []).map(x => ({
    id: x.id || x.netId || x.net_id,
    areaName: x.areaName || x.area || x.district || '',
    netName: x.netName || x.name || x.net_addr || '',
    lat: x.latitude ?? x.lat ?? x.netLat,
    lng: x.longitude ?? x.lng ?? x.netLng,
    carCount: x.carCount ?? x.remainCars ?? x.car_num ?? 0,
    distance: x.distance ?? x.dist ?? null,
    expanded: false,
    cars: []
  }))
}

/** 获取定位（拿不到也不拦截） */
function getLocationOnce() {
  return new Promise(resolve => {
    locating.value = true
    uni.getLocation({
      type: 'gcj02',
      success: (pos) => resolve({ lat: pos.latitude, lng: pos.longitude }),
      fail: () => resolve({ lat: undefined, lng: undefined }),
      complete: () => (locating.value = false)
    })
  })
}

// —— 使用 /net/return/list 加载网点（优先接口，失败 mock） ——
async function loadNets() {
  try {
    const { lat, lng } = await getLocationOnce()
	
    const params = {
      lat, lng,
      kw: (keyword.value || '').trim(),
      page: page.value,
      size: size.value
    }
    const res = await getNetList(params)
    const payload = res && res.data !== undefined ? res.data : res
    const arr = pickArray(payload)
    const norm = normalizeNets(arr)
    allNets.value = norm.length ? norm : mockNets()
  } catch (e) {
    allNets.value = mockNets()
  } finally {
    nets.value = [...allNets.value]
    if (nets.value[0]) {
      nets.value[0].expanded = true
      if (!nets.value[0].cars?.length) loadCars(nets.value[0])
    }
  }
}
</script>

<style lang="scss" scoped>
.page{
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部渐变 */
.hero{
  width: 750rpx;
  height: 320rpx;
  background: linear-gradient( 180deg, #5EDC84 0%, #3DCD75 100%);
  // background: url('/static/icons/bottom.png')
   // no-repeat center bottom;
  background-size: cover; /* 根据需求调整 */
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
}

/* 搜索胶囊 */
.search-wrap{
  margin: 140rpx auto 12rpx;
  height: 96rpx;
  background: #fff;
  border-radius: 999rpx;
  display: flex; align-items: center;
  padding: 0 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,.08);
  .ico{ width: 40rpx; height: 40rpx; margin-right: 12rpx; }
  .inp{ flex: 1; height: 96rpx; line-height: 96rpx; font-size: 30rpx; }
}

/* 筛选条 */
.filters{
  width: 480rpx;
  margin-left: 40rpx;
  margin-top: 40rpx;
  display: flex; align-items: center; justify-content: space-between;
  .filter-item{
	  font-family: AlibabaPuHuiTi, sans-serif;
	  font-weight: 500;
	  font-size: 32rpx;
	  color: #222222;
	  line-height: 32rpx;
	  text-align: center;
	  font-style: normal;
	  text-transform: none;
	   }
  .down{ width: 28rpx; height: 28rpx; color: #000; }
  .down.up{ transform: rotate(180deg); }
}

/* 列表 */
.list{
  flex: 1;
  height: calc(100vh - 320rpx);
  padding: 16rpx 20rpx 0;
  margin: 120rpx auto 12rpx;
  width: 710rpx;
  height: 1222rpx;
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 24rpx 24rpx;
}

/* 网点卡 */
.net-card{
  background: #fff; border-radius: 24rpx; padding: 18rpx;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,.06);
  margin-bottom: 20rpx;
}
.tip{
  display:inline-block;
  background: #FFEFD6; color:#F59A23;
  padding: 7rpx 26rpx; border-radius: 12rpx; font-size: 24rpx; color: #FF9C08; margin-bottom: 18rpx;
}
.net-head{
 display:flex; align-items:center; gap:12rpx;font-family: AlibabaPuHuiTi, sans-serif;
 font-weight: 500;
 font-size: 30rpx;
 color: #222222;
 line-height: 40rpx;
 text-align: left;
 font-style: normal;
 text-transform: none;
  .car-ico{ width: 36rpx; height: 36rpx; }
  .net-title{ flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .district{ color:#2BB25D; font-weight:600; }
  .sep{ color:#999; margin: 0 8rpx; }
  .name{ color:#222; font-weight:600;  }
  .fold-btn{
   background: linear-gradient( 270deg, #FDD41F 0%, #FFC868 100%);
   border-radius: 24rpx 24rpx 24rpx 24rpx;
    padding: 10rpx 18rpx;
    display:flex; align-items:center; gap:6rpx; ffont-weight:600;
	.t{
	font-family: AlibabaPuHuiTi, sans-serif;
	font-weight: 400;
	font-size: 28rpx;
	color: #222222;
	line-height: 32rpx;
	text-align: center;
	font-style: normal;
	text-transform: none;	
	}
    .down{ width: 26rpx; height: 26rpx; transition: transform .2s ease; }
    .down.up{ transform: rotate(180deg); }
  }
}
.net-sub{
  display:flex; gap:24rpx; margin-top: 12rpx; padding-bottom: 10rpx;
  color:#666; font-size: 28rpx;
  .sub-item{ display:flex; align-items:center; gap:18rpx; }
  .sico{ width:32rpx; height: 32rpx; }
  .link{ color:#26B567; font-weight:600; }
}

/* 车辆列表 */
.cars{ margin-top: 14rpx; }
.car-card{
  position: relative;
  display:flex; gap: 20rpx;
  background:#fff; border: 2rpx solid #EEF1EF;
  border-radius: 20rpx; padding: 18rpx; margin-bottom: 16rpx;
  .badge{
    position:absolute; left: 22rpx; top: 16rpx;
    background:#EFFFF3; color:#26B567; padding: 8rpx 16rpx;
    border-radius: 16rpx; font-size: 24rpx; font-weight:600;
  }
  .photo{ width: 280rpx; height: 160rpx; align-self:center; }
  .info{ flex:1; display:flex; flex-direction:column; gap: 10rpx; }
  .plate{ font-size: 36rpx; font-weight: 800; color:#222; margin-top: 8rpx; }
  .stats{ display:flex; gap: 24rpx; color:#26B567; font-size: 28rpx;
    .stat{ display:flex; align-items:center; gap: 8rpx; }
    .tiny-ico{ font-size: 28rpx; }
  }
  .stars{ color:#FFA800; font-size: 28rpx; letter-spacing: 4rpx; }
  .price{ color:#FF3B30; font-weight: 700; font-size: 32rpx;
    .yen{ font-size: 28rpx; margin-right: 4rpx; }
    .qi{ color:#999; font-size: 24rpx; margin-left: 6rpx; font-weight:400; }
  }
  .btn-use{
    margin-top: 6rpx;
    height: 76rpx; border-radius: 999rpx;
    background: linear-gradient(180deg, #39D071 0%, #1DBA5B 100%);
    color:#fff; font-size: 30rpx; font-weight: 700;
  }
}

.empty{
  text-align:center; color:#999; font-size: 28rpx; padding: 80rpx 0;
}
</style>
