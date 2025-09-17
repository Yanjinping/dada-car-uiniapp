<template>
  <!-- 顶部导航（自定义） -->
  <TitleBar title="实名认证" background="#FFFFFF" />

  <view class="page">
    <StepperBar :step="2" />

    <view class="title">人脸照片</view>
    <view class="sub">请使用前置摄像头拍摄，保证光线充足、照片清晰</view>

    <!-- 人脸上传组件：双向绑定到 store -->
    <FaceUploader
      v-model="auth.face"
      :idCardNumber="auth.idFront.idNumber"
      :realName="auth.idFront.realName"
    />

    <view class="label">上传人脸照片</view>

    <!-- 拍摄须知：仅在尚不可下一步时显示 -->
    <view class="tips" v-if="!canNext">
      <view class="tips-hd">拍摄须知</view>
      <view>· 请正对前置摄像头</view>
      <view>· 请勿遮挡脸部</view>
      <view>· 请保证光线充足</view>
      <view>· 请确保本人亲自拍摄</view>
    </view>

    <NoticeBar />

    <!-- 底部按钮 -->
    <view class="bottom">
      <button
        class="primary"
        type="default"
        :class="{ enabled: canNext }"
        :disabled="!canNext"
        @click="goNext"
      >
        {{ canNext ? '实名认证成功，下一步驾驶员认证' : '实名认证' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import StepperBar from '../../components/auth/StepperBar.vue'
import NoticeBar from '../../components/auth/NoticeBar.vue'
import FaceUploader from '../../components/FaceUploader.vue'
import { useAuthFlow } from '../../stores/useAuthFlow'
import TitleBar from '@/components/header/TitleBar.vue'

const auth = useAuthFlow()

// 是否可进入下一步：由 store 的健壮 getter 决定（state 小写化 + verified 真值）
const canNext = computed(() => auth.canNextFromFace)

// 进入该页前：必须完成上一步（身份证）
onShow(() => {
  if (!auth.canNextFromId) {
    uni.reLaunch({ url: '/pkg-auth/pages/auth/idcard' })
  }
})

function goNext() {
  if (!canNext.value) return
  auth.step = 3
  uni.navigateTo({ url: '/pkg-auth/pages/auth/license' })
}
</script>

<style scoped>
.page{ padding: 30rpx; background:#fff; }

/* H1 标题：加粗 + 渐变下划线（右移 12rpx） */
.title{
  position: relative;
  width: 210rpx; height: 54rpx;
  margin: 48rpx 0 8rpx;
  font-family:'AlibabaPuHuiTi',sans-serif;
  font-weight:600; font-size:40rpx; line-height:54rpx;
  color:#222; text-align:left;
}
.title::after{
  content:''; position:absolute; left:10rpx; bottom:-3rpx;
  width:180rpx; height:16rpx;
  background: linear-gradient(90deg,#8AF1A5 0%, rgba(255,255,255,0) 100%);
}

/* 副文 */
.sub{
  width: 580rpx; height:36rpx; margin:24rpx 0;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight:400; font-size:26rpx; line-height:36rpx;
  color:#AAA; text-align:left;
}

/* 标签与须知 */
.label{
  width:550rpx; margin:12rpx auto 22rpx;
  font-size:28rpx; line-height:38rpx; color:#444; text-align:center;
}
.tips{ width:550rpx; margin:8rpx auto 24rpx; color:#333; line-height:1.9; }
.tips-hd{ font-weight:600; margin-bottom:6rpx; }

/* 底部按钮，与前页保持一致 */
.bottom{ margin-top: 28rpx; display:flex; justify-content:center; }
.primary{
  width:688rpx; height:96rpx; border-radius:48rpx;
  display:flex; align-items:center; justify-content:center;
  font-family:'AlibabaPuHuiTi',sans-serif;
  font-weight:550; font-size:32rpx; line-height:54rpx;
  border:none !important; -webkit-appearance:none; padding:0; overflow:hidden;
  background:#A9E4B2 !important; color:#fff !important;
}
.primary::after{ border:none !important; }
.primary[disabled]{ background:#A9E4B2 !important; color:#fff !important; opacity:1 !important; }
.primary.enabled{ background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%) !important; color:#fff !important; }
</style>
