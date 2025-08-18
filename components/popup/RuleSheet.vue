<template>
  <view v-if="visible" class="mask" @tap="close">
    <view class="sheet" @tap.stop>
      <view class="hd">
        <text class="title">{{ title }}</text>
        <text class="close" @tap="close">✕</text>
      </view>
      <scroll-view scroll-y class="body">
        <text class="content">{{ content }}</text>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: Boolean, title: String, content: String
})
const emit = defineEmits(['update:visible','close'])
function close(){ emit('update:visible', false); emit('close') }
</script>

<style scoped>
.mask{ position:fixed; left:0; top:0; right:0; bottom:0; background: rgba(0,0,0,.45); display:flex; align-items:flex-end; }
.sheet{ width:100%; max-height: 70vh; background:#fff; border-top-left-radius: 24rpx; border-top-right-radius: 24rpx; }
.hd{ display:flex; align-items:center; padding: 24rpx; }
.title{ font-size: 30rpx; font-weight: 600; }
.close{ margin-left:auto; font-size: 36rpx; }
.body{ max-height: 56vh; padding: 0 24rpx 24rpx; }
.content{ font-size: 26rpx; color:#666; white-space: pre-wrap; }
</style>
