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
		  @focus="enterSearchMode"
          @input="onInput"
          @confirm="doSearch"
        />
      </view>

     <!-- 筛选条 -->
     <view class="filters">
       <view class="filter-item"
             :class="{ active: currentSortBy==='type' }"
             @tap="openFilter('type')">
         <text>车型</text>
         <image class="down" :class="{ up: currentSortBy==='type' && currentOrder==='asc' }"
                src="/static/icons/arrow-drop-down-fill.png" mode="widthFix" />
       </view>
     
       <view class="filter-item"
             :class="{ active: currentSortBy==='range' }"
             @tap="openFilter('range')">
         <text>续航</text>
         <image class="down" :class="{ up: currentSortBy==='range' && currentOrder==='asc' }"
                src="/static/icons/arrow-drop-down-fill.png" mode="widthFix" />
       </view>
     
       <view class="filter-item"
             :class="{ active: currentSortBy==='score' }"
             @tap="openFilter('score')">
         <text>评分</text>
         <image class="down" :class="{ up: currentSortBy==='score' && currentOrder==='asc' }"
                src="/static/icons/arrow-drop-down-fill.png" mode="widthFix" />
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
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TitleBar from '@/components/header/TitleBar.vue'
import { getNetList  } from '../../api/net'
import { getCarList  } from '../../api/car'

const keyword = ref('')
const allNets = ref([])
// 选车页面的相关变量
const carModels = ref([]) // 存储适用的车型
const nets = ref([])
const locating = ref(false)
const page = ref(0)
const size = ref(20)
const currentSortBy = ref('score')   // 'type' | 'range' | 'score'
const currentOrder  = ref('desc')    // 'asc' | 'desc'

function collapseAll(list = nets.value) {
  (list || []).forEach(n => { n.expanded = false })
}
function expandFirstIfAny(list = nets.value) {
  if (list && list.length) {
    list[0].expanded = true
    if (!list[0].cars?.length) loadCars(list[0])
  }
}
//进入搜索时先折叠
function enterSearchMode() {
  collapseAll()
}

/* 输入与搜索 */
function onInput(e){ keyword.value = e.detail.value; }
function doSearch() {
  const k = (keyword.value || '').trim();
  nets.value = !k ? [...allNets.value] :
    allNets.value.filter(n => 
      (n.netName || '').includes(k) || 
      (n.areaName || '').includes(k)
    );
  
  // 每次筛选后折叠
  collapseAll(nets.value);
}

/* 从接口返回里提取数组 */
function pickArray(payload){
  if (Array.isArray(payload)) return payload
  if (!payload) return []
  if (Array.isArray(payload.data)) return payload.data
  if (payload.data && Array.isArray(payload.data.list)) return payload.data.list
  if (payload.data && Array.isArray(payload.data.records)) return payload.data.records
  if (payload.data && Array.isArray(payload.data.content)) return payload.data.content
  if (Array.isArray(payload.list)) return payload.list
  if (Array.isArray(payload.records)) return payload.records
  if (Array.isArray(payload.content)) return payload.content
  return []
}

/* 规范化网点 */
function normalizeNets(list) {
  return (list || []).map(x => {
    const raw = x.netName || ''
    const hasSep = raw.includes('｜')
    const areaFromName = hasSep ? raw.split('｜')[0] : ''
    const nameOnly     = hasSep ? raw.split('｜')[1] : (x.netAddr || raw)
    return {
      id: x.id,
      areaName: areaFromName || x.city || '',
      netName: nameOnly || '',
      lat: x.latitude,
      lng: x.longitude,
      // 车数量展示优先后端字段；不要根据前端筛出来的车辆数改掉它
      carCount: Number(x.freeSpace) || Number(x.carCount) || 0,
      distance: x.distanceM ?? null,
      expanded: false,
      cars: []  // 一律延迟加载
    }
  })
}

/* 定位（失败也返回空） */
function getLocationOnce() {
  return new Promise(resolve => {
    locating.value = true
    uni.getLocation({
      type: 'gcj02',
      success: pos => resolve({ lat: pos.latitude, lng: pos.longitude }),
      fail: () => {
        // 定位失败，给个默认值（泉州丰泽区）
        resolve({ lat: 24.911498, lng: 118.629039 })
      },
      complete: () => (locating.value = false)
    })
  })
}

// 加载车辆（真实接口 + 排序）
async function loadCars(np, sortBy = 'score', order = 'desc') {
  try {
    const res = await getCarList({ netId: np.id, sortBy, order });
    const payload = res && res.data !== undefined ? res.data : res;
    const arr = pickArray(payload);
    const needFilter = carModels.value && carModels.value.length > 0
      np.cars = (arr || []).map(x => ({
        id: x.id,
        model: x.model,
        image: x.image || '/static/car1.png',
        plate: x.plate,
        power: x.power ?? 0,
        range: x.range ?? 0,
        score: x.score ?? 5,
        priceStart: x.priceStart ?? 0
      }))
      if (needFilter) np.cars = np.cars.filter(car => isCarModelValid(car.model))
  } catch (e) {
    console.error('loadCars error:', e);
    np.cars = [];
  }
}

/* 展开/收起网点 */
function toggleNet(np){
  np.expanded = !np.expanded
  if (np.expanded && (!np.cars || np.cars.length === 0)) loadCars(np)
}

/* 导航 */
function goNav(np){
  if (np.lat != null && np.lng != null){
    uni.openLocation({ latitude: Number(np.lat), longitude: Number(np.lng), name: np.netName, address: (np.areaName || '') + np.netName })
  } else {
    uni.showToast({ title:'暂无坐标', icon:'none' })
  }
}

/* 立即用车跳转 */
function useNow(car, np){
  uni.navigateTo({ url: `/pkg-order/pages/confirm-order/index?carId=${encodeURIComponent(car.id)}&netId=${encodeURIComponent(np.id)}` })
}

/* 筛选占位 */
async function openFilter(type){
  // 只允许这几个key
  const allow = ['type','range','score']
  if (!allow.includes(type)) return

  if (currentSortBy.value === type) {
    // 同一字段 → 切换升降序
    currentOrder.value = (currentOrder.value === 'desc' ? 'asc' : 'desc')
  } else {
    // 切换字段 → 重置为 desc
    currentSortBy.value = type
    currentOrder.value = 'desc'
  }

  // 只对“当前展开的网点”刷新车辆列表；未展开的省流量
  const expanded = nets.value.filter(n => n.expanded)
  await Promise.all(
    expanded.map(n => loadCars(n, currentSortBy.value, currentOrder.value))
  )

  // 友好提示（可保留/可删）
  uni.showToast({
    title: `已按${ type==='type'?'车型': type==='range'?'续航':'评分' }${ currentOrder.value==='desc'?'↓':'↑' }排序`,
    icon: 'none'
  })
}

/* 工具 */
function formatDistance(m){
    if (m === null || m === undefined) return '--'
    if (m < 1000) return `${Math.round(m)}m`
    return `${(m / 1000).toFixed(1)}km`
}

/* 使用 /net/return/list 加载网点 */
async function loadNets() {
  try {
    const { lat, lng } = await getLocationOnce();
    const params = { lat, lng, kw: (keyword.value || '').trim(), page: page.value, size: size.value };
    const res = await getNetList(params);
    const payload = res && res.data !== undefined ? res.data : res;
    const arr = pickArray(payload);
    const norm = normalizeNets(arr); // 使用车型筛选后的网点数据
    allNets.value = norm.length ? norm : mockNets();
  } catch (e) {
    allNets.value = mockNets();
  } finally {
    nets.value = [...allNets.value];
    if (nets.value[0]) {
      nets.value[0].expanded = true; // 展开第一个网点
      if (!nets.value[0].cars?.length) loadCars(nets.value[0]);
    }
  }
}

/* Mock */
function mockNets(){
  return [
    { id:1, areaName:'丰泽区', netName:'坪山加油站（勿停充电桩）', lat:24.9, lng:118.6, carCount:10, distance:50, expanded:true, cars: mockCars(1) },
    { id:2, areaName:'丰泽区', netName:'万达广场', lat:24.92, lng:118.59, carCount:6, distance:180, expanded:false, cars:[] },
    { id:3, areaName:'洛江区', netName:'仰恩大学北门', lat:24.96, lng:118.62, carCount:3, distance:420, expanded:false, cars:[] }
  ]
}
function mockCars(netId){
  return [
    // { id: `${netId}-a`, model:'北汽EC200', image:'/static/car1.png', plate:'闽C·D12345', power:100, range:150, score:5, priceStart:8 },
    // { id: `${netId}-b`, model:'北汽EC200', image:'/static/car1.png', plate:'闽C·D67890', power:100, range:150, score:5, priceStart:10 },
    // { id: `${netId}-c`, model:'北汽EC200', image:'/static/car1.png', plate:'闽C·D22222', power:100, range:150, score:4, priceStart:15 }
  ]
}

function isCarModelValid(carModel) {
    // 没有传任何车型（或空串）时，不做过滤
    if (!carModels.value || carModels.value.length === 0) return true
    // 有筛选才判断
    return carModels.value.includes(carModel)
}

onLoad((options) => {
  const raw = options?.carModels
  if (raw && typeof raw === 'string') {
    const arr = raw.split(',').map(s => s.trim()).filter(Boolean)
    carModels.value = arr.length ? arr : []   // 空则视为无筛选
  } else {
    carModels.value = []
  }
  loadNets()
})
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
  height: 220rpx;
  background: linear-gradient( 180deg, #5EDC84 0%, #3DCD75 100%);
  // background: url('/static/icons/bottom.png')
   // no-repeat center bottom;
  background-size: cover; /* 根据需求调整 */
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
}

/* 搜索胶囊 */
.search-wrap{
  width: 680rpx;
  margin: 70rpx auto 12rpx;
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
  margin-top:20rpx;
  display: flex; align-items: center; justify-content: space-between;

  .filter-item{
    display:flex; align-items:center; gap:8rpx;
    font-family: AlibabaPuHuiTi, sans-serif;
    font-weight: 500;
    font-size: 32rpx;
    color: #666;                 /* 默认灰色 */
    line-height: 32rpx;
    padding: 8rpx 6rpx;
    border-radius: 12rpx;

    &.active{
      color:#26B567;             /* 选中高亮 */
      background: #EFFFF3;       /* 轻底色，可按需去掉 */
    }
  }

  .down{
    width: 28rpx; height: 28rpx;
    transition: transform .18s ease;
    opacity:.7;
  }
  /* 升序时向上（旋转180°），降序保持向下 */
  .down.up{ transform: rotate(180deg); }
}


/* 列表 */
.list{
  flex: 1;
  height: calc(100vh - 320rpx);
  padding: 7rpx 20rpx 0;
  margin: 140rpx auto 12rpx;
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
  padding: 7rpx 26rpx; border-radius: 12rpx; font-size: 24rpx; color: #FF9C08; margin-bottom: 28rpx;
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
	padding-left: 12rpx;
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
