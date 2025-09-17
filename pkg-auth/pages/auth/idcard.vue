<template>
  <!-- 顶部导航 -->
  <TitleBar title="实名认证" background="#FFFFFF" />

  <view class="page">
    <StepperBar :step="1" />

    <view class="title">身份证信息</view>
    <view class="sub">请保证证件完整、字体清晰，亮度均匀</view>

    <!-- 正面 -->
    <OcrUploader
      type="front"
      :state="auth.idFront.state"
      :modelValue="auth.idFront"
      @update:modelValue="onFrontUpdate"
    />
    <view class="label">上传身份证人相面</view>

    <!-- 反面 -->
    <OcrUploader
      type="back"
      :state="auth.idBack.state"
      :modelValue="auth.idBack"
      @update:modelValue="onBackUpdate"
    />
    <view class="label">上传身份证国徽面</view>

    <NoticeBar />

    <view class="bottom">
      <button
        class="primary"
        type="default"
        :class="{ enabled: canNext }"
        :disabled="!canNext"
        @click="goNext"
      >
        下一步
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import StepperBar from '../../components/auth/StepperBar.vue'
import NoticeBar from '../../components/auth/NoticeBar.vue'
import OcrUploader from '../../components/OcrUploader.vue'
import { useAuthFlow } from '../../stores/useAuthFlow'
import TitleBar from '@/components/header/TitleBar.vue'

const auth = useAuthFlow()

/** 更稳的 success 判定（小写统一） */
const isSuccess = (s) => String(s || '').toLowerCase() === 'success'

/** 进入下一步条件：正反面都 success */
const canNext = computed(() => isSuccess(auth.idFront.state) && isSuccess(auth.idBack.state))

/** 正面回写：关键字段齐才 success，且带上 serverImageUrl */
const onFrontUpdate = (data = {}) => {
  auth.idFront.imageUrl       = data.imageUrl || ''
  auth.idFront.serverImageUrl = data.serverImageUrl || ''
  auth.idFront.realName       = data.realName || ''
  auth.idFront.idNumber       = data.idNumber || ''
  auth.idFront.sex            = data.sex || ''
  auth.idFront.birth          = data.birth || ''
  auth.idFront.address        = data.address || ''
  // 只在姓名+证号齐全时判 success；否则保持 idle（不急于给 fail）
  auth.idFront.state = (auth.idFront.realName && auth.idFront.idNumber) ? 'success' : 'idle'
}

/** 反面回写：任一关键字段存在即可 success（按你的业务口径） */
const onBackUpdate = (data = {}) => {
  auth.idBack.imageUrl        = data.imageUrl || ''
  auth.idBack.serverImageUrl  = data.serverImageUrl || ''
  auth.idBack.issueOrg        = data.issueOrg || ''
  auth.idBack.validDate       = data.validDate || ''
  // issueOrg 或有效期任意有值即可过（保持和你之前逻辑一致）
  auth.idBack.state = (auth.idBack.issueOrg || auth.idBack.validDate) ? 'success' : 'idle'
}

const goNext = () => {
  if (!canNext.value) return
  auth.step = 2
  uni.navigateTo({ url: '/pkg-auth/pages/auth/face' })
}
</script>

<style scoped>
.page{ padding:30rpx; background:#FFFFFF; }

/* 标题 */
.title{
  position: relative;
  width: 210rpx; height: 54rpx;
  margin: 48rpx 0 8rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 600; font-size: 40rpx; line-height: 54rpx;
  color:#222; text-align:left;
}
.title::after{
  content:''; position:absolute; left:10rpx; bottom:-3rpx;
  width:180rpx; height:16rpx;
  background: linear-gradient(90deg,#8AF1A5 0%, rgba(255,255,255,0) 100%);
}

/* 副文 */
.sub{
  width:450rpx; height:36rpx; margin:24rpx 0;
  font-size:26rpx; line-height:36rpx; color:#AAA; text-align:left;
}

/* 小标题 */
.label{
  width:550rpx; margin:12rpx auto 28rpx;
  font-size:28rpx; line-height:38rpx; color:#444; text-align:center;
}

/* 底部按钮 */
.bottom{ margin-top:28rpx; display:flex; justify-content:center; }
.primary{
  width:688rpx; height:96rpx; border-radius:48rpx;
  display:flex; align-items:center; justify-content:center;
  font-family:'AlibabaPuHuiTi', sans-serif;
  font-weight:550; font-size:40rpx; line-height:54rpx;
  border:none !important; -webkit-appearance:none; padding:0; overflow:hidden;
  background:#A9E4B2 !important; color:#fff !important;
}
.primary::after{ border:none !important; }
.primary[disabled]{ background:#A9E4B2 !important; color:#fff !important; opacity:1 !important; }
.primary.enabled{ background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%) !important; color:#fff !important; }

/* 若旧版 OcrUploader 内有占位覆层 */
:deep(.upload-box){ border:2rpx dashed #E0E0E0; }
:deep(.overlay){ height:96rpx; }
</style>
