<template>
  <view v-if="visible" class="mask" @tap="close">
    <view class="sheet" @tap.stop>
      <view class="poster">
        <image class="bg" src="/static/poster-bg.png" mode="widthFix" />
        <view class="title">{{ title }}</view>
        <view class="subtitle">{{ subtitle }}</view>
        <image class="qrcode" :src="qrcode" mode="aspectFit" />
        <view class="tip">长按扫码跟我一起上车</view>
        <image class="brand" src="/static/logo-dada.png" mode="widthFix" />
      </view>

      <button class="btn save" @tap="onSave">保存海报</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  visible: { type: Boolean, default: false },
  qrcode: { type: String, default: '' },
  title: { type: String, default: '我在嗒嗒赚现金' },
  subtitle: { type: String, default: '快来扫码跟我一起赚~！' }
})
const emit = defineEmits(['update:visible', 'save'])

const visible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})

function close(){ visible.value = false }

function onSave(){
  // 下载到本地再保存相册
  uni.downloadFile({
    url: props.qrcode,
    success: ({ tempFilePath }) => {
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => { uni.showToast({ title: '已保存到相册' }); emit('save') },
        fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
      })
    },
    fail: () => uni.showToast({ title: '下载失败', icon: 'none' })
  })
}
</script>

<style scoped>
.mask{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:9999;}
.sheet{ width:90%; border-radius:24rpx; background:linear-gradient(180deg,#FFE4C7,#FFD79A); padding:24rpx 24rpx 30rpx;}
.poster{ position:relative; border-radius:20rpx; background:#fff; padding:24rpx; overflow:hidden;}
.bg{ position:absolute; inset:0; opacity:.08;}
.title{ font-size:40rpx; font-weight:900; text-align:center; margin-top:8rpx;}
.subtitle{ font-size:32rpx; color:#ff4b4b; text-align:center; margin:8rpx 0 12rpx;}
.qrcode{ width:460rpx; height:460rpx; margin:14rpx auto 10rpx; display:block;}
.tip{ text-align:center; color:#666; font-size:24rpx; margin-bottom:14rpx;}
.brand{ width:160rpx; margin:0 auto 6rpx; display:block;}
.btn.save{ margin-top:18rpx; height:90rpx; line-height:90rpx; border-radius:999rpx; background:linear-gradient(90deg,#A7FF59,#44D400); color:#174a00; font-weight:800; font-size:32rpx;}
</style>
