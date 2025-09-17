<template>
  <view class="titlebar" :style="{ background }">
    <view class="status" :style="{ height: statusBarPx + 'px' }"></view>

    <view class="bar">
      <!-- 左：自定义图标（点击事件统一走 onLeftTap） -->
      <view v-if="showLeft" class="hit-left" @tap="onLeftTap">
        <image v-if="leftIcon" class="left-icon" :src="leftIcon" mode="widthFix" />
        <template v-else>
          <!-- 兜底：返回箭头 -->
          <!-- #ifdef H5 || APP-PLUS -->
          <svg class="back-svg" viewBox="0 0 21 38" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 1 L2 19 L20 37" stroke="#222229" stroke-width="3.5"
                  stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
          <!-- #endif -->
          <!-- #ifdef MP -->
          <image class="back-png" src="/static/icons/back-arrow.png" mode="widthFix" />
          <!-- #endif -->
        </template>
      </view>

      <!-- 中：标题 -->
      <view class="center">
        <text class="title">{{ title }}</text>
      </view>

      <!-- 右：插槽 -->
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
  showLeft: { type: Boolean, default: true },     // 是否显示左侧热区
  leftIcon: { type: String, default: '' },        // 左侧图标地址（传入图片）
  homePath: { type: String, default: '/pages/home/index' },
  backType: { type: String as () => 'auto' | 'home' | 'back', default: 'auto' }
})

const statusBarPx = ref(20)
onMounted(() => {
  statusBarPx.value = uni.getSystemInfoSync()?.statusBarHeight || 20
})

function goHome() {
  uni.reLaunch({ url: props.homePath })
}
function goBack() {
  uni.navigateBack({ delta: 1 })
}
function onLeftTap() {
  if (!props.showLeft) return

  if (props.backType === 'home') return goHome()
  if (props.backType === 'back') return goBack()

  // auto：有历史返回，否则首页
  const pages = getCurrentPages()
  if (pages && pages.length > 1) goBack()
  else goHome()
}
</script>

<style scoped lang="scss">
.titlebar{ width:750rpx; }
.status{ width:750rpx; }
.bar{ position: relative; height: 88rpx; }

/* 左热区 */
.hit-left{
  position: absolute; left: 32rpx; top: 20rpx;
  width: 48rpx; height: 48rpx;
  display:flex; align-items:center; justify-content:center;
}
.left-icon{ width:40rpx; height:40rpx; display:block; }

/* 兜底返回箭头 */
.back-svg, .back-png{ width:21rpx; height:38rpx; display:block; }

/* 右热区 */
.hit-right{
  position: absolute; right: 32rpx; top: 20rpx;
  width: 48rpx; height: 48rpx;
  display:flex; align-items:center; justify-content:center;
}

/* 标题 */
.center{
  position:absolute; left:0; right:0; top:0; bottom:0;
  display:flex; align-items:center; justify-content:center; pointer-events:none;
}
.title{
  pointer-events:auto;
  max-width: 480rpx;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-size:36rpx; font-weight:550; color:#3D3D3D; text-align:center;
}
</style>
