<template>
  <view class="seg">
    <view
      v-for="it in items"
      :key="it.key"
      :class="['tab', modelValue===it.key && 'on']"
      @tap="onChange(it.key)"
    >
      <text class="label">{{ it.text }}</text>

      <!-- 选中态：下圆弧（不是横条） -->
      <view v-if="modelValue===it.key" class="smile"></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  active: String,
  modelValue: String
})
const emit = defineEmits(['change','update:active','update:modelValue'])

const modelValue = computed({
  get: () => props.active ?? props.modelValue,
  set: (v) => {
    emit('update:active', v)
    emit('update:modelValue', v)
    emit('change', v)
  }
})
function onChange(k){ modelValue.value = k }
</script>

<style scoped>
/* 更紧凑、贴蓝湖 */
.seg{
  height: 88rpx;            /* 放在渐变底部更好对齐 */
  display:flex; align-items:flex-end;
  gap: 40rpx;
  padding: 0 24rpx;
}
.tab{
  position: relative;
  padding-bottom: 10rpx;
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 450;           /* 未选中 = 常规 */
  font-size: 36rpx;
  color: #FFFFFF;             /* 未选中 = 白色 */
  line-height: 43rpx;
  letter-spacing: 1px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  opacity: 0.85;
}
.tab.on {
  font-weight: 550;           /* 选中 = 半粗 */
  font-size: 40rpx;
  line-height: 48rpx;
  opacity: 1;
}

/* 微笑线：用下半圆的边框实现，非横条 */
.smile{
  width: 80rpx; /* 宽度可按需要调，比如 60~100rpx */
  height: 10rpx; /* 高度影响弧度的扁平程度 */
  margin: 4rpx auto 0;
  background: url('@/static/benefit/yuanhu.png') no-repeat center bottom;
  background-size: contain;
transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    /* 漂浮动画 */
 animation: floatSmile 2.5s ease-in-out infinite;
}
/* 根据选中tab的index调整位置 */
.smile.tab0 { transform: translateX(0); }
.smile.tab1 { transform: translateX(150rpx); }
.smile.tab2 { transform: translateX(300rpx); }
/* 上下漂浮 + 轻微缩放的动画 */
@keyframes floatSmile {
  0%   { transform: translate(0,0) scale(1); }
  25%  { transform: translate(-2rpx,-2rpx) scale(1.03); }
  50%  { transform: translate(0,-4rpx) scale(1.05); }
  75%  { transform: translate(2rpx,-2rpx) scale(1.03); }
  100% { transform: translate(0,0) scale(1); }
}
</style>
