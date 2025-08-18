<template>
  <view class="container">
    <view class="header">用车晒单</view>
    <textarea v-model="content" placeholder="分享你的用车体验..." maxlength="200" />
    <button class="btn-submit" @click="submitShare">提交晒单</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const content = ref('')

function submitShare() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请输入晒单内容', icon: 'none' })
    return
  }
  // TODO: 调用晒单提交接口
  uni.showToast({ title: '晒单成功，感谢分享！' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style scoped>
.container {
  padding: 20px;
}
.header {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
textarea {
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  height: 150px;
  padding: 10px;
  font-size: 14px;
  resize: none;
  margin-bottom: 20px;
}
.btn-submit {
  background: #409eff;
  color: white;
  padding: 10px;
  border-radius: 8px;
  width: 100%;
}
</style>
