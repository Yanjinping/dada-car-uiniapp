<!-- pages/wallet/deposit.vue -->
<template>
  <view class="page">
    <!-- 顶部导航（自定义） -->
  <TitleBar title="押金管理" background="#FFFFFF">
      <!-- 右侧可放占位或图标 -->
      <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
    </TitleBar>

    <!-- 内容区 -->
    <scroll-view scroll-y class="body">

      <!-- 分时押金 -->
      <view class="card card-green" @click="goPayDeposit">
        <view class="card-left">
          <text class="c-title">分时押金</text>
          <text class="c-sub">查询违章倒数天数： {{ timeDepositDays }}工作日</text>
        </view>
        <view class="card-right">
          <text class="cta">去缴纳</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 芝麻免押 -->
      <view class="card card-blue" @click="goCancelAuth">
        <view class="card-left">
          <text class="c-title">芝麻免押</text>
          <text class="c-sub">自动结算倒数天数： {{ sesameDays }}工作日</text>
        </view>
        <view class="card-right">
          <text class="cta">解除授权</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="tips">
        <view class="tips-hd">
          <view class="line"></view>
          <text class="tips-title">温馨提示</text>
          <view class="line"></view>
        </view>
        <text v-if="false" class="tips-txt">如需退还押金 请下载APP退款</text>
        <text class="tips-txt">分时押金和芝麻免押，只需满足一项均可用车</text>
      </view>

    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'

const timeDepositDays = ref(30)
const sesameDays = ref(45)

const goBack = () => uni.navigateBack()
const goPayDeposit = () => {
  // TODO: 跳转到缴纳押金页
  uni.showToast({ title: '去缴纳押金', icon: 'none' })
}
const goCancelAuth = () => {
  // TODO: 跳转到解除授权页
  uni.showToast({ title: '解除授权', icon: 'none' })
}
</script>

<style scoped>
/* 页面骨架 */
.page{
  background:#FFFFFF;
  min-height:100vh;
}
.nav{
  height: 100rpx;
  padding: 0 28rpx;
  display:flex;align-items:center;justify-content:space-between;
  border-bottom: 1rpx solid #f2f2f2;
}
.nav-back{font-size: 48rpx;}
.nav-title{flex:1;text-align:center;font-size: 36rpx;font-weight: 700;color:#222;}
.nav-right{width:140rpx;display:flex;justify-content:flex-end;gap:24rpx;color:#333;}
.nav-dot{font-size: 40rpx;}
.nav-scan{font-size: 36rpx;}

.body{height: calc(100vh - 100rpx); padding: 28rpx; box-sizing: border-box;}

/* 卡片：更高、更圆、更有气场 */
.card{
  min-height: 176rpx;                /* ↑ 更高 */
  padding: 32rpx 34rpx;
  border-radius: 24rpx;              /* ↑ 更圆 */
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom: 28rpx;
  color:#fff;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08); /* 气场阴影 */
}
.card-green{ background:#22B46E; }
.card-blue{  background:#0A94F5; }

.card-left{max-width: 72%;}
.c-title{
  display: block; /* 强制单独一行 */
  font-size: 40rpx;                  /* ↑ 更大 */
  font-weight: 800;                  /* ↑ 更粗 */
  letter-spacing: 1rpx;
}
.c-sub{
  margin-top: 10rpx;
  font-size: 28rpx;
  opacity: .95;
}

/* 右侧 CTA：占位更稳、字更粗、箭头更显眼 */
.card-right{
  display:flex;align-items:center;gap: 10rpx;
}
.cta{
  font-size: 30rpx;
  font-weight: 700;
}
.arrow{
  font-size: 44rpx;
  margin-left: 2rpx;
}

/* 提示区：留白更大、标题更醒目 */
.tips{ padding: 24rpx 8rpx; margin-top: 20rpx; text-align:center; }
.tips-hd{ display:flex;align-items:center;gap:24rpx; justify-content:center; margin-bottom: 16rpx;}
.line{ width: 180rpx; height: 2rpx; background:#DBDBDB; border-radius: 2rpx;}
.tips-title{ font-size: 30rpx; color:#444; font-weight: 700; }
.tips-txt{ display:block; margin-top: 16rpx; font-size: 26rpx; color:#666; }
</style>
