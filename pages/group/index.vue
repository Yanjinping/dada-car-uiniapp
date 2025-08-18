<template>
  <view class="group-container">
    <!-- 群头图 Banner -->
    <u-image src="/static/group-banner.png" width="100%" height="160rpx" radius="8" mode="aspectFill" />

    <!-- 欢迎标题 -->
    <view class="title">
      🎉 加入「仰恩大学车友群」，抢红包赢福利！
    </view>

    <!-- 二维码展示区 -->
    <view class="qrcode-area">
      <u-image src="/static/group-qrcode.jpg" width="220rpx" height="220rpx" radius="8" />
      <text class="desc">长按识别二维码，加入车友群</text>
    </view>

    <!-- 群内福利说明 -->
    <view class="section">
      <view class="section-title">👥 群内福利</view>
      <view class="section-item">🎁 每日红包雨，限时掉券</view>
      <view class="section-item">📸 晒单抽奖，积分兑换饮品</view>
      <view class="section-item">🧑‍💻 运营小姐姐在线答疑</view>
      <view class="section-item">🚗 网点调整提前通知</view>
    </view>

    <!-- 操作区 -->
    <view class="action-area">
      <u-button type="success" @click="onCopyCode">复制群暗号</u-button>
      <view class="hint-text">进群后发送“仰恩嗒嗒出行”获得新人券</view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'

const onCopyCode = () => {
  uni.setClipboardData({
    data: '仰恩嗒嗒出行',
    success() {
      uni.showToast({ title: '暗号已复制', icon: 'success' })
    }
  })
}

onLoad(() => {
  // 可接入埋点，如：记录进入 group 页面次数
  console.log('进入车友群介绍页')
})
</script>

<style scoped>
.group-container {
  padding: 24rpx;
  background: #f5f6fa;
}
.title {
  margin: 24rpx 0 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.qrcode-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20rpx 0;
}
.desc {
  margin-top: 12rpx;
  color: #666;
  font-size: 26rpx;
}
.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 20rpx 0;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
  color: #222;
}
.section-item {
  font-size: 26rpx;
  margin-bottom: 10rpx;
  color: #444;
}
.action-area {
  margin-top: 30rpx;
  text-align: center;
}
.hint-text {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
