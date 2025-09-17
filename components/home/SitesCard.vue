<template>
  <view class="sites-card">
    <!-- 标题行 -->
    <view class="sites-hd">
      <image class="shu" src="/static/home/shu.png" />
      <text class="sites-title">常用网点</text>
    </view>

    <!-- 有数据时 -->
    <view v-if="sites.length">
      <view
        class="sites-row"
        v-for="s in sites"
        :key="s.id"
        @tap="$emit('tap', s)"
      >
        <image class="map-ico" src="/static/home/map.png" />
        <text class="site-name one-line">{{ s.name }}</text>
      </view>
    </view>

    <!-- 无数据时（示例展示三条） -->
    <view v-else>
      <view class="sites-row grad">
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
</template>

<script setup>
defineProps({ sites: { type: Array, default: () => [] } })
</script>

<style scoped>
/* 单行省略 */
.one-line {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 外层卡片 */
.sites-card {
  width: 710rpx;
  min-height: 368rpx;
  margin: 16rpx auto 0;
  background: #ffffff;
  border-radius: 32rpx;
  padding-bottom: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
}

/* 标题行 */
.sites-hd {
  width: 692rpx;
  height: 68rpx;
  margin: 12rpx auto 0;
  display: flex;
  align-items: center;
}
.shu {
  width: 8rpx;
  height: 36rpx;
  margin-right: 12rpx;
}
.sites-title {
  height: 44rpx;
  line-height: 44rpx;
  font-weight: 700;
  font-size: 32rpx;
  color: #1e1e1e;
}

/* 列表项 */
.sites-row {
  width: 670rpx;
  height: 76rpx;
  margin: 14rpx auto 0;
  border-radius: 38rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  background: #ffffff;
  border: 2rpx solid #f0f5f3;
  box-sizing: border-box;
}
.sites-row.grad {
  background: linear-gradient(270deg, #f7fff6 0%, #f4fcf8 100%);
  border: none;
}

.map-ico {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}
.site-name {
  flex: 1;
  height: 36rpx;
  line-height: 38rpx;
  font-weight: 500;
  font-size: 28rpx;
  color: #444444;
}
</style>
