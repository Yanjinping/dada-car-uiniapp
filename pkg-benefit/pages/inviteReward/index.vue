<template>
  <TitleBar title="晒单好礼" background="transparent" :show-left="true" />

  <view class="page">
    <!-- 卡通角色 -->
    <view class="activity-character">
      <image class="character-img" src="/static/activity/hdg.png" />
    </view>

    <!-- 活动规则部分 -->
    <view class="activity-rules">
      <text class="activity-rule-title"></text>

      <!-- 每段落前面的蓝色点 -->
      <view class="rule-item">
        <view class="blue-dot"></view>
        <text class="rule-text">在活动期间，使用嗒嗒用车完成出行后，将你的用车体验截图或文字分享到<text class="highlight-text">指定微信群</text> 并附上你的点评。</text>
      </view>

      <view class="rule-item">
        <view class="blue-dot"></view>
        <text class="rule-text">每次晒单，你将获得一张 <text class="highlight-text">10元晒单</text> 返券，满20元即可使用，优惠券将在次日12点前发放到账，有效期7天。</text>
      </view>

      <view class="rule-item">
        <view class="blue-dot"></view>
        <text class="rule-text">每人每周最多可享受2次晒单返券机会，快来分享你的出行故事，赚取优惠券吧！</text>
      </view>

      <!-- 活动时间 -->
      <view class="activity-time">
        <text>活动时间：2025.8.20-2025.12.31</text>
      </view>
    </view>

    <!-- 去晒单 按钮 -->
    <view class="action-buttons">
      <button class="go-share-btn" @click="goShare">我要晒单</button>
      <button class="view-records-btn" @click="viewRecords">晒单记录</button>
    </view>
  </view>
</template>

<script setup>
import TitleBar from '@/components/header/TitleBar.vue'

// 去晒单
const goShare = () => {
  console.log('跳转到晒单页面');
  // 你可以添加跳转到晒单页面的逻辑，例如：
  // router.push('/share')
}

// 查看晒单记录
const viewRecords = () => {
  console.log('查看晒单记录');
  // 你可以添加跳转到晒单记录页面的逻辑，例如：
  // router.push('/share-records')
}
</script>

<style scoped>
.page {
  position: relative;
  padding: 20rpx;
  background-image: url('/static/activity/sdhl-bg.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

.activity-rules {
  position: absolute;
  width: 690rpx;
  height: 650rpx;
  top: 600rpx;
  background: #222222;
  border-radius: 40rpx;
  border: 6rpx solid;
  border-image: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)) 6 6;
  z-index: 1;
}

.activity-rule-title {
  font-family: 'AlibabaPuHuiTi', 'AlibabaPuHuiTi';
  font-weight: 400;
  font-size: 32rpx;
  color: #FFF;
  line-height: 40rpx;
  text-align: center;
  margin-top: 20rpx;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  margin-top: 80rpx;
  padding-left: 20rpx;
  padding-right: 20rpx;
}

.blue-dot {
  width: 12rpx;
  height: 12rpx;
  background: #0BB8EB;
  border-radius: 50%;
  margin-right: 15rpx;
  position: relative;
  top: 12rpx;
}

.rule-text {
  font-family: 'AlibabaPuHuiTi', 'AlibabaPuHuiTi';
  font-weight: 400;
  font-size: 32rpx;
  color: #FFF;
  line-height: 36rpx;
  word-break: break-word;
}

.highlight-text {
  font-family: 'AlibabaPuHuiTi', 'AlibabaPuHuiTi';
  font-weight: 400;
  font-size: 28rpx;
  color: #FFF100;
}

.activity-time {
  margin-top: 30rpx;
  font-size: 30rpx;
  color: #888888;
  text-align: center;
}

.activity-character {
  position: absolute;
  top: 400rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.character-img {
  width: 572rpx;
  height: 268rpx;
}

/* 按钮样式 */
.action-buttons {
  position: absolute;
  bottom: 250rpx; /* 让按钮靠近页面底部 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-around;
  width: 70%;
}

.go-share-btn, .view-records-btn {
  background-color: #0BB8EB;
  color: white;
  font-size: 30rpx;
  border: none;
  padding: 15rpx 30rpx;
  border-radius: 25rpx;
  cursor: pointer;
}

.go-share-btn:hover, .view-records-btn:hover {
  background-color: #1a9fe7;
}
</style>
