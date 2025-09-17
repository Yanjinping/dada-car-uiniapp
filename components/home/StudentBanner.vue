<template>
  <view v-if="!certified" class="stu-banner" @tap="$emit('go-cert')">
    <view class="left">
      <image class="hb-ico" src="/static/home/icon-2.png" />
      <text class="stu-txt">大学生认证立减20元</text>
    </view>

    <image class="cb-arrow" src="/static/icons/xuanze.png" mode="widthFix" />

  </view>
</template>

<script setup>
defineProps({ certified: { type: Boolean, default: false } })
</script>

<style scoped>
/* 与“推荐用车”同宽对齐、层级在上方 */
.stu-banner{
  width: 710rpx;
  height: 92rpx;
  margin: 16rpx auto 0;
  border-radius: 24rpx 24rpx 0 0;
  background: linear-gradient(180deg, rgba(237,255,254,.6) 0%, rgba(255,255,255,.4) 100%);
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.06);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20rpx; box-sizing: border-box;
  position: relative; z-index: 1;
}

.left{ display:flex; align-items:center; }
.hb-ico{ width:36rpx; height:36rpx; margin-right:12rpx; }
.stu-txt{ font-size:32rpx; line-height:44rpx; color:#00BD7B; font-weight:600; }
.cb-arrow {
  width: 36rpx;
  height: 36rpx;
}
</style>
