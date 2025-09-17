<template>
  <TitleBar title="社群福利" />
  <scroll-view class="page" scroll-y>

    <!-- 顶部 Banner -->
    <view class="banner" >
      <view class="banner-inner">
        <view class="row-1">
          <text class="join stroke-black">加入仰恩</text>
        </view>
      </view>

      <!-- 右侧插画（可无） -->
      <!-- <image class="illu" src="/static/group/banner-people.png" mode="widthFix" /> -->
    </view>

    <!-- 二维码卡片 -->
    <view class="card" >
      <view class="tip">
        <image class="horn" src="/static/activity/laba.png" mode="widthFix" />
        <text class="tip-text">长按二维码 进入社群</text>
      </view>

      <view class="qr-box">
        <image class="qr" src="/static/group/qrcode.png" mode="aspectFit" />
      </view>

      <view class="features">
        <view class="feature">
          <text class="f-title">校友相聚</text>
          <text class="f-sub">和好友一起约去玩</text>
        </view>
        <view class="feature">
          <text class="f-title">有租车疑问</text>
          <text class="f-sub">客服小嗒快速解答</text>
        </view>
      </view>
    </view>

    <view class="footer" v-if="false">
      <image class="logo" src="/static/logo.png" mode="widthFix" />
    </view>
  </scroll-view>
</template>

<script setup>
import TitleBar from '@/components/header/TitleBar.vue'
</script>

<style lang="scss" scoped>
/* 页面底色 */
.page{
  position: relative;
  width: 750rpx;
  background-image: url('/static/activity/sqfl-bg.png');
  background-size: cover;
  padding-right: 0rpx;
  min-height: 100vh;
}

/* ======= Banner ======= */
.banner{
 margin: 77rpx 30rpx 0;
  padding: 20rpx 32rpx 8rpx;  /* ↓ 底部内边距小一点 */
  min-height: auto;          /* ← 去掉最小高度 */
}




/* 加入仰恩（72rpx、黄字、黑描边） */
.join{
  font-size:72rpx; line-height:100rpx;
  color:#FFF000; font-weight:700;
}

/* 胶囊 150×72、圆角40、渐变+白边 */
.chip{
  width:150rpx; height:72rpx; border-radius:40rpx;
  background: linear-gradient(270deg,#C1FFF4 0%,#F7F28D 100%);
  border:2rpx solid #fff;
  display:flex; align-items:center; justify-content:center;
  text{ font-size:32rpx; color:#222; }
}



/* 右半（橙红 + 白描边）84rpx */
.headline-hot{
  font-size:64rpx; line-height:110rpx; font-weight:900; color:#FE4100;
}

/* 右侧插画 226×226 */
.illu{ width:226rpx; height:226rpx; margin-right: 20rpx; margin-top: 8rpx; }

/* 通用描边（更稳的 text-shadow 实现） */
.stroke-black{
  text-shadow:
    0 2rpx 0 #000, 0 -2rpx 0 #000, 2rpx 0 0 #000, -2rpx 0 0 #000,
    1rpx 1rpx 0 #000, -1rpx 1rpx 0 #000, 1rpx -1rpx 0 #000, -1rpx -1rpx 0 #000;
}
.stroke-white{
  text-shadow:
    0 3rpx 0 #fff, 0 -3rpx 0 #fff, 3rpx 0 0 #fff, -3rpx 0 0 #fff,
    2rpx 2rpx 0 #fff, -2rpx 2rpx 0 #fff, 2rpx -2rpx 0 #fff, -2rpx -2rpx 0 #fff;
}

/* ======= 二维码卡片（690×1010） ======= */
.card{
margin: 130rpx 32rpx 0;
width: 690rpx;
height: 1050rpx;
background: linear-gradient( 360deg, #F2FEF9 0%, #FFFFFF 100%);
border-radius: 40rpx 40rpx 40rpx 40rpx;
border-image: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.5)) 6 6;
}

/* 提示行 */
.tip{ display:flex; align-items:center; padding: 16rpx 10rpx 10rpx; }
.horn{ width:120rpx; height:120rpx; margin: 0 16rpx; }
.tip-text{
  font-size:48rpx; line-height:66rpx; font-weight:600;
  background: linear-gradient(180deg,#F9CC5A 0%, #DA9B34 100%);
  -webkit-background-clip:text; color:transparent;
  white-space: nowrap;
}

/* 二维码外框 610×610、圆角24、灰边 */
.qr-box{
  width:610rpx; height:610rpx; margin: 10rpx auto 0;
  border:4rpx solid #EEE; border-radius:24rpx;
  display:flex; align-items:center; justify-content:center;
}
.qr{ width:560rpx; height:560rpx; }

/* 底部两块 296×160 */
.features{
  margin: 28rpx 20rpx;
  display:flex; justify-content:space-between; padding: 0 16rpx ;
}
.feature{
  width:250rpx; height:160rpx; border-radius:24rpx; padding: 24rpx;
  background: linear-gradient( 90deg, rgba(193,255,244,0.7) 0%, rgba(247,242,141,0.7) 100%);
display:flex; flex-direction:column; justify-content:center;
}
.f-title{ font-weight:800; font-size:36rpx; color:#444; line-height:48rpx; }
.f-sub{   font-weight:400; font-size:28rpx; color:#444; line-height:48rpx; }

/* 底部 logo */
.footer{ padding: 24rpx 0 60rpx; text-align:center; }
.logo{ width:160rpx; }
</style>
