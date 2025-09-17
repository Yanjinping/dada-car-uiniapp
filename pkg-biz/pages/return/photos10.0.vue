<!-- pages/return/photos.vue -->
<template>
  <view class="page">
    <view class="hero">
      <TitleBar title="还车照片" background="transparent" />
      <StepBar :current="1" />
    </view>

    <!-- 打开抽屉（可默认就打开） -->
    <ReturnPhotosSheet
      :visible="visible"
      mode="return"
      snap="twoThirds"
      :initialRatio="0.66"
      :closeOnMask="false"
      cancelAction="back"
      @submit="onSubmitPhotos"
      @close="onClose"
    />
  </view>
</template>

<script setup>
import TitleBar from '@/components/header/TitleBar.vue'
import StepBar from '../../components/return/StepBar.vue'
import ReturnPhotosSheet from '../../components/return/ReturnPhotosSheet.vue'
import { ref } from 'vue'

const visible = ref(true)

function onSubmitPhotos(urls){
  // 1) 上传/落库照片（建议后端返回一个 settleToken）
  // TODO: await api.uploadReturnPhotos({ orderNum, photos: urls })

  // 2) 跳到第2步并携带必要的上下文（orderNum/settleToken）
  uni.navigateTo({ url: '/pages/return/pay?orderNum=123456&settleToken=abc' })
}

function onClose(){ visible.value = false }
</script>

<style scoped>
.page{min-height:100vh;background:#f6f7f9}
.hero{padding-bottom:10rpx;background:linear-gradient(180deg,#e8fff1,#f6f7f9)}
</style>
