<template>
  <!-- 顶部导航 -->
  <TitleBar title="驾驶员认证" background="#FFFFFF" />

  <view class="page">
    <StepperBar :step="3" />

    <view class="title">驾驶证信息</view>
    <view class="sub">请保证证件完整、字体清晰、亮度均匀</view>

    <!-- 上传驾驶证 -->
    <OcrDrivingUploader v-model="auth.license" />

    <view class="label">上传机动车驾驶证</view>

    <NoticeBar />

    <!-- 底部按钮 -->
    <view class="bottom">
      <button
        class="primary"
        type="default"
        :class="{ enabled: canSubmit }"
        :disabled="!canSubmit || submitting"
        @click="submit"
      >
        {{ canSubmit ? (submitting ? '提交中...' : '认证成功，开始用车') : '驾驶员认证' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import StepperBar from '../../components/auth/StepperBar.vue'
import NoticeBar from '../../components/auth/NoticeBar.vue'
import OcrDrivingUploader from '../../components/OcrDrivingUploader.vue'
import { useAuthFlow } from '../../stores/useAuthFlow'
import TitleBar from '@/components/header/TitleBar.vue'

const auth = useAuthFlow()
const submitting = ref(false)

// ✅ 判定更稳：大小写统一，避免因 'SUCCESS' / 'success' 卡住
const canSubmit = computed(() => {
  const state = String(auth.license?.state || '').toLowerCase()
  return !!(auth.license?.drivingType && auth.license?.idNumber && state === 'success')
})

// 若未完成上一步（人脸认证），重定向
onShow(() => {
  if (!auth.canNextFromFace) {
    uni.reLaunch({ url: '/pkg-auth/pages/auth/face' })
  }
})

// 提交认证
async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    await auth.doSubmit()
    uni.showToast({ title: '认证成功', icon: 'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/home/index' }), 800)
  } catch (e) {
    uni.showToast({ title: e?.message || '认证失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page { padding: 30rpx; background: #FFFFFF; }

/* 标题 */
.title {
  position: relative;
  margin: 48rpx 0 8rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 600;
  font-size: 40rpx;
  line-height: 54rpx;
  color: #222;
  text-align: left;
}
.title::after {
  content: '';
  position: absolute;
  left: 10rpx;
  bottom: -3rpx;
  width: 180rpx;
  height: 16rpx;
  background: linear-gradient(90deg, #8AF1A5 0%, rgba(255,255,255,0) 100%);
}

/* 副标题 */
.sub {
  margin: 24rpx 0;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #AAA;
}

/* 小标签 */
.label {
  width: 550rpx;
  margin: 12rpx auto 28rpx;
  font-size: 28rpx;
  line-height: 38rpx;
  color: #444;
  text-align: center;
}

/* 底部按钮 */
.bottom { margin-top: 28rpx; display: flex; justify-content: center; }
.primary {
  width: 688rpx; height: 96rpx; border-radius: 48rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; font-weight: 550;
  background: #A9E4B2; color: #fff;
}
.primary.enabled {
  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%);
}
.primary[disabled] {
  background: #A9E4B2;
  color: #fff;
  opacity: 1;
}
</style>
