<template>
  <view class="titlebar" :style="{ background }">
    <view class="status" :style="{ height: statusBarPx + 'px' }"></view>

    <view class="bar">
      <!-- 左：返回（32 左边距，48×48 热区） -->
      <view v-if="showBack" class="hit-left" @tap="onBack">
        <!-- H5 / App 用 SVG -->
        <!-- #ifdef H5 || APP-PLUS -->
        <svg class="back-svg" viewBox="0 0 21 38" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 1 L2 19 L20 37" stroke="#222229" stroke-width="3.5"
                stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
        <!-- #endif -->
        <!-- 小程序兜底 PNG -->
        <!-- #ifdef MP -->
        <image class="back-png" src="/static/icons/back-arrow.png" mode="widthFix" />
        <!-- #endif -->
      </view>

      <!-- 中：标题（真正居中） -->
      <view class="center">
        <text class="title">{{ title }}</text>
      </view>

      <!-- 右：48×48 热区（可留空） -->
      <view class="hit-right">
        <slot />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const props = defineProps({
  title: { type: String, default: '标题' },
  background: { type: String, default: '#FFFFFF' },
  showBack: { type: Boolean, default: true }
})
const statusBarPx = ref(20)
onMounted(() => { statusBarPx.value = uni.getSystemInfoSync()?.statusBarHeight || 20 })
function onBack () {
  if (!props.showBack) return
  if (getCurrentPages().length > 1) uni.navigateBack()
  else uni.navigateTo({ url: '/pages/home/home' })
}
</script>

<style scoped lang="scss">
.titlebar{ width:750rpx; }
.status{ width:750rpx; }

/* 标题栏主体：88rpx 高，采用绝对定位保证中间标题真正居中 */
.bar{
  position: relative;
  height: 88rpx;
}

/* 左热区：32 左边距，48×48，垂直居中 => top:(88-48)/2 = 20 */
.hit-left{
  position: absolute; left: 32rpx; top: 20rpx;
  width: 48rpx; height: 48rpx;
  display:flex; align-items:center; justify-content:center;
  background: rgba(255,255,255,0.0001);
}

/* 右热区：32 右边距，同尺寸 */
.hit-right{
  position: absolute; right: 32rpx; top: 20rpx;
  width: 48rpx; height: 48rpx;
  display:flex; align-items:center; justify-content:center;
  background: rgba(255,255,255,0.0001);
}

/* 返回箭头尺寸：21×38rpx */
.back-svg, .back-png{ width:21rpx; height:33rpx; display:block; }

/* 中心标题：不受左右影响，真正居中 */
.center{
  position:absolute; left:0; right:0; top:0; bottom:0;
  display:flex; align-items:center; justify-content:center; pointer-events:none;
}
.title{
  pointer-events:auto;
  max-width: 480rpx; /* 防止特别长溢出，可按需调整 */
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-family: AlibabaPuHuiTi, "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  font-weight: 550; font-size: 36rpx; line-height: 50rpx; color:#3D3D3D;
  text-align:center;
}
</style>
