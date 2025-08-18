<template>
  <scroll-view scroll-y class="home-wrap">
    <view class="home">
      <!-- 背景 -->
      <image class="bg-home" src="/static/home/bg-home.png" mode="widthFix" />
 <!-- 顶部导航（自定义） -->
	  <TitleBar title="首页" background="transparent" >
	      <!-- 右侧可放占位或图标 -->
	      <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
	    </TitleBar>
      <!-- 状态栏安全区 -->
      <!-- <view class="status-bar" /> -->
	  
      <!-- 标题 -->
      <!-- <view class="title-wrap">
        <text class="title-text">首页</text>
        <view class="title-icons"></view>
      </view> -->
      <!-- 搜索 -->
      <view class="search-capsule">
        <view class="loc-wrap" @click="pickCity && pickCity()">
          <text class="loc-txt green">{{ locationName }}</text>
          <view class="loc-split"></view>
     <!--     <text class="loc-txt green">坪山加油站</text>
          <view class="loc-arrow"></view> -->
        </view>
        <view class="search-body" @click="goSearch">
          <text class="search-ph">搜索网点名称、车型</text>
        </view>
        <image class="search-ico" src="/static/home/search-lv.png" mode="widthFix" />
      </view>

      <!-- 欢迎横幅（强制水平居中） -->
      <image class="hero-banner" src="/static/home/huanying.png" mode="widthFix" />

      <!-- 上：学生认证（独立卡片：上圆角、下直角） -->
      <view v-if="!isCertified" class="stu-banner" @click="goCertification">
        <image class="hb-ico" src="/static/home/icon-2.png" />
        <text class="stu-txt">大学生认证立减20元</text>
        <image class="cb-arrow" src="/static/home/arrow-right.png" />
      </view>

      <!-- 下：推荐用车（四角圆角，向上“顶”一小步与学生认证丝滑衔接） -->
      <view class="reco-wrap">
        <!-- 标题白条（与车卡分离，不粘连） -->
        <view class="reco-hd">
          <image class="car-ico" src="/static/home/car.png" />
          <view class="reco-title-wrap">
            <text class="reco-title">推荐用车</text>
            <image class="reco-underline" src="/static/home/huxing.png" mode="widthFix" />
          </view>
        </view>

        <!-- 车卡主体（有数据用接口，无数据走兜底） -->
        <view class="rec-card">
          <image
            class="che-pic"
            :src="formatImage(recommendedCars[0]?.carImage) || '/static/home/che-pic.png'"
            mode="widthFix"
          />
          <image class="tag-zuijia" src="/static/home/zuijia.png" />
          <image class="btn-youhua" src="/static/home/youhua.png" />

          <!-- 车牌 + 价格（按标注） -->
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

          <!-- 指标（图标更贴近文字） -->
          <view class="spec-line">
            <image class="sp-ico" src="/static/home/battery.png" />
            <text class="sp-txt">80%</text>

            <image class="sp-ico" src="/static/home/licheng.png" />
            <text class="sp-txt">300km</text>

            <image class="sp-ico" src="/static/home/walk.png" />
            <text class="sp-txt">30m</text>
            <text class="sp-sub">（约1min）</text>
          </view>

          <!-- CTA -->
          <button class="big-btn" @click="recommendedCars[0] && onUseCar(recommendedCars[0])">立即用车</button>

          <!-- 芝麻信用分（居中） -->
          <view class="zhima-row">
            <image class="zhima-ico" src="/static/home/zhima.png" />
            <text class="zhima-txt">芝麻信用分｜650分以上有机会免押租车</text>
          </view>
        </view>
      </view>

      <!-- 宫格（首屏能看到两行） -->
      <view class="grid-section">
        <view class="grid">
          <view class="grid-item" @click="goSearch()"><image class="gi-ico" src="/static/home/icon-1.png" /><text class="gi-text">快速找车</text></view>
          <view class="grid-item" @click="goCoupon()"><image class="gi-ico" src="/static/home/icon-2.png" /><text class="gi-text">领优惠券</text></view>
          <view class="grid-item" @click="goCertification()"><image class="gi-ico" src="/static/home/icon-3.png" /><text class="gi-text">学生认证</text></view>
          <view class="grid-item" @click="gopromo()"><image class="gi-ico" src="/static/home/icon-4.png" /><text class="gi-text">推广奖励</text></view>
          <view class="grid-item"><image class="gi-ico" src="/static/home/icon-5.png" /><text class="gi-text">我的积分</text></view>
          <view class="grid-item" @click="goMe()()"><image class="gi-ico" src="/static/home/icon-6.png" /><text class="gi-text">占个位置</text></view>
        </view>
      </view>

      <!-- 常用网点 -->
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
          <view class="sites-row"><image class="map-ico" src="/static/home/map.png" /><text class="site-name one-line">丰泽区｜坪山加油站（勿停充电桩）</text></view>
          <view class="sites-row grad"><image class="map-ico" src="/static/home/map.png" /><text class="site-name one-line">鲤城区｜幸福广场｜专属车位（勿停收费车…）</text></view>
          <view class="sites-row grad"><image class="map-ico" src="/static/home/map.png" /><text class="site-name one-line">晋江市｜溜溪花园（停车勿超过石墩勿停收…）</text></view>
        </view>
      </view>

      <!-- CTA & 客服 -->
      <image class="cta-img" src="/static/home/广告区.png" mode="widthFix" />
      <text class="kefu">客服电话：400-123-1234（8:30~22:00）</text>
    </view>
  </scroll-view>
</template>




<script setup>
import TitleBar from '@/components/header/TitleBar.vue'
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

function goSearch(){ uni.navigateTo({ url: '/pages/map/index' }) }
function onUseCar(car){ uni.navigateTo({ url: `/pages/confirm-order/index?carId=${car.carId}` }) }
function goCertification(){ uni.navigateTo({ url: '/pages/auth/idcard' }) }
function goCoupon(){ uni.navigateTo({ url: '/pages/coupon/index' }) }
function gopromo(){ uni.navigateTo({ url: '/pages/promo/index' }) }
// function gopromo(){ uni.navigateTo({ url: '/pages/me/index' }) }
function goMe(){ uni.navigateTo({ url: '/pages/me/index' }) }
function repeatOrder(){ uni.navigateTo({ url: '/pages/order/index?reuse=1' }) }
function formatImage(img){ if(!img) return '/static/car1.png'; return img.startsWith('http')? img : `http://localhost:8081${img}` }


onMounted(async ()=>{
  scrollWidth.value = uni.getSystemInfoSync().windowWidth
  try{
    const res = await getHomePage({ longitude:118.629039, latitude:24.911498 })
    const data = res.data || {}

    // if (data.unpaidOrder && data.unpaidOrder.orderStatus === 'proceeding') {
    //   uni.setStorageSync('currentOrderNum', data.unpaidOrder.orderNum)
    //   uni.showToast({ title:'您有未完成订单，即将跳转到支付订单页面', icon:'none', duration:1500 })
    //   setTimeout(()=>{ uni.redirectTo({ /* url: `/pages/confirm-order/index?...` */ }) }, 1200)
    //   return
    // }

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
/* ===== 基础 ===== */
.home-wrap{ height:100vh; background:linear-gradient(180deg,#CFFAE6 0%,#F7F9FB 70%); }
.home {
  position: relative;
  padding: 0 20rpx 48rpx; /* 左右20rpx对齐，底部保留48rpx */
  box-sizing: border-box; /* 确保padding不撑大宽度 */
}.one-line{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }

/* 背景与顶部 */
.bg-home{ position:absolute; left:0; top:0; width:752rpx; height:1624rpx; z-index:0; pointer-events:none; }
.status-bar{ width:750rpx; height:calc(88rpx + constant(safe-area-inset-top)); height:calc(88rpx + env(safe-area-inset-top)); }
.title-wrap{ position:relative; z-index:1; width:750rpx; height:48rpx; display:flex; align-items:center; justify-content:center; }
.title-text{ font-weight:600; font-size:36rpx; color:#2D2D2D; }

/* 搜索 */
.search-capsule {
  height: 80rpx;
  margin: 16rpx 0; /* 去掉 auto，改成和外层一致 */
  background: rgba(255, 255, 255, .72);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(31, 161, 97, .07);
  backdrop-filter: blur(6rpx);
}
.loc-wrap{ display:flex; align-items:center; max-width:60%; }
.loc-txt{ height:38rpx; line-height:38rpx; font-size:28rpx; 
  white-space: nowrap; /* 禁止换行 */
 
 overflow: hidden; /* 隐藏溢出部分 */
  flex-shrink: 1; /* 允许缩小 */
  min-width: 0; /* 关键：覆盖flex项的默认min-width: auto */
    animation: scroll 10s linear infinite; /* 10秒完成一次滚动，无限循环 */
}
@keyframes scroll {
 0% {
    transform: translateX(0); /* 初始位置 */
  }
  80% {
    transform: translateX(-20%); /* 向左滚动到完全显示 */
  }
  
}
.green{ color:#14B940; }
.loc-split{ width:22rpx; border-top:2rpx solid #14B940; margin:0 10rpx; transform:rotate(90deg); opacity:.6; }
.loc-arrow{ width:0; height:0; margin-left:10rpx; border-left:10rpx solid transparent; border-right:10rpx solid transparent; border-top:14rpx solid #14B940; }

/* 这里改成左对齐 + 预留右侧图标空间 */
.search-body{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:flex-start;   /* 原来是 flex-end */
  padding-left:12rpx;           /* 左内边距，让文字不贴边 */
  padding-right:48rpx;          /* 预留放大镜图标的空间 */
  min-width:0;                  /* 防止被 loc-wrap 挤爆换行 */
}

.search-ph{
  height:38rpx; line-height:38rpx; font-size:28rpx; color:#7EC390;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; /* 文本过长省略 */
  text-align:left;               /* 保险起见也设为左对齐 */
}

.search-ico{ position:absolute; right:20rpx; top:22rpx; width:36rpx; height:36rpx; }


/* 欢迎横幅：任何情况下都水平居中 */
.hero-banner{
  position:relative; z-index:1; width:584rpx; height:196rpx; margin-top:20rpx;
  left:50%; transform:translateX(-50%); display:block;
  filter: drop-shadow(0 6rpx 12rpx rgba(0,0,0,.06));
}

/* 学生认证（上圆角、下直角；宽度与推荐严格对齐） */
.stu-banner{
   height:92rpx;
  /* 用绝对居中代替 margin:auto，避免半像素误差 */
  position:relative; left:50%; transform:translateX(-50%);
  margin-top:16rpx; margin-left:0; margin-right:0;

  border-radius:24rpx 24rpx 0 0;
  background:linear-gradient(180deg,rgba(237,255,254,.6) 0%, rgba(255,255,255,.4) 100%);
  box-shadow:0 8rpx 24rpx rgba(0,0,0,.06);
  display:flex; align-items:center; padding:0 20rpx;
}
.hb-ico{ width:36rpx; height:36rpx; margin:0 16rpx 0 12rpx; }
.stu-txt{ font-size:32rpx; line-height:44rpx; color:#00BD7B; font-weight:600; }
.cb-arrow{ position:absolute; right:20rpx; width:36rpx; height:36rpx; }

/* 推荐用车（四角圆角，向上顶） */
.reco-wrap{
  width:710rpx; margin:-14rpx auto 0;        /* ← 与学生认证“丝滑”相接 */
  border-radius:24rpx; overflow:hidden;
  background:linear-gradient(180deg,#F4FFF8 0%, #F9FFFC 100%);
  box-shadow:0 8rpx 24rpx rgba(0,0,0,.06);
  position:relative; z-index:1; padding-bottom:22rpx; /* 防止按钮阴影被裁 */
}

/* 标题白条（与车卡分离） */
.reco-hd{
  display:flex; align-items:center; height:72rpx;
  margin:16rpx 20rpx 0; padding:0 20rpx; background:#fff; border-radius:20rpx;
  box-shadow:0 6rpx 16rpx rgba(0,0,0,.06);
   background:none !important;  /* 无背景色 */
	box-shadow:none !important;  /* 去阴影 */
    border-radius:0 !important;  /* 去圆角 */
}

.car-ico{ width:40rpx; height:40rpx; margin-right:12rpx; }

/* 标题 + 下划弧线：弧线居中贴底 */
.reco-title-wrap{ position:relative; display:inline-flex; align-items:flex-end; padding-bottom:8rpx; }
.reco-title{ font-weight:800; font-size:32rpx; color:#222; line-height:40rpx; }
.reco-underline{ position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:44rpx; height:6rpx; }

/* 车卡主体 */
.rec-card{ padding:20rpx; position:relative; }
.che-pic{ width:560rpx; max-width:100%; margin:18rpx auto; display:block; object-fit:contain; }
.tag-zuijia{ position:absolute; left:70rpx; top:0rpx; width:160rpx; height:48rpx; }
.btn-youhua{ position:absolute; right:24rpx; top:116rpx; width:48rpx; height:48rpx; }

/* 车牌（按标注） */
.plate-price{ display:flex; align-items:flex-start; gap:18rpx; }
.plate-num{ color:#222; display:flex; align-items:flex-start; line-height:66rpx; }
.plate-prov{ font-family:AlibabaPuHuiTi,system-ui; font-weight:500; font-size:48rpx; line-height:66rpx; color:#222; }
.plate-mid{ font-family:D-DIN,system-ui; font-weight:700; font-size:56rpx; line-height:66rpx; letter-spacing:6rpx; color:#222; }
.plate-id{  font-family:D-DIN,system-ui; font-weight:700; font-size:56rpx; line-height:66rpx; letter-spacing:3rpx; color:#222; }
.price-box{ margin-left:auto; display:flex; align-items:flex-start; }
.price-n{ font-family:D-DIN,system-ui; font-weight:700; font-size:80rpx; line-height:86rpx; color:#FD0300; }
.price-u{ font-family:D-DIN,system-ui; font-weight:700; font-size:36rpx; line-height:86rpx; color:#FD0300; margin-left:2rpx; }
.price-qi{ font-family:AlibabaPuHuiTi,system-ui; font-weight:400; font-size:26rpx; line-height:40rpx; color:#AAA; margin-top:30rpx; }

/* 指标（图标更贴近文字） */
.spec-line{ display:flex; align-items:center; flex-wrap:wrap; gap:6rpx 14rpx; padding:4rpx 2rpx; }
.sp-ico{ width:34rpx; height:32rpx; margin-right:4rpx; }
.sp-txt{ font-size:30rpx; color:#56CA74; line-height:42rpx; }
.sp-sub{ font-size:22rpx; color:#CCC; }

/* CTA 按钮 */
.big-btn{
  width:100%; height:96rpx; border-radius:48rpx;
  background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  color:#fff; font-size:32rpx; font-weight:800; letter-spacing:2rpx;
  box-shadow:0 10rpx 22rpx rgba(19,182,61,.22);
  display:flex; align-items:center; justify-content:center; margin-top:14rpx;
}

/* 芝麻信用分（居中） */
.zhima-row{ display:flex; justify-content:center; align-items:center; gap:10rpx; margin-top:16rpx; }
.zhima-ico{ width:28rpx; height:28rpx; }
.zhima-txt{ text-align:center; font-size:24rpx; color:#888; line-height:34rpx; }

/* 宫格（首屏能看到两行；与上保留合理间距） */
.grid-section{
  width:710rpx; margin:20rpx auto; background:#fff; border-radius:24rpx; overflow:hidden;
  box-shadow:0 8rpx 24rpx rgba(0,0,0,.06); padding:24rpx 0 8rpx; position:relative; z-index:1;
}
.grid{ width:680rpx; margin:0 auto; display:grid; grid-template-columns:repeat(3,1fr); grid-column-gap:0; grid-row-gap:8rpx; }
.grid-item{ height:182rpx; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.gi-ico{ width:140rpx; height:140rpx; }
.gi-text{ margin-top:-8rpx; width:120rpx; height:50rpx; line-height:38rpx; text-align:center; font-weight:600; font-size:28rpx; color:#1F1F1F; }

/* 常用网点 */
.sites-card{ width:710rpx; min-height:368rpx; margin:16rpx auto 0; background:#fff; border-radius:32rpx; padding-bottom:16rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.05); }
.sites-hd{ width:692rpx; height:68rpx; margin:12rpx auto 0; display:flex; align-items:center; }
.shu{ width:8rpx; height:36rpx; margin-right:12rpx; }
.sites-title{ height:44rpx; line-height:44rpx; font-weight:700; font-size:32rpx; color:#1E1E1E; }
.sites-row{ width:670rpx; height:76rpx; margin:14rpx auto 0; border-radius:38rpx; display:flex; align-items:center; padding:0 20rpx; background:#fff; border:2rpx solid #F0F5F3; }
.sites-row.grad{ background:linear-gradient(270deg,#F7FFF6 0%, #F4FCF8 100%); }
.map-ico{ width:32rpx; height:32rpx; margin-right:12rpx; }
.site-name{ flex:1; height:36rpx; line-height:38rpx; font-weight:600; font-size:28rpx; color:#404040; }

/* CTA & 客服 */
.cta-img{ width:704rpx; height:208rpx; margin:20rpx auto 0; display:block; border-radius:20rpx; box-shadow:0 8rpx 24rpx rgba(0,0,0,.06); }
.kefu{ display:block; width:560rpx; height:36rpx; line-height:36rpx; margin:12rpx auto 40rpx; text-align:center; color:#9E9E9E; font-size:26rpx; }
</style>

