<template>
  <view class="page">
    <!-- 顶部渐变头 -->
    <view class="hero">
      <TitleBar title="找车" background="transparent" />

      <!-- 搜索框 -->
      <view class="search-wrap">
        <image class="icon-dingwei" src="/static/icons/dingwei.png" mode="widthFix" />
        <input
          class="search-input"
          v-model="keyword"
          placeholder="坪山加油站"
          placeholder-class="ph"
          confirm-type="search"
          @focus="enterSearchMode"
          @confirm="onSearch"
        />
        <!-- 搜索网点模式提示：继续搜索 -->
        <text v-if="searchMode" class="continue">继续搜索</text>
      </view>
    </view>

    <!-- 筛选（搜索网点模式下不展示） -->
    <view v-if="!searchMode" class="filters">
      <view class="filter-item" @tap="toggleSort('model')">
        <text class="t">车型</text>
        <image
          class="arrow"
          :class="arrowClass('model')"
          src="/static/icons/arrow-drop-down-fill.png"
        />
      </view>
      <view class="filter-item" @tap="toggleSort('range')">
        <text class="t">续航</text>
        <image
          class="arrow"
          :class="arrowClass('range')"
          src="/static/icons/arrow-drop-down-fill.png"
        />
      </view>
      <view class="filter-item" @tap="toggleSort('rate')">
        <text class="t">评分</text>
        <image
          class="arrow"
          :class="arrowClass('rate')"
          src="/static/icons/arrow-drop-down-fill.png"
        />
      </view>
    </view>

    <!-- 小黄条 -->
    <text class="near-tag">离你最近的网点</text>

    <!-- ====== 网点区域 ====== -->
    <!-- 搜索网点模式：展示“网点列表”（从后端获取） -->
    <view v-if="searchMode" class="net-list">
      <view
        v-for="(n, i) in nets"
        :key="n.id || i"
        class="site-head"
      >
        <image class="site-ic" src="/static/icons/che-bg.png" />
        <text class="site-name">{{ n.name }}</text>

        <!-- 展开/收起按钮：处于搜索模式且当前是“展开” -> 退出搜索模式 -->
        <view class="fold-btn" @tap="toggleFold">
          <text class="fold-txt">{{ folded ? '展开' : '收起' }}</text>
          <image
            class="fold-ic"
            src="/static/icons/arrow-drop-down-fill.png"
            :class="{ up: !folded }"
            mode="widthFix"
          />
        </view>

        <!-- 次行：距离/车辆数/导航 -->
        <view class="site-sub">
          <view class="sub-item">
            <image class="i32 " src="/static/icons/juli.png" />
            <text class="sub-t gray">{{ formatDistance(n.distance) }}</text>
          </view>
          <view class="sub-item">
            <image class="i32" src="/static/icons/cheliang.png" />
            <text class="sub-t green">{{ n.carCount ?? n.cars ?? '-' }}</text>
          </view>
          <view class="sub-item" @tap="navTo(n)">
            <image class="i32" src="/static/icons/daohang.png" />
            <text class="sub-t green">导航</text>
          </view>
        </view>
      </view>

      <!-- 空态 -->
      <view v-if="!loading && nets.length === 0" class="empty">
        暂无相关网点
      </view>
    </view>

    <!-- 普通模式：当前网点抬头 + 车辆列表 -->
    <template v-else>
      <!-- 单个示例网点抬头（如需可替换为最近网点信息） -->
      <view class="site-head">
        <image class="site-ic" src="/static/icons/che-bg.png" />
        <text class="site-name">丰泽区 | 坪山加油站（勿停充电桩）</text>

        <view class="fold-btn" @tap="toggleFold">
          <text class="fold-txt">{{ folded ? '展开' : '收起' }}</text>
          <image
            class="fold-ic"
            src="/static/icons/arrow-drop-down-fill.png"
            :class="{ up: !folded }"
            mode="widthFix"
          />
        </view>

        <view class="site-sub">
          <view class="sub-item">
            <image class="i32 " src="/static/icons/juli.png" />
            <text class="sub-t gray">50m</text>
          </view>
          <view class="sub-item">
            <image class="i32" src="/static/icons/cheliang.png" />
            <text class="sub-t green">10</text>
          </view>
          <view class="sub-item">
            <image class="i32" src="/static/icons/daohang.png" />
            <text class="sub-t green">导航</text>
          </view>
        </view>
      </view>

      <!-- 车辆列表：由 folded 控制 -->
      <view v-show="!folded" class="car-list">
        <view v-for="(c,idx) in sortedCars" :key="idx" class="car-card">
          <view class="model-tag">{{ c.modelTag }}</view>
          <image class="car-pic" :src="c.img" mode="aspectFit" />

          <view class="info">
            <view class="plate">
              <text class="plate-province">闽</text>
              <text class="plate-dot">C·</text>
              <text class="plate-num">D{{ 12345 + idx }}</text>
            </view>

            <view class="row">
              <image class="i32" src="/static/icons/battery.png" />
              <text class="ok">{{ c.power }}%</text>

              <image class="i32 m24" src="/static/icons/licheng.png" />
              <text class="ok">{{ c.range }}km</text>
            </view>

            <view class="row stars">
              <image
                v-for="n in 5"
                :key="n"
                class="star"
                :src="n <= Math.round(c.rate) ? '/static/icons/star-s-fill.png' : '/static/icons/star-s.png'"
              />
            </view>

            <view class="row price">
              <text class="yuan">¥</text>
              <text class="num">{{ c.price }}</text>
              <text class="qi">起</text>
            </view>

            <button class="btn" @tap="useNow(c)">立即用车</button>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import { getReturnNetList } from '../../api/net' // ← 你的接口文件导出这个函数

/** 搜索关键词与模式 */
const keyword = ref('坪山加油站')
const searchMode = ref(false)          // 搜索网点模式
const folded = ref(false)              // 网点卡片折叠
const loading = ref(false)

/** 排序状态：model / range / rate 三选一，方向 asc / desc */
type Key = 'model' | 'range' | 'rate'
const sortKey = ref<Key | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

/** 车辆演示数据（含续航/评分/电量） */
const cars = ref([
  { modelTag: '北汽EC200', img: '/static/car1.png', price: 8,  range: 150, rate: 4.8, power: 100 },
  { modelTag: '北汽EC200', img: '/static/car1.png', price: 10, range: 150, rate: 4.5, power: 100 },
  { modelTag: '北汽EC200', img: '/static/car1.png', price: 15, range: 120, rate: 4.2, power: 92  },
  { modelTag: '奇瑞小蚂蚁', img: '/static/car1.png', price: 9,  range: 170, rate: 4.9, power: 98  },
  { modelTag: '零跑T03',  img: '/static/car1.png', price: 12, range: 200, rate: 4.6, power: 96  },
])

/** ===== 网点数据（来自后端） ===== */
const nets = ref<any[]>([])

/** 进入搜索网点模式：隐藏车辆，仅显示网点卡片；按钮变“展开” */
const enterSearchMode = () => {
  searchMode.value = true
  folded.value = true
}

/** 触发搜索：从后端拉网点列表 */
const onSearch = async () => {
  searchMode.value = true
  folded.value = true
  await fetchNets()
}

/** 拉网点 */
const fetchNets = async (page = 0, size = 20) => {
  loading.value = true
  try {
    // 尝试拿定位
    let lng: number | undefined
    let lat: number | undefined
    try {
      // const loc = await uni.getLocation({ type: 'gcj02' })
      // lng = loc.longitude
      // lat = loc.latitude
    } catch (e) {
      // 定位失败不阻断，仅用关键词
    }

   //  const params: any = { kw: keyword.value, page, size }
   //  if (lng !== undefined && lat !== undefined) {
   //    // params.lng = lng
   //    // params.lat = lat
	  // params.lng = 118.629039
	  // params.lat = 24.911498
	  
   //  }
	const keyword = ref('')
	const page = ref(0)
	const size = ref(20)
   const res = await getReturnNetList({
     // lng: userLoc.value && userLoc.value.lng,
     // lat: userLoc.value && userLoc.value.lat,
     
     lng: 118.629039,
     lat: 24.911498,
     kw: keyword.value,
     page: page.value,
     size: size.value
   })
    // 兼容不同返回结构：
    const list = Array.isArray(res?.data) ? res.data
               : Array.isArray(res?.records) ? res.records
               : Array.isArray(res?.list) ? res.list
               : []
    // 映射字段
    nets.value = list.map((it: any) => ({
      id: it.id,
      name: it.name || it.netName || it.title || '未命名网点',
      distance: it.distance || it.dist || it.meters,     // m
      carCount: it.carCount ?? it.cars ?? it.car_num,
      lat: it.lat || it.latitude,
      lng: it.lng || it.longitude,
    }))
  } catch (err:any) {
    uni.showToast({ title: err?.message || '获取网点失败', icon: 'none' })
    nets.value = []
  } finally {
    loading.value = false
  }
}

/** 点击折叠按钮：
 * - 普通模式：仅切换收起/展开
 * - 搜索网点模式：若当前是“展开”，则退出搜索模式并展开车辆列表
 */
const toggleFold = () => {
  if (searchMode.value && folded.value) {
    searchMode.value = false
    folded.value = false
    return
  }
  folded.value = !folded.value
}

/** 车辆立即用车 */
const useNow = (c:any) => {
  uni.showToast({ title: `使用 ${c.modelTag}`, icon: 'none' })
}

/** 切换排序键与方向（仅两档：升序/降序） */
const toggleSort = (key: Key) => {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortDir.value = 'asc'
  } else {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  }
}

/** 箭头方向 + 选中着色：asc=朝上，desc=朝下，未选中=半透明 */
const arrowClass = (key: Key) => {
  if (sortKey.value !== key) return 'mute'
  return sortDir.value === 'asc' ? 'sel up' : 'sel down'
}

/** 排序后的车辆列表 */
const sortedCars = computed(() => {
  const list = [...cars.value]
  if (!sortKey.value) return list
  const dir = sortDir.value === 'asc' ? 1 : -1
  if (sortKey.value === 'model') {
    return list.sort((a,b) => a.modelTag.localeCompare(b.modelTag, 'zh') * dir)
  }
  if (sortKey.value === 'range') {
    return list.sort((a,b) => (a.range - b.range) * dir)
  }
  // rate
  return list.sort((a,b) => (a.rate - b.rate) * dir)
})

/** 导航（示例：唤起系统地图） */
const navTo = (n:any) => {
  if (!n?.lat || !n?.lng) {
    uni.showToast({ title: '缺少坐标', icon: 'none' })
    return
  }
  uni.openLocation({
    latitude: Number(n.lat),
    longitude: Number(n.lng),
    name: n.name || '网点',
    address: n.name || '网点'
  })
}

/** 距离显示：米/公里 */
const formatDistance = (d:any) => {
  const v = Number(d)
  if (!v || isNaN(v)) return '-'
  if (v < 1000) return `${Math.round(v)}m`
  return `${(v/1000).toFixed(1)}km`
}
</script>

<style lang="scss" scoped>
/* ===== 字体（用你自己的文件替换路径） ===== */
@font-face { font-family: 'AlibabaPuHuiTi'; src: url('/static/fonts/AlibabaPuHuiTi-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'AlibabaPuHuiTi'; src: url('/static/fonts/AlibabaPuHuiTi-Medium.ttf') format('truetype');  font-weight: 500; font-style: normal; }
@font-face { font-family: 'D-DIN'; src: url('/static/fonts/D-DIN-Bold.otf') format('opentype'); font-weight: 700; font-style: normal; }
@font-face { font-family: 'D-DIN'; src: url('/static/fonts/D-DIN-Regular.otf') format('opentype'); font-weight: 400; font-style: normal; }

/* ===== 页面骨架 ===== */
.page{ background:#F7F8F9; min-height:100vh; display:flex; flex-direction:column; }

/* 顶部渐变头 */
.hero{
  width:750rpx; height:220rpx;
  background: linear-gradient(180deg, #5EDC84 0%, #3DCD75 100%);
  position:relative; padding-top: 20rpx; box-sizing: border-box;
  border-radius: 0 0 48rpx 48rpx;
}

/* 搜索框 */
.search-wrap{
  position: absolute; left: 20rpx; top: 204rpx;
  width: 680rpx; height: 96rpx; background: #FFFFFF;
  box-shadow: 0rpx 8rpx 40rpx 0rpx rgba(62,164,93,0.2);
  border-radius: 48rpx; display: flex; align-items: center;
}
.icon-dingwei{ width: 48rpx; height: 48rpx; margin-left: 52rpx; }
.search-input{
  margin-left: 20rpx; margin-right: 24rpx;
  flex: 1; height: 44rpx; line-height: 44rpx; font-size: 32rpx; color: #222;
}
.ph{ font-size: 32rpx; color: #888888; line-height: 44rpx; }

/* 搜索网点模式提示文案 */
.continue{ margin-right: 32rpx; font-size: 26rpx; color: #16C25D; }

/* 筛选条 */
.filters{
  margin-top: 134rpx; padding: 0 52rpx;
  display: flex; justify-content: space-between;
}
.filter-item{ display: flex; align-items: center; }
.filter-item .t{ width: 64rpx; height: 32rpx; font-weight: 500; font-size: 32rpx; color: #222; line-height: 32rpx; text-align: center; }
.arrow{
  width: 32rpx; height: 32rpx; margin-left: 10rpx;
  transition: transform .15s ease, opacity .15s ease, filter .15s ease;
  opacity: 1; transform: rotate(180deg); /* 默认朝下 */
  filter: grayscale(1) opacity(.45);      /* 默认半透明灰 */
}
.arrow.mute{ transform: rotate(180deg); filter: grayscale(1) opacity(.45); }
.arrow.sel{ filter: none; }               /* 选中着色（走原图色），下方再配旋转方向 */
.arrow.sel.up{ transform: rotate(0deg); } /* 升序：朝上 + 高亮 */
.arrow.sel.down{ transform: rotate(180deg);}/* 降序：朝下 + 高亮 */

/* 小黄条提示 */
.near-tag{
  width: 216rpx; height: 60rpx; margin-left: 46rpx; margin-top: 30rpx; display: inline-block;
  font-weight: 400; font-size: 28rpx; line-height: 38rpx; color: #FF9C08; background: #FFF7EF;
}

/* ====== 网点列表 & 卡片 ====== */
.net-list{ padding: 10rpx 20rpx 20rpx; }
.empty{ text-align: center; color: #999; padding: 80rpx 0; }

.site-head{
  margin: 10rpx 0 20rpx; padding: 24rpx; background: #fff;
  border-radius: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04); position: relative;
}
.site-ic{ width: 40rpx; height: 40rpx; border-radius: 12rpx; background: #82ED71; }
.site-name{
  position: absolute; left: 100rpx; top: 24rpx; right: 120rpx;
  height: 40rpx; font-weight: 500; font-size: 30rpx; color: #222; line-height: 40rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* 右上角按钮：展开/收起 */
.fold-btn{
  position: absolute; right: 12rpx; top: 70rpx;
  min-width: 86rpx; height: 48rpx; padding: 0 18rpx; border-radius: 24rpx;
  background: linear-gradient(270deg, #FDD41F 0%, #FFC868 100%);
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,.08);
  display: flex; align-items: center; justify-content: center;
}
.fold-txt{ font-weight: 400; font-size: 28rpx; line-height: 32rpx; color: #222222; }
.fold-ic{ width: 24rpx; height: 24rpx; margin-left: 6rpx; transform: rotate(180deg); transition: transform .15s ease; }
.fold-ic.up{ transform: rotate(0deg); }

/* 次行信息 */
.site-sub{
  margin-top: 42rpx; padding-left: 56rpx;
  display: flex; align-items: center; column-gap: 32rpx;
}
.sub-item{ display: flex; align-items: center; }
.i32{ width: 32rpx; height: 32rpx; }
.sub-t{ font-size: 28rpx; line-height: 26rpx; margin-left: 8rpx; }
.gray{ color: #AAAAAA; } .green{ color: #16C25D; }

/* ===== 车辆卡片 ===== */
.car-list{ padding: 20rpx; }
.car-card{
  position: relative; width: 710rpx; min-height: 350rpx; margin: 20rpx auto;
  background: linear-gradient(360deg, #F5F5F5 0%, rgba(245,245,245,0) 100%);
  border-radius: 24rpx; border: 2rpx solid #EEEEEE; padding: 0 0 24rpx 0;
}
.model-tag{
  position: absolute; left: 56rpx; top: 30rpx;
  width: 180rpx; height: 41rpx; font-size: 26rpx; color: #2DBC52; line-height: 32rpx; text-align: center; font-weight: 400;
  background: #fff; border-radius: 22rpx; padding: 4rpx 12rpx;
}
.car-pic{ position: absolute; left: 88rpx; top: 110rpx; width: 238rpx; height: 158rpx; }
.info{ position: absolute; left: 370rpx; top: 40rpx; right: 24rpx; }

/* 车牌 */
.plate{ height: 50rpx; display: flex; align-items: baseline; }
.plate-province{ width: 36rpx; height: 44rpx; font-weight: 500; font-size: 36rpx; color: #222; line-height: 50rpx; }
.plate-dot{ font-family: 'D-DIN'; font-weight: 700; font-size: 40rpx; color: #222; line-height: 50rpx; letter-spacing: 12%; margin-left: 6rpx; }
.plate-num{ font-family: 'D-DIN'; font-weight: 700; font-size: 40rpx; color: #222; line-height: 50rpx; letter-spacing: 5%; }

/* 通用行 */
.row{ margin-top: 18rpx; display: flex; align-items: center; }
.m24{ margin-left: 24rpx; }
.ok{ font-size: 30rpx; color: #56CA74; line-height: 42rpx; margin-left: 8rpx; }

/* 星级 */
.stars .star{ width: 28rpx; height: 28rpx; margin-right: 10rpx; }

/* 价格 */
.price{ margin-top: 16rpx; }
.yuan{ font-family: 'D-DIN'; font-weight: 700; color: #FD0300; font-size: 28rpx; line-height: 48rpx; }
.num{ font-family: 'D-DIN'; font-weight: 700; color: #FD0300; font-size: 48rpx; line-height: 48rpx; margin: 0 6rpx; }
.qi{ font-weight: 400; color: #AAAAAA; font-size: 26rpx; line-height: 48rpx; }

/* 按钮 */
.btn{
  margin-top: 22rpx; width: 280rpx; height: 72rpx; line-height: 72rpx;
  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%); border-radius: 48rpx; color: #fff; font-size: 32rpx;
  text-align: center; padding: 0;
}
.btn::after{ border: none; }
</style>
