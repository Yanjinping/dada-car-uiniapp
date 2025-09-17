<template>
  <view class="page">
	  
<view class="hero">
 <!-- 自定义标题栏（透明） -->
 <TitleBar title="找车" background="transparent" />
 
    <!-- 搜索框（Rectangle 1146 + dingwei + 占位文案） -->
    <view class="search-wrap">
      <image class="icon-dingwei" src="/static/icons/dingwei.png" mode="widthFix" />
      <input
        class="search-input"
        v-model="keyword"
        placeholder="坪山加油站"
        placeholder-class="ph"
        confirm-type="search"
        @confirm="onSearch"
      />
    </view>
</view>
    <!-- 三个筛选（车型 / 续航 / 评分） -->
    <view class="filters">
      <view class="filter-item">
        <text class="t">车型</text>
        <image class="down" src="/static/icons/arrow-drop-down-fill.png" />
      </view>
      <view class="filter-item">
        <text class="t">续航</text>
        <image class="down" src="/static/icons/arrow-drop-down-fill.png" />
      </view>
      <view class="filter-item">
        <text class="t">评分</text>
        <image class="down" src="/static/icons/arrow-drop-down-fill.png" />
      </view>
    </view>

    <!-- 小黄条：离你最近的网点 -->
    <text class="near-tag">离你最近的网点</text>

    <!-- 网点卡片抬头（图标 + 名称 + 右侧“收起”按钮） -->
    <view class="site-head">
      <image class="site-ic" src="/static/icons/wangdian.png" />
      <text class="site-name">丰泽区 | 坪山加油站（勿停充电桩）</text>

      <view class="fold" @tap="toggleFold">
        <text class="fold-t">{{ folded ? '展开' : '收起' }}</text>
        <image class="down" :class="{up: !folded}" src="/static/icons/arrow-drop-down-fill.png" />
      </view>

      <!-- 次行：距离/车量/导航 -->
      <view class="site-sub">
        <view class="sub-item">
          <image class="i32 rot" src="/static/icons/juli.png" />
          <text class="sub-t gray">50m</text>
        </view>
        <view class="sub-item">
          <image class="i32" src="/static/icons/car-count.png" />
          <text class="sub-t green">10</text>
        </view>
        <view class="sub-item">
          <image class="i32" src="/static/icons/nav.png" />
          <text class="sub-t green">导航</text>
        </view>
      </view>
    </view>

    <!-- 车辆列表（可折叠） -->
    <view v-show="!folded" class="car-list">
      <view v-for="(c,idx) in cars" :key="idx" class="car-card">
        <!-- 左上：车型绿标签 -->
        <view class="model-tag">{{ c.modelTag }}</view>

        <!-- 车图 -->
        <image class="car-pic" :src="c.img" mode="aspectFit" />

        <!-- 右侧信息 -->
        <view class="info">
          <!-- 车牌（按稿子做字重/字号层级） -->
          <view class="plate">
            <text class="plate-province">闽</text>
            <text class="plate-dot">C·</text>
            <text class="plate-num">D12345</text>
          </view>

          <!-- 电量 + 续航 -->
          <view class="row">
            <image class="i32" src="/static/icons/battery-2-charge-fill.png" />
            <text class="ok">100%</text>

            <image class="i32 m24" src="/static/icons/range.png" />
            <text class="ok">150km</text>
          </view>

          <!-- 星级 -->
          <view class="row stars">
            <image v-for="n in 5" :key="n" class="star" src="/static/icons/star-s-fill.png" />
          </view>

          <!-- 价格 -->
          <view class="row price">
            <text class="yuan">¥</text>
            <text class="num">{{ c.price }}</text>
            <text class="qi">起</text>
          </view>

          <!-- 按钮：立即用车 -->
          <button class="btn" @tap="useNow(c)">立即用车</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'

const keyword = ref('坪山加油站')
const folded = ref(false)

const cars = ref([
  {
    modelTag: '北汽EC200',
    img: '/static/cars/beiqi-ec200.png',
    price: 8
  },
  {
    modelTag: '北汽EC200',
    img: '/static/cars/beiqi-ec200.png',
    price: 10
  },
  {
    modelTag: '北汽EC200',
    img: '/static/cars/beiqi-ec200.png',
    price: 15
  }
])

const onSearch = () => {
  // TODO: 调接口搜索网点
  console.log('search:', keyword.value)
}
const toggleFold = () => (folded.value = !folded.value)
const goBack = () => uni.navigateBack()
const useNow = (c:any) => {
  uni.showToast({ title: `使用 ${c.modelTag}`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
/* ===== 字体（用你自己的文件替换路径） ===== */
@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('/static/fonts/AlibabaPuHuiTi-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('/static/fonts/AlibabaPuHuiTi-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'D-DIN';
  src: url('/static/fonts/D-DIN-Bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: 'D-DIN';
  src: url('/static/fonts/D-DIN-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}

/* ===== 页面骨架 ===== */
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


/* ===== 搜索框（完全按你给的标注） ===== */
.search-wrap{
  position: absolute;
  left: 20rpx; top: 204rpx;
  width: 680rpx; height: 96rpx;
  background: #FFFFFF;
  box-shadow: 0rpx 8rpx 40rpx 0rpx rgba(62,164,93,0.2);
  border-radius: 48rpx;
  display: flex; align-items: center;
}
.icon-dingwei{
  width: 48rpx; height: 48rpx; margin-left: 52rpx;
}
.search-input{
  margin-left: 20rpx; margin-right: 24rpx;
  width: 560rpx; height: 44rpx; line-height: 44rpx;
  font-size: 32rpx; color: #222;
}
.ph{ /* placeholder 按标注灰色 */
  font-size: 32rpx; color: #888888; line-height: 44rpx;
}

/* ===== 筛选条 ===== */
.filters{
  margin-top: 134rpx; /* 与稿子对齐：搜索下方  */
  padding: 0 52rpx;
  display: flex; justify-content: space-between;
}
.filter-item{ display: flex; align-items: center; }
.filter-item .t{
  width: 64rpx; height: 32rpx;
  font-weight: 500; font-size: 32rpx; color: #222; line-height: 32rpx; text-align: center;
}
.down{ width: 32rpx; height: 32rpx; margin-left: 10rpx; }

/* 小黄条提示 */
.near-tag{
  margin-left: 56rpx; margin-top: 0rpx; /* 对应 434rpx 行基线 */
  display: inline-block;
  font-weight: 400; font-size: 28rpx; line-height: 38rpx;
  color: #FF9C08;
}

/* ===== 网点抬头卡片 ===== */
.site-head{
  margin: 40rpx 20rpx 0;
  padding: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);
  position: relative;
}
.site-ic{ width: 40rpx; height: 40rpx; border-radius: 12rpx; background: #82ED71; }
.site-name{
  position: absolute; left: 100rpx; top: 24rpx;
  width: 612rpx; height: 40rpx;
  font-weight: 500; font-size: 30rpx; color: #222; line-height: 40rpx;
}
/* 右侧收起 */
.fold{ position: absolute; right: 24rpx; top: 20rpx; display:flex; align-items:center; }
.fold-t{ font-size: 28rpx; color:#222; margin-right: 8rpx; }
.down.up{ transform: rotate(180deg); }

/* 次行小信息 */
.site-sub{
  margin-top: 52rpx;
  padding-left: 56rpx;
  display: flex; align-items: center; column-gap: 32rpx;
}
.sub-item{ display: flex; align-items: center; }
.i32{ width: 32rpx; height: 32rpx; }
.rot{ transform: rotate(180deg); }
.sub-t{ font-size: 28rpx; line-height: 26rpx; margin-left: 8rpx; }
.gray{ color: #AAAAAA; }
.green{ color: #16C25D; }

/* ===== 车辆卡片（完全按标注大小与层次） ===== */
.car-list{ padding: 20rpx; }
.car-card{
  position: relative;
  width: 710rpx; min-height: 320rpx;
  margin: 20rpx auto;
  background: linear-gradient(360deg, #F5F5F5 0%, rgba(245,245,245,0) 100%);
  border-radius: 24rpx;
  border: 2rpx solid #EEEEEE;
  padding: 0 0 24rpx 0;
}

/* 左上车型标签 */
.model-tag{
  position: absolute; left: 56rpx; top: 30rpx;
  width: 138rpx; height: 41rpx;
  font-size: 26rpx; color: #2DBC52; line-height: 32rpx; text-align: center; font-weight: 400;
  background: #fff; border-radius: 22rpx; padding: 4rpx 12rpx; /* 让字更清晰 */
}

/* 车图（按 238*158） */
.car-pic{
  position: absolute; left: 88rpx; top: 110rpx;
  width: 238rpx; height: 158rpx;
}

/* 右侧信息区 */
.info{
  position: absolute; left: 370rpx; top: 40rpx; right: 24rpx;
}

/* 车牌文字分层 */
.plate{ height: 50rpx; display: flex; align-items: baseline; }
.plate-province{
  width: 36rpx; height: 44rpx;
  font-weight: 500; font-size: 36rpx; color: #222; line-height: 50rpx;
  font-family: AlibabaPuHuiTi;
}
.plate-dot{
  font-family: 'D-DIN';
  font-weight: 700; font-size: 40rpx; color: #222; line-height: 50rpx; letter-spacing: 12%;
  margin-left: 6rpx;
}
.plate-num{
  font-family: 'D-DIN';
  font-weight: 700; font-size: 40rpx; color: #222; line-height: 50rpx; letter-spacing: 5%;
}

/* 通用行 */
.row{ margin-top: 18rpx; display: flex; align-items: center; }
.m24{ margin-left: 24rpx; }
.ok{ font-size: 30rpx; color: #56CA74; line-height: 42rpx; margin-left: 8rpx; }

/* 星级 */
.stars .star{ width: 28rpx; height: 28rpx; margin-right: 10rpx; }

/* 价格 */
.price{ margin-top: 16rpx; }
.yuan{
  font-family: 'D-DIN'; font-weight: 700;
  color: #FD0300; font-size: 28rpx; line-height: 48rpx;
}
.num{
  font-family: 'D-DIN'; font-weight: 700;
  color: #FD0300; font-size: 48rpx; line-height: 48rpx; margin: 0 6rpx;
}
.qi{
  font-family: AlibabaPuHuiTi; font-weight: 400;
  color: #AAAAAA; font-size: 26rpx; line-height: 48rpx;
}

/* 按钮：立即用车（大按钮） */
.btn{
  margin-top: 22rpx;
  width: 280rpx; height: 72rpx; line-height: 72rpx;
  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%);
  border-radius: 48rpx; color: #fff; font-size: 32rpx;
  text-align: center; padding: 0;
}
.btn::after{ border: none; } /* uni-app 默认按钮边框去掉 */
</style>
