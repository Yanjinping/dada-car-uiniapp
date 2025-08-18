<template>
  <view
    class="topbar-wrap"
    :class="[{ fixed, elevate }, modeClass]"
    :style="wrapStyle"
  >
    <!-- 状态栏占位（沉浸式） -->
    <view v-if="immersive" :style="{height: statusBarPx + 'px'}"></view>

    <!-- 标题栏 -->
    <view class="topbar" :style="{height: barHeight}">
      <view class="left" @tap="onBack">
        <slot name="left" v-if="$slots.left" />
        <template v-else>
          <text v-if="showBack" class="back">‹</text>
        </template>
      </view>

      <view class="center">
        <slot name="title" v-if="$slots.title" />
        <text v-else class="title">{{ title }}</text>
      </view>

<!--      <view class="right">
        <slot name="right" />
      </view> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  immersive: { type: Boolean, default: true }, // 是否顶到状态栏
  fixed: { type: Boolean, default: true },     // 吸顶
  elevate: { type: Boolean, default: false },  // 阴影
  height: { type: Number, default: 44 },       // 标题栏高度(px)
  background: { type: String, default: '#FFFFFF' }, // 纯色或渐变
  mode: { type: String as () => 'dark' | 'light', default: 'dark' },
  interceptBack: { type: Boolean, default: false }
})
const emit = defineEmits<{ (e:'back'): void }>()

const statusBarPx = ref(0)
onMounted(() => {
  const info = uni.getSystemInfoSync?.() || { statusBarHeight: 20 }
  statusBarPx.value = info.statusBarHeight || 20
})

const barHeight = computed(() => props.height + 'px')
const modeClass = computed(() => (props.mode === 'light' ? 'mode-light' : 'mode-dark'))
const wrapStyle = computed(() => ({ background: props.background }))

function onBack() {
  if (!props.showBack) return
  if (props.interceptBack) { emit('back'); return }
  if (getCurrentPages().length > 1) uni.navigateBack()
  else uni.switchTab({ url: '/pages/home/home' })
}
</script>

<style scoped lang="scss">
.topbar-wrap{
  width: 100%;
  &.fixed{ position: sticky; top: 0; left: 0; z-index: 999; }
  &.elevate{ box-shadow: 0 6rpx 20rpx rgba(0,0,0,.06); }
}
.topbar{
  display: flex; align-items: center; padding: 0 12px;
}
.left,.right{
  width: 72rpx; height: 72rpx; display:flex; align-items:center; justify-content:center;
}
.center{ flex:1; display:flex; align-items:center; justify-content:center; min-width:0; }
.title{ font-size: 36rpx; font-weight: 700; max-width:80%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.back{ font-size: 46rpx; font-weight: 700; line-height: 1; }
.mode-dark{ .title,.back{ color:#1F1F1F; } }
.mode-light{ .title,.back{ color:#0F0F0F; opacity:.95; } }
</style>
