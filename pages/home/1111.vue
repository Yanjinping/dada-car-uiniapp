<template>
  <scroll-view scroll-y class="home-wrap">
    <view class="home">

      <!-- 背景 -->
      <image class="bg-home" src="/static/home/bg-home.png" mode="widthFix" />

      <!-- 顶部安全区 & 标题 -->
      <view class="status-bar" />
      <view class="title-wrap">
        <text class="title-text">首页</text>
      </view>

      <!-- 搜索胶囊 -->
      <view class="search-capsule">
        <view class="loc-wrap" @click="pickCity && pickCity()">
          <text class="loc-txt green">{{ locationName || '定位中…' }}</text>
          <view class="loc-split"></view>
          <text class="loc-txt green">坪山加油站</text>
          <view class="loc-arrow"></view>
        </view>
        <view class="search-body" @click="goSearch">
          <text class="search-ph">搜索网点名称、车型</text>
        </view>
        <image class="search-ico" src="/static/home/search-lv.png" mode="widthFix" />
      </view>

      <!-- 欢迎横幅：强制水平居中 -->
      <image class="hero-banner" src="/static/home/huanying.png" mode="widthFix" />

      <!-- 学生认证（独立卡片：上圆角 / 下直角） -->
      <view v-if="!isCertified" class="stu-banner" @click="goCertification">
        <image class="hb-ico" src="/static/home/hongbao.png" mode="widthFix" />
        <text class="stu-txt">大学生认证立减20元</text>
        <image class="cb-arrow" src="/static/home/arrow-right.png" mode="widthFix" />
      </view>

      <!-- 推荐用车（四角圆角，向上顶入认证卡片一丢丢） -->
      <view class="reco-card">
        <!-- 标题 + 小车图标水平居中 -->
        <view class="reco-hd">
          <view class="reco-title-line">
            <image class="reco-car-ico" src="/static/home/car.png" mode="widthFix" />
            <text class="reco-title">推荐用车</text>
          </view>
          <!-- 标题正下方的“最佳推荐”胶囊（图） -->
          <image class="best-pill" src="/static/home/zuijia.png" mode="widthFix" />
        </view>

        <!-- 车图（有数据用接口图；无数据回退本地图） -->
        <image
          class="che-pic"
          :src="(recommendedCars && recommendedCars[0]?.carImage) ? formatImage(recommendedCars[0].carImage) : '/static/home/che-pic.png'"
          mode="widthFix"
        />

        <!-- 车牌 + 价格（蓝湖1:1） -->
        <view class="plate-price">
          <text class="plate-num">
            <text class="plate-prov">{{ ((recommendedCars[0]?.carNum) || '闽C·D12345').slice(0,1) }}</text>
            <text class="plate-mid">{{ ((recommendedCars[0]?.carNum) || '闽C·D12345').slice(1,3) }}</text>
            <text class="plate-id">{{ ((recommendedCars[0]?.carNum) || '闽C·D12345').slice(3) }}</text>
          </text>
          <view class="price-box">
            <text class="price-n">{{ (recommendedCars[0]?.price ?? 8.0) }}</text>
            <text class="price-u">¥</text>
          </view>
          <text class="price-qi">起</text>
        </view>

        <!-- 指标：图标与数字更贴近 -->
        <view class="spec-line">
          <image class="sp-ico" src="/static/home/battery.png" />
          <text class="sp-txt green-56">{{ (recommendedCars[0]?.restEnergy ?? 80) + '%' }}</text>

          <image class="sp-ico" src="/static/home/licheng.png" />
          <text class="sp-txt green-56">{{ (recommendedCars[0]?.distanceKm ?? 300) + 'km' }}</text>

          <image class="sp-ico" src="/static/home/walk.png" />
          <text class="sp-txt green-56">{{ (recommendedCars[0]?.etaMin ?? 30) + 'm' }}</text>
          <text class="sp-sub gray-cc">（约1min）</text>
        </view>

        <!-- CTA -->
        <button class="big-btn" @click="recommendedCars[0] && onUseCar(recommendedCars[0])">立即用车</button>

        <!-- 芝麻信用分（居中） -->
        <view class="zhima-row">
          <image class="zhima-ico" src="/static/home/zhima.png" />
          <text class="zhima-txt">芝麻信用分｜650分以上有机会免押租车</text>
        </view>
      </view>

      <!-- 宫格（两行可见） -->
      <view class="grid-section">
        <view class="grid">
          <view class="grid-item"><image class="gi-ico" src="/static/home/icon-1.png" /><text class="gi-text">快速找车</text></view>
          <view class="grid-item"><image class="gi-ico" src="/static/home/icon-2.png" /><text class="gi-text">领优惠券</text></view>
          <view class="grid-item"><image class="gi-ico" src="/static/home/icon-3.png" /><text class="gi-text">学生认证</text></view>
          <view class="grid-item"><image class="gi-ico" src="/static/home/icon-4.png" /><text class="gi-text">推广奖励</text></view>
          <view class="grid-item"><image class="gi-ico" src="/static/home/icon-5.png" /><text class="gi-text">我的积分</text></view>
          <view class="grid-item"><image class="gi-ico" src="/static/home/icon-6.png" /><text class="gi-text">二手车买卖</text></view>
        </view>
      </view>

      <!-- 常用网点（保持你之前的数据） -->
      <view class="sites-card">
        <view class="sites-hd">
          <image class="shu" src="/static/home/shu.png" />
          <text class="sites-title">常用网点</text>
        </view>

        <view class="sites-row" v-for="loc in frequentLocations" :key="loc.id" @click="onNetPointClick(loc.id)">
          <image class="map-ico" src="/static/home/map.png" />
          <text class="site-name one-line">{{ loc.name }}</text>
        </view>
        <view v-if="!frequentLocations.length">
          <view class="sites-row">
            <image class="map-ico" src="/static/home/map.png" />
            <text class="site-name one-line">丰泽区｜坪山加油站（勿停充电桩）</text>
          </view>
          <view class="sites-row grad">
            <image class="map-ico" src="/static/home/map.png" />
            <text class="site-name one-line">鲤城区｜幸福广场｜专属车位（勿停收费车…）</text>
          </view>
          <view class="sites-row grad">
            <image class="map-ico" src="/static/home/map.png" />
            <text class="site-name one-line">晋江市｜溜溪花园（停车勿超过石墩勿停收…）</text>
          </view>
        </view>
      </view>

      <!-- 最近订单（可选） -->
      <view class="order-card" v-if="recentOrder.time && recentOrder.carName">
        <view class="order-hd">
          <view class="green-stick"></view>
          <text class="order-title">最近订单</text>
        </view>
        <view class="order-row">
          <image class="time-ico" src="/static/home/time.png" />
          <view class="order-texts">
            <text class="order-line one-line">{{ recentOrder.carName }}</text>
            <text class="order-time one-line">{{ recentOrder.time }}</text>
          </view>
          <button class="order-btn" @click="repeatOrder">一键用车</button>
        </view>
      </view>

      <!-- CTA -->
      <image class="cta-img" src="/static/home/广告区.png" mode="widthFix" />
      <text class="kefu">客服电话：400-123-1234（8:30~22:00）</text>

    </view>
  </scroll-view>
</template>




<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getHomePage, getRecommendedCars } from '@/api/home'

// 变量定义（保留你的逻辑）
const locationName = ref('定位中...')
const isCertified = ref(false)
const user = reactive({ avatar: '/static/avatar.png' })
const recommendedCars = reactive([])
const frequentLocations = reactive([])
const recentOrder = reactive({ time: '', carName: '' })
const loadingCars = ref(false)

const selectedCar = ref(null)
const scrollLeft = ref(0)
const scrollWidth = ref(0)
const index = ref(0)

const onScroll = (e) => {
  scrollLeft.value = e.detail.scrollLeft
  updateSelectedCar()
}
const updateSelectedCar = () => {
  const i = Math.floor(scrollLeft.value / scrollWidth.value)
  if (recommendedCars[i]) selectedCar.value = recommendedCars[i]
}

function goSearch(){ uni.navigateTo({ url: '/pages/search/index' }) }
function onUseCar(car){ uni.navigateTo({ url: `/pages/confirm-order/index?carId=${car.carId}` }) }
function goCertification(){ uni.navigateTo({ url: '/pages/certification/index' }) }
function goMe(){ uni.navigateTo({ url: '/pages/me/index' }) }
function repeatOrder(){ uni.navigateTo({ url: '/pages/order/index?reuse=1' }) }
function formatImage(img){ if(!img) return '/static/car1.png'; return img.startsWith('http')? img : `http://localhost:8081${img}` }

onMounted(async ()=>{
  scrollWidth.value = uni.getSystemInfoSync().windowWidth
  try{
    const res = await getHomePage({ longitude:118.629039, latitude:24.911498 })
    const data = res.data || {}

    if (data.unpaidOrder && data.unpaidOrder.orderStatus === 'proceeding') {
      uni.setStorageSync('currentOrderNum', data.unpaidOrder.orderNum)
      uni.showToast({ title:'您有未完成订单，即将跳转到支付订单页面', icon:'none', duration:1500 })
      setTimeout(()=>{ uni.redirectTo({ /* url: `/pages/confirm-order/index?...` */ }) }, 1200)
      return
    }

    locationName.value = data.locationName || '当前位置'
    isCertified.value = !!data.certified
    user.avatar = data.avatar ?? '/static/avatar.png'

    recommendedCars.splice(0, recommendedCars.length, ...(data.recommendedCars || []))
    frequentLocations.splice(0, frequentLocations.length, ...(data.frequentNetPoints || []))

    if (data.recentOrder) {
      recentOrder.time = data.recentOrder.time
      recentOrder.carName = data.recentOrder.carName
    } else {
      recentOrder.time = ''
      recentOrder.carName = ''
    }
  }catch(e){
    console.error('首页加载失败', e)
    uni.showToast({ title:'加载失败', icon:'none' })
  }
})

async function onNetPointClick(netId){
  loadingCars.value = true
  try{
    const res = await getRecommendedCars({ netId, page:1, size:5 })
    const sorted = (res.data || []).sort((a,b)=> (b.aiWeight??0)-(a.aiWeight??0))
    recommendedCars.splice(0, recommendedCars.length, ...sorted)
  }catch(e){
    uni.showToast({ title:'车辆加载失败', icon:'none' })
  }finally{
    loadingCars.value = false
  }
}
</script>

<style scoped>
:root { --w:710rpx; }

/* 基础 */
.home-wrap{ height:100vh; background:linear-gradient(180deg,#CFFAE6 0%,#F7F9FB 70%); }
.home{ position:relative; padding-bottom:48rpx; }
.one-line{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }

/* 背景 & 顶部 */
.bg-home{ position:absolute; left:0; top:0; width:752rpx; height:1624rpx; z-index:0; pointer-events:none; }
.status-bar{ width:750rpx; height:calc(88rpx + constant(safe-area-inset-top)); height:calc(88rpx + env(safe-area-inset-top)); }
.title-wrap{ position:relative; z-index:1; width:750rpx; height:48rpx; display:flex; align-items:center; justify-content:center; }
.title-text{ font-weight:600; font-size:36rpx; color:#2D2D2D; }

/* 搜索胶囊 */
.search-capsule{
  position:relative; z-index:1; width:var(--w); height:80rpx; margin:16rpx auto 0;
  background: rgba(255,255,255,0.72); border-radius:40rpx; display:flex; align-items:center; padding:0 20rpx;
  box-shadow:0 6rpx 16rpx rgba(31,161,97,.07); backdrop-filter: blur(6rpx);
}
.loc-wrap{ display:flex; align-items:center; max-width:60%; }
.loc-txt{ height:38rpx; line-height:38rpx; font-size:28rpx; }
.green{ color:#14B940; }
.loc-split{ width:22rpx; height:0; border-top:2rpx solid #14B940; margin:0 10rpx; transform:rotate(90deg); opacity:.6; }
.loc-arrow{ width:0; height:0; margin-left:10rpx; border-left:10rpx solid transparent; border-right:10rpx solid transparent; border-top:14rpx solid #14B940; opacity:.85; }
.search-body{ flex:1; display:flex; justify-content:flex-end; }
.search-ph{ height:38rpx; line-height:38rpx; font-size:28rpx; color:#7EC390; }
.search-ico{ position:absolute; right:20rpx; top:22rpx; width:36rpx; height:36rpx; }

/* 欢迎横幅：强制水平居中 */
.hero-banner{
  position:relative; z-index:1; width:584rpx; height:196rpx;
  margin-top:20rpx; left:50%; transform:translateX(-50%); display:block;
  filter: drop-shadow(0 6rpx 12rpx rgba(0,0,0,.06));
}

/* 学生认证（上圆角、下直角） */
.stu-banner{
  width: var(--w);
  height: 92rpx;
  margin: 16rpx auto 0;
  border-radius: 24rpx 24rpx 0 0;
  background: linear-gradient(180deg, rgba(237,255,254,0.60) 0%, rgba(255,255,255,0.40) 100%);
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.06);
  display: flex; align-items: center; padding: 0 20rpx; position: relative;
}
.hb-ico{ width: 36rpx; height: 36rpx; margin: 0 16rpx 0 12rpx; }
.stu-txt{ font-size: 32rpx; line-height: 44rpx; color:#00BD7B; font-weight: 600; }
.cb-arrow{ position:absolute; right:20rpx; width:36rpx; height:36rpx; }

/* 推荐用车（四角圆角，轻微上顶） */
.reco-card{
  width: var(--w);
  margin: -14rpx auto 0;                 /* 关键：与认证卡片丝滑衔接 */
  border-radius: 24rpx;
  background: linear-gradient(180deg,#F4FFF8 0%, #F9FFFC 100%);
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.06);
  overflow: hidden;
  position: relative;
  padding: 16rpx 20rpx 20rpx;
}

/* 标题与小车图标居中；“最佳推荐”居中在下方 */
.reco-hd{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding-top: 6rpx; }
.reco-title-line{ display:inline-flex; align-items:center; justify-content:center; }
.reco-car-ico{ width: 40rpx; height: 40rpx; margin-right: 10rpx; }
.reco-title{ font-weight:800; font-size:32rpx; color:#222; line-height:40rpx; }
.best-pill{ width: 160rpx; height: 48rpx; margin-top: 10rpx; }

/* 车图 */
.che-pic{
  width: 560rpx; max-width:100%;
  margin: 18rpx auto 8rpx; display:block; object-fit:contain;
}

/* 车牌 + 价格（蓝湖 1:1） */
.plate-price{ display:flex; align-items:flex-start; gap:18rpx; padding: 0 2rpx; }
.plate-num{ color:#222; display:flex; align-items:flex-start; line-height:66rpx; }
.plate-prov{ font-family:"AlibabaPuHuiTi"; font-weight:500; font-size:48rpx; line-height:66rpx; color:#222; }
.plate-mid{ font-family:D-DIN; font-weight:700; font-size:56rpx; line-height:66rpx; color:#222; letter-spacing:6rpx; }
.plate-id{ font-family:D-DIN; font-weight:700; font-size:56rpx; line-height:66rpx; color:#222; letter-spacing:3rpx; }
.price-box{ margin-left:auto; display:flex; align-items:flex-start; gap:2rpx; }
.price-n{ font-family:D-DIN; font-weight:700; font-size:80rpx; line-height:86rpx; color:#FD0300; }
.price-u{ font-family:D-DIN; font-weight:700; font-size:36rpx; line-height:86rpx; color:#FD0300; }
.price-qi{ font-family:"AlibabaPuHuiTi"; font-weight:400; font-size:26rpx; line-height:40rpx; color:#AAAAAA; margin-top:30rpx; }

/* 指标更贴近 */
.spec-line{ display:flex; align-items:center; flex-wrap:wrap; gap:8rpx 14rpx; padding: 6rpx 2rpx 0; }
.sp-ico{ width:32rpx; height:32rpx; margin-right:4rpx; }
.sp-txt{ font-size:30rpx; color:#56CA74; line-height:42rpx; }
.sp-sub{ font-size:22rpx; color:#CCCCCC; }

/* CTA 按钮 */
.big-btn{
  width:100%; height:96rpx; border-radius:48rpx;
  background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  color:#fff; font-size:32rpx; font-weight:800; letter-spacing:2rpx;
  box-shadow:0 10rpx 22rpx rgba(19,182,61,.22);
  display:flex; align-items:center; justify-content:center; margin-top: 14rpx;
}

/* 芝麻信用分（居中） */
.zhima-row{ display:flex; justify-content:center; align-items:center; gap:10rpx; margin-top: 16rpx; }
.zhima-ico{ width:28rpx; height:28rpx; }
.zhima-txt{ text-align:center; font-size:24rpx; color:#888; line-height:34rpx; }

/* 宫格（两行可见） */
.grid-section{
  width: var(--w); margin: 18rpx auto 0;
  background:#fff; border-radius:24rpx; overflow:hidden;
  box-shadow:0 8rpx 24rpx rgba(0,0,0,.06); padding:20rpx 0 8rpx;
}
.grid{ width:680rpx; margin:0 auto; display:grid; grid-template-columns: repeat(3, 1fr); grid-column-gap: 0; grid-row-gap: 8rpx; }
.grid-item{ height:182rpx; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.gi-ico{ width:140rpx; height:140rpx; }
.gi-text{ margin-top:-8rpx; width:120rpx; height:50rpx; line-height:38rpx; text-align:center; font-weight:600; font-size:28rpx; color:#1F1F1F; }

/* 常用网点 */
.sites-card{ width:var(--w); min-height:368rpx; margin:20rpx auto 0; background:#fff; border-radius:32rpx; padding-bottom:16rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.05); }
.sites-hd{ width:692rpx; height:68rpx; margin:12rpx auto 0; display:flex; align-items:center; }
.shu{ width:8rpx; height:36rpx; margin-right:12rpx; }
.sites-title{ height:44rpx; line-height:44rpx; font-weight:700; font-size:32rpx; color:#1E1E1E; }
.sites-row{ width:670rpx; height:76rpx; margin:14rpx auto 0; border-radius:38rpx; display:flex; align-items:center; padding:0 20rpx; background:#fff; border:2rpx solid #F0F5F3; }
.sites-row.grad{ background: linear-gradient(270deg,#F7FFF6 0%, #F4FCF8 100%); }
.map-ico{ width:32rpx; height:32rpx; margin-right:12rpx; }
.site-name{ flex:1; height:36rpx; line-height:38rpx; font-weight:600; font-size:28rpx; color:#404040; }

/* 最近订单 */
.order-card{ width:var(--w); min-height:224rpx; margin:20rpx auto 0; background:#fff; border-radius:32rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.05); }
.order-hd{ display:flex; align-items:center; padding:12rpx 20rpx 0; }
.green-stick{ width:8rpx; height:36rpx; background:#0DD64B; border-radius:4rpx; }
.order-title{ margin-left:12rpx; font-weight:700; font-size:32rpx; color:#1E1E1E; }
.order-row{ display:flex; align-items:center; padding:16rpx 20rpx 22rpx; gap:14rpx; }
.time-ico{ width:32rpx; height:32rpx; }
.order-texts{ flex:1; display:flex; flex-direction:column; gap:2rpx; min-width:0; }
.order-line{ font-weight:600; font-size:28rpx; color:#424242; line-height:44rpx; }
.order-time{ font-weight:400; font-size:26rpx; color:#A3A3A3; line-height:38rpx; }
.order-btn{ width:144rpx; height:60rpx; border-radius:316rpx; background:linear-gradient(316deg, #F3A03A 0%, #FFC868 100%); color:#fff; font-size:28rpx; line-height:60rpx; text-align:center; font-weight:700; box-shadow:0 6rpx 16rpx rgba(243,160,58,.22); }

/* CTA */
.cta-img{ width:704rpx; height:208rpx; margin:20rpx auto 0; display:block; border-radius:20rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.06); }
.kefu{ display:block; width:560rpx; height:36rpx; line-height:36rpx; margin:12rpx auto 40rpx; text-align:center; color:#9E9E9E; font-size:26rpx; }

</style>

<template>
</template>

<script>
</script>

<style>
</style>