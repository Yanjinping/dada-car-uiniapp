<template>
  <view class="card" @click="onClick">
    <image v-if="img" :src="img" class="img" mode="aspectFill" />
    <view v-else class="placeholder"><slot name="placeholder">点击上传</slot></view>

<!-- 覆盖层：只在失败时显示 -->
<view v-if="state === 'fail'" class="overlay">
  <text>识别失败，请重新上传</text>
</view>

  </view>
</template>

<script setup>
const props = defineProps({
  img:   { type: String, default: '' },
  state: { type: String, default: 'idle' } // idle|success|fail
})
const emit = defineEmits(['click'])
const onClick = () => emit('click')
</script>

<style scoped>
.card{position:relative;border-radius:24rpx;overflow:hidden;background:#f6f7fb}
.img{width:100%;height:360rpx;display:block}
.placeholder{height:360rpx;display:flex;align-items:center;justify-content:center;color:#999}
.overlay{position:absolute;left:0;right:0;bottom:0;height:96rpx;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:30rpx}
</style>
