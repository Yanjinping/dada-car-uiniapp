<template>
  <view v-if="visible" class="mask" @tap="close">
    <view class="sheet" @tap.stop>
      <!-- 标题 -->
      <view class="title">奖励规则</view>

      <!-- 内容 -->
      <view class="content">
        <view v-for="(t,i) in rules" :key="i" class="li">{{ i+1 }}. {{ t }}</view>
      </view>

      <!-- 按钮 -->
      <button class="btn" @tap="close">我知道了</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  visible: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:visible'])
const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})
function close(){ visible.value = false }
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 弹窗主体：渐变背景 + 圆角 */
.sheet {
  width: 650rpx;
  min-height: 910rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, #FFECDD 0%, #FFFFFF 100%);
  padding: 40rpx 36rpx 36rpx;
  box-sizing: border-box;
}

/* 标题 */
.title {
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 600;
  font-size: 44rpx;
  color: #222229;
  line-height: 48rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

/* 内容区 */
.content {
	
  border-radius: 16rpx;
  padding: 24rpx;
  max-height: 55vh;
  overflow-y: auto;
}
.li {
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 500;
  font-size: 32rpx;
  color: #000000;
  line-height: 56rpx;
  margin-bottom: 8rpx;
}

/* 底部按钮 */
.btn {
  margin-top: 40rpx;
  width: 550rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(360deg, #F66600 0%, #FD9A3D 100%);
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 500;
  font-size: 40rpx;
  color: #FFFFFF;
  line-height: 96rpx;
  text-align: center;
}
</style>
