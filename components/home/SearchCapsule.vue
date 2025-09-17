<template>
  <view class="search-capsule">
    <view class="loc-wrap" @click="$emit('pick-city')">
      <text class="loc-txt green">{{ locationName }}</text>
      <view class="loc-split"></view>
    </view>
    <view class="search-body" @click="$emit('search')">
      <text class="search-ph">搜索网点名称、车型</text>
    </view>
    <image class="search-ico" src="/static/home/search-lv.png" mode="widthFix" />
  </view>
</template>

<script setup>
defineProps({ locationName: { type: String, default: '定位中…' } })
</script>

<style scoped>
.search-capsule{height:80rpx;margin:16rpx 20rpx;background:rgba(255,255,255,.72);border-radius:40rpx;display:flex;align-items:center;padding:0 20rpx;box-shadow:0 6rpx 16rpx rgba(31,161,97,.07);backdrop-filter:blur(6rpx)}
.loc-wrap{display:flex;align-items:center;max-width:60%}
.loc-txt{height:38rpx;line-height:38rpx;font-size:28rpx;white-space:nowrap;overflow:hidden;flex-shrink:1;min-width:0}
.green{color:#14B940}
.loc-split{width:22rpx;border-top:2rpx solid #14B940;margin:0 10rpx;transform:rotate(90deg);opacity:.6}
.search-body{flex:1;display:flex;align-items:center;justify-content:flex-start;padding-left:12rpx;padding-right:48rpx;min-width:0}
.search-ph{height:38rpx;line-height:38rpx;font-size:28rpx;color:#7EC390;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left}
.search-ico{position:absolute;right:20rpx;top:22rpx;width:36rpx;height:36rpx}
</style>
