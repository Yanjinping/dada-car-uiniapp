<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <TopNavBar title="找车地图" />

    <!-- 地图组件（封装适配小程序 & App） -->
    <MapCrossPlatform
      :latitude="latitude"
      :longitude="longitude"
      :scale="scale"
      :markers="markers"
      @markertap="onMarkerTap"
    />

    <!-- Marker 对应信息卡片 -->
    <MapMarkerCard
      v-if="currentMarker"
      :show="true"
      :info="currentMarker"
      @toDetail="goToDetail"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import TopNavBar from '@/components/TopNavBar.vue'
import MapCrossPlatform from '@/components/MapCrossPlatform.vue'
import MapMarkerCard from '@/components/MapMarkerCard.vue'

const latitude = ref(24.9)
const longitude = ref(118.6)
const scale = ref(16)

const markers = ref([
  { id: 1, latitude: 24.9, longitude: 118.6, title: '仰恩大学', iconPath: '/static/marker.png' },
  { id: 2, latitude: 24.89, longitude: 118.61, title: '泉州师院', iconPath: '/static/marker.png' }
])

const currentMarker = ref(null)

function onMarkerTap(e) {
  const markerId = e.detail.markerId || e.detail.markerid
  const marker = markers.value.find(m => m.id === markerId)
  if (marker) currentMarker.value = marker
}

function goToDetail(info) {
  uni.navigateTo({
    url: `/pages/lease/detail?id=${info.id}`
  })
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
