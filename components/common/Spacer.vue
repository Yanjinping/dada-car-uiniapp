<template>
  <!-- 竖向占位默认 24rpx；横向占位传 vertical=false -->
  <view
    :style="styleObj"
    class="spacer"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: [Number, String], default: 24 },   // rpx
  vertical: { type: Boolean, default: true },      // true=竖向高度占位；false=横向宽度占位
})

const n = computed(() => Number(props.size) || 0)
const styleObj = computed(() => props.vertical
  ? { height: `${n.value}rpx`, width: '100%' }
  : { width: `${n.value}rpx`, height: '1rpx', display: 'inline-block' }
)
</script>

<style scoped>
.spacer { display:block; }
</style>
