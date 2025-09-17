<template>
  <view class="map-container">
    <map
      v-if="isMp"
      class="map"
      :longitude="longitude"
      :latitude="latitude"
      :scale="scale"
      :markers="markers"
      show-location
      enable-3D="true"
      @markertap="$emit('markertap', $event)"
    />
    <view v-else class="placeholder">
      <text>APP端地图暂未配置，敬请期待~</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 传入参数：经纬度、缩放级别、标记点数组
const props = defineProps({
  longitude: {
    type: Number,
    required: true,
    default: 113.324520,
  },
  latitude: {
    type: Number,
    required: true,
    default: 23.099994,
  },
  scale: {
    type: Number,
    default: 14,
  },
  markers: {
    type: Array,
    default: () => [],
  },
})

// 判断当前运行平台是否小程序
// 这里用uni-app内置变量判断平台，非uni-app项目需要自己调整
const isMp = computed(() => {
  // #ifdef MP
  return true
  // #endif
  // #ifndef MP
  return true
  // #endif
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
}
.map {
  width: 100%;
  height: 100%;
}
.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}
</style>
