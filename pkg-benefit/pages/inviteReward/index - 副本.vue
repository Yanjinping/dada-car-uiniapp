<template>
  <!-- 标题栏 -->
  <TitleBar title="晒单好礼" background="transparent" :show-left="true" />

  <view class="page">
    <!-- 活动规则部分 -->
    <view class="activity-rules">
      <!-- 活动规则背景图 -->
      <image class="rule-image" :src="require('/static/activity/hdg.png')" />
      <view class="rule-content">
        <text class="title">#活动规则#</text>
        <text class="rule-text">
          在活动期间，使用嗒嗒用车完成出行后，将你的用车体验截图或文字分享到指定微信群，并附上你的点评。
          每次晒单，你将获得一张10元晒单返券，满20元即可使用，优惠券将在次日12点前发放到账，有效期7天。每人每周最多可享受2次晒单返券机会，快来分享你的出行故事，赚取优惠券吧！
        </text>
      </view>
    </view>

    <!-- 活动时间 -->
    <view class="event-time">
      <text class="time-text">活动时间: 2025.8.20 - 2025.12.31</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import TitleBar from '@/components/header/TitleBar.vue'; // 假设 TitleBar 组件在 components 文件夹内

// 数据和方法，如果需要动态更新，可以在此定义
const bannerText = ref('晒晒狂欢季');
const offerText = ref('微信群晒单立得10元优惠券');
const activityRules = ref(`
  在活动期间，使用嗒嗒用车完成出行后，将你的用车体验截图或文字分享到指定微信群，并附上你的点评。
  每次晒单，你将获得一张10元晒单返券，满20元即可使用，优惠券将在次日12点前发放到账，有效期7天。每人每周最多可享受2次晒单返券机会，快来分享你的出行故事，赚取优惠券吧！
`);
const eventTime = ref('活动时间: 2025.8.20 - 2025.12.31');
</script>

<style scoped>
.page {
  padding: 20rpx;
  background-image: url('/static/activity/sdhl-bg.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

.activity-rules {
  position: relative;
  background-color: rgba(255, 255, 255, 0.8);
  margin-top: 30rpx;
  padding: 30rpx;
  border-radius: 15rpx;
}

.activity-rules .rule-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 180rpx;
  object-fit: cover;
  z-index: -1; /* 使背景图位于内容下方 */
}

.activity-rules .rule-content {
  position: relative;
  z-index: 1;
}

.activity-rules .title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-top: 220rpx;
}

.activity-rules .rule-text {
  margin-top: 20rpx;
  font-size: 30rpx;
  color: #666;
}

.event-time {
  margin-top: 30rpx;
  font-size: 30rpx;
  color: #888;
}
</style>
