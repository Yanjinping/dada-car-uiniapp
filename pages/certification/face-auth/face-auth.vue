<template>
  <view class="page">
    <view v-if="loading" class="loading-box">
      <text class="loading-text">正在加载认证页面...</text>
    </view>
    <web-view v-else :src="url" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getVerifyToken } from '@/api/user'

const url = ref('')
const loading = ref(true)
const userId = uni.getStorageSync('userId')

onLoad(async () => {
  if (!userId) {
    uni.showToast({ title: '用户未登录', icon: 'none' })
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }

  try {
    const res = await getVerifyToken({
      planId: '24041',
      successUrl: `http://localhost:8081/pages/certification/face-auth/success?userId=${userId}`,
      failedUrl: `http://localhost:8081/pages/certification/face-auth/fail?userId=${userId}`
    })

    const token = res.data
    if (!token) throw new Error("认证 token 获取失败")

    url.value = `https://brain.baidu.com/face/print/?token=${token}`
  } catch (e) {
    console.error("获取认证链接失败:", e)
    uni.showToast({ title: '认证初始化失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
}
.loading-box {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loading-text {
  font-size: 32rpx;
  color: #999;
}
</style>
