<template>
  <view class="actions">
    <button v-if="more" class="mini" @tap="$emit('more')">···</button>
    <button v-if="scan" class="mini" @tap="$emit('scan')">◎</button>
  </view>
</template>

<script setup>
defineProps({ more: Boolean, scan: Boolean })
</script>

<style scoped>
.actions{ position:absolute; right:24rpx; top:16rpx; display:flex; gap:16rpx; }
.mini{ height: 64rpx; min-width: 120rpx; border-radius: 32rpx; background: rgba(255,255,255,.35); }
</style>
