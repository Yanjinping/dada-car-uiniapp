<template>
  <view v-if="visible" class="mask" @tap="close">
    <view class="sheet" @tap.stop>
      <view class="title">奖励规则</view>
      <view class="content">
        <view v-for="(t,i) in rules" :key="i" class="li">{{ i+1 }}. {{ t }}</view>
      </view>
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
.mask{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:9999;}
.sheet{ width:88%; border-radius:24rpx; background:#fff8f0; padding:28rpx 24rpx 20rpx; }
.title{ font-size:36rpx; font-weight:900; text-align:center; margin-bottom:10rpx;}
.content{ background:#fff; border-radius:16rpx; padding:20rpx; max-height:55vh; overflow:auto;}
.li{ font-size:28rpx; color:#333; line-height:1.8;}
.btn{ margin-top:20rpx; height:86rpx; line-height:86rpx; border-radius:999rpx; background:linear-gradient(180deg,#FFA24A,#FF7E24); color:#fff; font-size:30rpx;}
</style>
