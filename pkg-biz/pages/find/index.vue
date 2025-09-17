<!-- pages/return/index.vue -->

<template>
  <view class="page">
    <!-- 顶部渐变 320rpx -->
    <view class="hero">
      <!-- 自定义标题栏（透明） -->
      <TitleBar title="还车" background="transparent" />

  <!-- 搜索胶囊（710×96，r48，投影） -->
  <view class="search-pill">
    <view class="pill-ico">
      <image class="ico-search" @click="doSearch" src="/static/icons/search-lv.png" mode="widthFix" />
    </view>
    <input
      class="pill-input"
      type="text"
      placeholder="搜索网点名称"
      confirm-type="search"
      :value="keyword"
      @input="e=>keyword=e.detail.value"
      @confirm="doSearch"
      placeholder-style="color:#BBBBBB"
    />
  </view>
</view>

<!-- 列表 -->
<scroll-view class="list" scroll-y>
  <view
    v-for="(item, idx) in data"
    :key="idx"
    class="card"
  >
    <!-- 左侧车图标（40×40，r12 绿渐变） -->
    <view class="car-badge">
      <image class="car-ico" src="/static/icons/che-bg.png" mode="widthFix" />
    </view>

    <!-- 文字块 -->
	  <view class="content">
    <view class="main">
      <view class="title">
        {{ item.title }}
      </view>

      <view class="row">
        <!-- 距离 -->
        <image class="row-ico" src="/static/icons/juli.png" mode="widthFix" />
        <text class="row-txt light">{{ item.distanceText }}</text>

        <!-- 停车位 -->
        <image class="row-ico mleft" src="/static/icons/parking.png" mode="widthFix" />
        <text class="row-txt green num">{{ item.parking }}</text>

        <!-- 导航 -->
        <image class="row-ico mleft" src="/static/icons/daohang.png" mode="widthFix" />
        <text class="row-txt green nav" @tap="onNav(item)">导航</text>
      </view>
    </view>

    <!-- 选择按钮（96×48，r24，黄渐变） -->
    <view class="choose" @tap="onChoose(item)">
      选择
    </view>
  </view>


</view>
      <!-- 占位底部 -->
      <view style="height: 40rpx" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted  } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TitleBar from '@/components/header/TitleBar.vue'
import { getReturnNetList, validateReturnNet, chooseReturnNet } from '../../api/net.js'
import { safeGetLocation, formatDistance } from '@/utils/location.js'
let ec = null
const keyword = ref('')
const data = ref([])     // ReturnSite[]
const page = ref(0)
const size = ref(20)
const loading = ref(false)
const eof = ref(false)
const userLoc = ref(null)  // {lng, lat} | null


onLoad(() => {
  // 关键：页面生命周期里获取 EventChannel
  try {
    ec = getOpenerEventChannel && getOpenerEventChannel()
  } catch (e) {
    ec = null
  }
})

function mapReturnNetVO(it) {
  return {
    id: it.id,
    title: it.netName,
    distanceText: it.distanceM < 1000 ? `${Math.round(it.distanceM)}m` : `${(it.distanceM/1000).toFixed(1)}km`,
    parking: it.freeSpace,
    lat: it.latitude,
    lng: it.longitude,
  }
}

async function fetchList(reset = false) {
  if (loading.value || (eof.value && !reset)) return
  loading.value = true
  try {
    if (reset) {
      page.value = 0
      eof.value = false
      data.value = []
    }
    if (!userLoc.value) {
      userLoc.value = await safeGetLocation() // 允许 null（无定位模式）
    }

    const res = await getReturnNetList({
      // lng: userLoc.value && userLoc.value.lng,
      // lat: userLoc.value && userLoc.value.lat,
	  
	  lng: 118.629039,
	  lat: 24.911498,
      kw: keyword.value,
      page: page.value,
      size: size.value
    })
    const list = Array.isArray(res) ? res : (res && res.data) || []
    const mapped = list.map(mapReturnNetVO)

    // 无定位时，补个占位符
    mapped.forEach(it => {
      if (!it.distanceText) it.distanceText = userLoc.value ? '' : '—'
    })

    if (mapped.length < size.value) eof.value = true
    data.value = data.value.concat(mapped)
    page.value += 1
  } catch (e) {
    console.warn('加载还车网点失败：', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function doSearch() {
  fetchList(true)
}

// 选择按钮
function onChoose(item) {
  // 组装需要存储的数据
  const data = {
    id: item.id,
    name: item.title,
    latitude: item.lat,
    longitude: item.longitude
  }
  console.debug(data)
  
  // 存到本地
  uni.setStorageSync('returnPoint', data)
  // 返回上一页
  uni.navigateBack()
}


function onNav(item) {
  if (item.lat && item.lng) {
    uni.openLocation({
      latitude: item.lat,
      longitude: item.lng,
      name: item.title,
      scale: 18
    })
  } else {
    uni.navigateTo({
      url: `/pages/common/map?keyword=${encodeURIComponent(item.title)}`
    })
  }
}

function retryLocation() {
  userLoc.value = null
  fetchList(true)
}

onMounted(() => {
  fetchList(true)
})
</script>


<style scoped lang="scss">
.page{
  background:#F7F8F9;
  min-height:100vh;
  display:flex; flex-direction:column;
}

/* 顶部渐变头：750×320 */
.hero{
  width:750rpx; height:220rpx;
  background: linear-gradient(180deg, #5EDC84 0%, #3DCD75 100%);
  position:relative;
  border-radius:8,848rpx;
  padding-top: 20rpx; /* 让 TitleBar 有空间 */
  box-sizing: border-box;
  border-radius: 0 0 48rpx 48rpx;

}

/* 搜索胶囊：710×96，r48，投影 rgba(62,164,93,0.2) */
.search-pill{
  position:absolute; left:20rpx; top:200rpx;
  width:680rpx; height:96rpx;
  background:#FFFFFF;
  border-radius:48rpx;
  box-shadow:0rpx 8rpx 40rpx 0rpx rgba(62,164,93,0.2);
  display:flex; align-items:center;
  padding:0 24rpx; box-sizing:border-box;
}
.pill-ico{
  width:40rpx; height:40rpx;
  border-radius:12rpx;
  display:flex; align-items:center; justify-content:center;
  margin-right:16rpx;
}
.ico-search{ width:41rpx; }

/* 输入框文字风格 */
.pill-input{
  flex:1; height:100%;
  font-size:28rpx; color:#222;
}

/* 列表容器 */
.list{
  flex:1;
  margin-top:60rpx; /* 轻微叠在渐变底下，视觉与稿一致 */
  padding: 40rpx 20rpx 0;
  box-sizing: border-box;
}

/* 列表卡片：710×144，r24 */
.card{
  width:710rpx; min-height:144rpx;
  background:#FFFFFF;
  border-radius:24rpx;
  padding: 24rpx 24rpx;   // 统一内边距
  position:relative;      // 供绝对定位用
  display:flex; align-items:flex-start;
  margin-bottom:20rpx;
  box-sizing:border-box;
}

/* 左侧40×40 图标绿渐变 */
.car-badge{
  width:40rpx; height:40rpx; border-radius:12rpx;
  background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  display:flex; align-items:center; justify-content:center;
  margin-right:24rpx;
}
.car-ico{ width:28rpx; }

/* 右侧内容：左右结构 */
.content{
  flex:1;
  display:flex;
  flex-direction:row;
  align-items:flex-start;
  gap:20rpx;
  padding-right: 20rpx;   /* 关键：给右边按钮留出位置 */
  box-sizing: border-box;
}

/* 中间文本块 */
.main{   
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
  }
.title{
  display:block;          /* 关键：不要用 inline-text */
  font-size:30rpx;
  line-height:40rpx;
  color:#222;
  text-align:left;        /* 左对齐 */
  white-space:normal;     /* 正常换行 */
  word-break:break-word;  /* 保证中文、英文、长数字换行 */
  overflow:visible;       /* 禁止省略 */
}

/* 行：图标与文字 */
.row{ margin-top: 16rpx; display:flex; align-items:center; }
.row-ico{ width:32rpx; height:32rpx; }
.mleft{ margin-left: 48rpx; }
.row-txt{
  margin-left: 8rpx;
  font-size:28rpx; line-height:40rpx;
  letter-spacing: 1rpx;
}
.light{ color:#AAAAAA; }
.green{ color:#0BB936; }
.num{ font-size:32rpx; line-height:26rpx; }
.nav{ padding: 4rpx 0; }

/* 右侧 选择按钮：96×48，r24，黄渐变 */
.choose{
  flex-shrink:0;
  width:96rpx; height:48rpx;
  border-radius:24rpx;
  background:linear-gradient(180deg,#FDD41F 0%, #FFC868 100%);
  display:flex; align-items:center; justify-content:center;
  font-size:28rpx; color:#222;
}
</style>
