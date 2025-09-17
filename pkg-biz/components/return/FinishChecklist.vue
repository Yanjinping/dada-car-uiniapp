<template>
  <view class="wrap">
    <view class="title">支付成功</view>

    <view class="li" v-for="(t,i) in tips" :key="i">
      <image class="ok" src="/static/icons/queren.png" mode="aspectFit" />
      <text class="txt">{{ t }}</text>
    </view>
  </view>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  tips: {
    type: Array,
    default: () => [
      '请确认车辆停放在指定位置',
      '请确认汽车已熄火',
      '请确认关闭所有车灯、车门和窗户',
	  '到下一个页面晒单可获得额外优惠券奖励'
    ]
  }
})
// ✅ 正确拿到响应式 props
const { tips } = toRefs(props)
</script>

<style scoped>
.wrap{
  padding: 30rpx 36rpx 0;
  background: #FFFFFF;
}

/* 标题：40rpx/500/#222 + 渐变下划线 */
.title{
  position: relative;
  width: 170rpx;
  height: 54rpx;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 600;
  font-size: 40rpx;
  color: #222222;
  line-height: 54rpx;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin: 12rpx 0 36rpx;
}
.title::after{
  content: '';
  position: absolute;
  left: 10rpx;
  bottom: -6rpx;
  width: 180rpx;
  height: 16rpx;
  background: linear-gradient(90deg, #8AF1A5 0%, rgba(255,255,255,0) 100%);
  /* background: linear-gradient(270deg, #8AF1A5 0%, rgba(255,255,255,0) 100%); */
}

/* 列表项：图标 40rpx + 文字 32rpx/#F66700/行高36rpx */
.li{
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 24rpx 0;
}
.ok{
  width: 40rpx;
  height: 40rpx;
  flex: 0 0 40rpx;
}
.txt{
  width: 616rpx;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 520;
  font-size: 32rpx;
  color: #F66700;
  line-height: 36rpx;
  text-align: left;
  padding-top: 20rp;
}
</style>
