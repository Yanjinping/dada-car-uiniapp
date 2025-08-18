<template>
  <view class="page">
    <view class="section-title">📄 身份证识别</view>
    <OcrUploader type="front" v-model="idcardFront" />
    <OcrUploader type="back" v-model="idcardBack" />

    <view class="section-title">🚗 驾驶证识别</view>
    <OcrDrivingUploader v-model="drivingInfo" />

    <view class="section-title">🧍 人脸识别</view>
    <FaceUpload
      v-if="idcardFront.realName && idcardFront.idNumber"
      :realName="idcardFront.realName"
      :idCardNumber="idcardFront.idNumber"
      @verified="handleFaceVerified"
    />

    <view class="bottom">
      <button type="primary" :disabled="canSubmit" @click="submitAll">提交认证</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import OcrUploader from '@/components/OcrUploader.vue'
import OcrDrivingUploader from '@/components/OcrDrivingUploader.vue'
import FaceUpload from '@/components/FaceUpload.vue'
import { submitAuth } from '@/api/user'

// OCR 信息
const idcardFront = ref({})
const idcardBack = ref({})
const drivingInfo = ref({})
const faceVerified = ref(false)
const faceScore = ref(0)

// 是否允许提交
const canSubmit = computed(() =>
  idcardFront.value.realName &&
  idcardFront.value.idNumber &&
  idcardBack.value.validDate &&
  drivingInfo.value.drivingIdNumber &&
  faceVerified.value
)

// 监听人脸识别结果
const handleFaceVerified = (verified, score) => {
  faceVerified.value = verified
  faceScore.value = score || 0
  
  console.debug("handleFaceVerified->"+ faceVerified.value )
  console.debug("handleFaceVerified->canSubmit:"+ canSubmit.value )
  
}

// 提交所有认证信息
const submitAll = () => {
  // if (!canSubmit.value) {
  //   uni.showToast({ title: '请完成所有认证步骤', icon: 'none' })
  //   return
  // }

  const userId = uni.getStorageSync('userId')

  const payload = {
    userId,
    realName: idcardFront.value.realName,
    idNumber: idcardFront.value.idNumber,
    frontImageUrl: idcardFront.value.imageUrl,
    backImageUrl: idcardBack.value.imageUrl,
    sex: idcardFront.value.sex,
    birth: idcardFront.value.birth,
    address: idcardFront.value.address,
    issueOrg: idcardBack.value.issueOrg,
    validDate: idcardBack.value.validDate,
    drivingType: drivingInfo.value.drivingType,
    drivingValidDate: drivingInfo.value.validDate,
    drivingIdNumber: drivingInfo.value.drivingIdNumber,
    drivingImageUrl: drivingInfo.value.imageUrl,
    faceVerified: faceVerified.value,
    faceScore: faceScore.value
  }

  submitAuth(payload)
    .then(() => {
      uni.showToast({ title: '认证成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    })
    .catch(err => {
      uni.showToast({ title: err.message || '认证失败', icon: 'none' })
    })
}
</script>

<style scoped>
.page {
  padding: 20rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin: 20rpx 0 10rpx;
}
.bottom {
  margin-top: 40rpx;
  display: flex;
  justify-content: center;
}
</style>
