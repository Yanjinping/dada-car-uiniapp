<template>
  <view class="rate" :style="{ gap: gap + 'rpx' }">
    <image v-for="i in count" :key="i"
      class="star"
      :src="i <= modelValue ? fullIcon : emptyIcon"
      :style="{ width: size + 'rpx', height: size + 'rpx' }"
      mode="aspectFit"
      @tap="tap(i)"
    />
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 4 },
  count: { type: Number, default: 5 },
  size: { type: Number, default: 40 }, // 图中星星约40rpx
  gap: { type: Number, default: 24 },
  fullIcon: { type: String, default: '/static/icons/star-full.png' },
  emptyIcon: { type: String, default: '/static/icons/star-empty.png' }
})
const emit = defineEmits(['update:modelValue','change'])
const tap = i => { emit('update:modelValue', i); emit('change', i) }
</script>

<style scoped>
.rate{ display:flex; align-items:center; }
.star{ display:block; }
</style>
