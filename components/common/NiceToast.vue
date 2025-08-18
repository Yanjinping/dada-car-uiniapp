<template>
  <view v-show="visible" class="toast" :class="type">
    <text class="msg">{{ message }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(false)
const message = ref('')
const type = ref('info')
let timer = null

function show(msg, t = 'info', duration = 1600) {
  message.value = String(msg ?? '')
  type.value = t
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), duration)
}
defineExpose({ show })
</script>

<style scoped>
.toast{
  position: fixed;
  left: 50%;
  /* ⚠️ 提高到按钮之上，避免被底部Sheet遮住 */
  bottom: calc(180rpx + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  padding: 18rpx 28rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 28rpx;
  box-shadow: 0 6rpx 18rpx rgba(0,0,0,.16);
  z-index: 5000; /* ✅ 永远在 Sheet 之上 */
  max-width: 620rpx;
  text-align: center;
  pointer-events: none; /* 不阻挡点击 */
}
.toast.success{ background: linear-gradient(180deg,#82ED71 0%, #0DB63D 100%); }
.toast.warning{ background: #F5A623; }
.toast.error{   background: #E64E37; }
.toast.info{    background: rgba(0,0,0,.78); }
.msg{ line-height: 1.1; }
</style>
