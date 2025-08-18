<template>
  <scroll-view scroll-y class="page">
    <!-- 顶部标题栏 -->
    <view class="nav">
      <view class="back" @click="goBack">←</view>
      <text class="nav-title">实名认证</text>
      <view class="nav-tools">
        <text class="dot">···</text>
        <text class="camera">◎</text>
      </view>
    </view>

    <!-- 引导文案 -->
    <view class="tip">完善一下资料并通过认证，就可以开始用车啦！</view>

    <!-- 步骤条 -->
    <view class="steps">
      <view class="step" :class="{ active: step === 1 }">
        <view class="dot"></view>
        <text class="label">身份证信息</text>
      </view>
      <view class="line"/>
      <view class="step" :class="{ active: step >= 2 }">
        <view class="dot"></view>
        <text class="label">驾驶证信息</text>
      </view>
      <view class="line"/>
      <view class="step" :class="{ active: step >= 3 }">
        <view class="dot"></view>
        <text class="label">人脸照片</text>
      </view>
    </view>

    <!-- 模块标题 -->
    <view class="section">
      <text class="h1">身份证信息</text>
      <text class="sub">请保证证件完整、字体清晰、亮度均匀</text>
    </view>

    <!-- 身份证正面上传卡片 -->
    <view class="id-card">
      <image class="bg" :src="frontPreview || placeholderFront" mode="aspectFit"/>
      <button class="upload-btn" @click="chooseAndUpload('front')">拍照/上传</button>
    </view>
    <view class="hint">上传身份证人像面</view>

    <!-- 身份证反面上传卡片 -->
    <view class="id-card">
      <image class="bg" :src="backPreview || placeholderBack" mode="aspectFit"/>
      <button class="upload-btn" @click="chooseAndUpload('back')">拍照/上传</button>
    </view>
    <view class="hint">上传身份证国徽面</view>

    <!-- 隐私提示 -->
    <view class="privacy">
      <text class="icon">!</text>
      <text class="text">仅用于身份验证，我们依照隐私政策保护您的个人信息</text>
    </view>

    <!-- 下一步按钮 -->
    <button class="next" :class="{ enabled: canNext }" :disabled="!canNext" @click="goNext">下一步</button>
    <view style="height: 40rpx"/>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const step = ref(1)

// 预览图占位（可换成你的静态资源路径）
const placeholderFront = '/static/auth/id-front.png'
const placeholderBack  = '/static/auth/id-back.png'

const frontPreview = ref<string>('')
const backPreview  = ref<string>('')

// OCR 结果（按你现有接口返回字段命名）
const idName    = ref('')
const idNumber  = ref('')
const frontOcr  = ref<any>(null)
const backOcr   = ref<any>(null)

const canNext = computed(() => !!frontOcr.value && !!backOcr.value)

function goBack(){
  uni.navigateBack({ delta: 1 })
}

/** 选择并上传图片，服务端完成 OCR 并返回解析结果 */
async function chooseAndUpload(side: 'front'|'back'){
  try{
    const { tempFilePaths } = await uni.chooseImage({ count: 1, sizeType: ['original','compressed'], sourceType: ['album','camera'] }) as any
    const filePath = tempFilePaths[0]

    // 本地预览
    if(side==='front') frontPreview.value = filePath
    else backPreview.value = filePath

    // 上传到后端
    const token = uni.getStorageSync('token') || ''
    const res = await uni.uploadFile({
      url: import.meta.env.VITE_API_BASE_URL + '/api/user/auth/ocr/idcard',
      filePath,
      name: 'file',
      header: { Authorization: token ? `Bearer ${token}` : '' },
      formData: { side },
    }) as any

    const data = JSON.parse(res.data || '{}')
    if(data.code !== 0){
      uni.showToast({ title: data.msg || '识别失败', icon: 'none' })
      return
    }

    // 兼容你现有后端：data.data 里包含 ocr 结构
    const ocr = data.data || {}
    if(side==='front'){
      frontOcr.value = ocr
      // 若后端直接返回姓名/身份证号，可回填
      idName.value   = ocr.realName || ocr.name || idName.value
      idNumber.value = ocr.idCard || ocr.idNumber || idNumber.value
    }else{
      backOcr.value  = ocr
    }
  }catch(e){
    console.error(e)
    uni.showToast({ title: '操作取消或失败', icon: 'none' })
  }
}

function goNext(){
  // 将识别结果暂存，供下一步使用（驾驶证 / 活体）
  uni.setStorageSync('auth_id_front', frontOcr.value)
  uni.setStorageSync('auth_id_back',  backOcr.value)
  uni.setStorageSync('auth_id_name',  idName.value)
  uni.setStorageSync('auth_id_no',    idNumber.value)

  // 跳转到驾驶证信息页（你已有路由：/pages/auth/driver/index）
  uni.navigateTo({ url: '/pages/auth/driver/index' })
}
</script>

<style scoped>
.page{ background:#F7FAF8; min-height:100vh; padding: 0 24rpx; }

/* 顶部 */
.nav{ height: 100rpx; display:flex; align-items:center; justify-content:space-between; }
.back{ width: 80rpx; font-size: 36rpx; color:#111827; }
.nav-title{ font-size: 34rpx; font-weight: 600; color:#111827; }
.nav-tools{ width: 160rpx; text-align:right; color:#9CA3AF; }
.dot{ margin-right: 16rpx; }

.tip{ color:#9CA3AF; font-size: 24rpx; margin: 8rpx 0 24rpx; }

/* 步骤条 */
.steps{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 24rpx; }
.step{ display:flex; align-items:center; gap: 12rpx; }
.step .dot{ width: 36rpx; height: 36rpx; border-radius: 999rpx; background:#E5E7EB; border: 2rpx solid #E5E7EB; }
.step.active .dot{ background:#1EC48D; border-color:#1EC48D; }
.step .label{ color:#6B7280; font-size: 24rpx; }
.step.active .label{ color:#111827; font-weight:600; }
.line{ flex:1; height: 4rpx; background: #E5E7EB; margin: 0 12rpx; border-radius: 999rpx; }

/* 模块标题 */
.section{ margin: 16rpx 0 8rpx; }
.h1{ font-size: 36rpx; font-weight: 700; color:#111827; }
.sub{ display:block; margin-top: 8rpx; color:#9CA3AF; font-size: 24rpx; }

/* 上传卡片 */
.id-card{ position: relative; margin-top: 24rpx; padding: 24rpx; border-radius: 24rpx; background: #FFFFFF; box-shadow: 0 8rpx 24rpx rgba(0,0,0,.05); }
.id-card .bg{ width: 100%; height: 280rpx; border-radius: 16rpx; background: #F3F4F6; }
.upload-btn{ position:absolute; left:50%; top:50%; transform: translate(-50%, -50%); background:#1EC48D; color:#fff; border-radius: 999rpx; padding: 18rpx 32rpx; font-size: 28rpx; }
.hint{ text-align:center; color:#9CA3AF; font-size: 24rpx; margin-top: 16rpx; }

/* 隐私提示 */
.privacy{ display:flex; align-items:flex-start; gap: 12rpx; background: #F0FFF7; color:#10A777; border-radius: 16rpx; padding: 16rpx; margin: 32rpx 0; }
.privacy .icon{ width: 28rpx; height: 28rpx; line-height: 28rpx; text-align:center; border-radius:999rpx; background:#1EC48D; color:#fff; font-size: 22rpx; margin-top: 4rpx; }
.privacy .text{ flex:1; font-size: 24rpx; line-height: 36rpx; }

/* 下一步 */
.next{ width: 100%; height: 88rpx; border-radius: 999rpx; background: #CFEFDF; color:#fff; font-size: 30rpx; }
.next.enabled{ background:#1EC48D; }
</style>
