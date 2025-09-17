<template>
  <view class="ocr-uploader">
 

    <!-- 卡片 -->
    <view class="card" :class="localState" @click="!uploading && handleUpload()">
      <!-- 预览 or 占位图：都铺满容器 -->
      <image v-if="imageUrl" :src="imageUrl" class="fill" mode="aspectFill" />
      <image v-else src="/static/auth/jiazhao.png" class="fill placeholder" mode="aspectFill" />

      <!-- 覆盖 CTA：空态=中心胶囊；成功/失败=底部整条 -->
      <view class="cta">
        <text class="cta-text">
          {{ localState==='fail' ? '识别失败，请重新上传' : (imageUrl ? '重新上传' : '拍照/上传') }}
        </text>
      </view>
	  
	     <view class="title">上传驾驶证照片</view>
    </view>

    <!-- 识别结果（成功时展示） -->
    <view v-if="localState==='success'" class="result">
      <text class="hd">识别结果</text>
      <view class="kv"><text class="k">姓名：</text><text class="v">{{ realName || '-' }}</text></view>
      <view class="kv"><text class="k">准驾车型：</text><text class="v">{{ drivingType || '-' }}</text></view>
      <view class="kv"><text class="k">身份证号：</text><text class="v">{{ idNumber || '-' }}</text></view>
      <view class="kv"><text class="k">有效期限：</text><text class="v">{{ validDate || '-' }}</text></view>
    </view>

    <!-- 提交按钮（可选） -->
    <view class="bottom" v-if="showSubmit">
      <button
        class="primary"
        type="default"
        :class="{ enabled: canSubmit }"
        :disabled="!canSubmit || submitting"
        @click="trySubmit"
      >
        {{ submitting ? '提交中...' : '下一步' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ocrDriving }  from '../api/auth'
// import { getPlatform, Platform } from '@/utils/platform'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  /** 是否显示组件内置的提交按钮。默认 false：由父层控制。 */
  showSubmit: { type: Boolean, default: false },
  /** 自定义提交函数：异步函数(payload) => Promise<void> */
  onSubmit: { type: Function, default: null }
})
const emit = defineEmits(['update:modelValue', 'submit', 'error'])

/* ========= 状态 ========= */
const imageUrl      = ref('')   // 本地预览
const serverImageUrl= ref('')   // 服务端地址（可用于最终提交）
const realName      = ref('')
const idNumber      = ref('')
const drivingType   = ref('')
const validDate     = ref('')
const localState    = ref('idle')     // idle | success | fail
const uploading     = ref(false)
const submitting    = ref(false)

/* 父值同步 */
watch(() => props.modelValue, (v = {}) => {
  imageUrl.value       = v.imageUrl || ''
  serverImageUrl.value = v.serverImageUrl || ''
  realName.value       = v.realName || ''
  idNumber.value       = v.idNumber || ''
  drivingType.value    = v.drivingType || ''
  validDate.value      = v.validDate || ''
  localState.value     = (drivingType.value && idNumber.value) ? 'success' : (imageUrl.value ? 'fail' : 'idle')
}, { immediate: true, deep: true })

/* 允许提交：有图片 & 关键字段齐 */
const canSubmit = computed(() =>
  !!( (serverImageUrl.value || imageUrl.value) && idNumber.value && drivingType.value && localState.value==='success')
)

/* ========= 工具 ========= */
function pickLocalPreview(res){
  if (Array.isArray(res?.tempFiles) && res.tempFiles[0]?.path) return res.tempFiles[0].path
  if (Array.isArray(res?.tempFilePaths) && res.tempFilePaths[0]) return res.tempFilePaths[0]
  if (typeof res?.tempFilePath === 'string') return res.tempFilePath
  return ''
}
function pickServerImageUrl(data = {}) {
  const keys = ['imageUrl','url','ossUrl','cosUrl','cdnUrl','previewUrl']
  for (const k of keys){ const v = data?.[k]; if (typeof v==='string' && v) return v }
  return ''
}
function syncModel() {
  emit('update:modelValue', {
    imageUrl: imageUrl.value,
    serverImageUrl: serverImageUrl.value,
    realName: realName.value,
    idNumber: idNumber.value,
    drivingType: drivingType.value,
    validDate: validDate.value,
    state: localState.value
  })
}

/* ========= 上传 & OCR ========= */
async function handleUpload(){
  if (uploading.value) return
  uploading.value = true
  let preview = ''
  try{
    // const pf = getPlatform()
    // 所有端统一：先选择图片，再调用 OCR
    const r = await uni.chooseImage({ count: 1 })
    preview = pickLocalPreview(r)
    if (!preview){ uploading.value=false; return } // 取消选择：静默

    imageUrl.value = preview // 先预览
    try{
      const res = await ocrDriving(preview) // 你的后端需支持 filePath/multipart
      serverImageUrl.value = pickServerImageUrl(res?.data) || serverImageUrl.value
      realName.value       = res?.data?.realName    || ''
      idNumber.value       = res?.data?.idNumber    || ''
      drivingType.value    = res?.data?.drivingType || ''
      validDate.value      = res?.data?.validDate   || ''
      localState.value     = (drivingType.value && idNumber.value) ? 'success' : 'fail'
      syncModel()
    }catch(err){
      localState.value = 'fail'
      syncModel()
      uni.showToast({ title: err?.message || '驾驶证识别失败', icon: 'none' })
      emit('error', err)
    }
  }catch(e){
    // 选择弹窗被取消：静默
    const msg = e?.errMsg || e?.message || ''
    if (!/cancel/i.test(msg)) {
      localState.value = 'fail'
      syncModel()
      uni.showToast({ title: '驾驶证识别失败', icon: 'none' })
      emit('error', e)
    }
  }finally{
    uploading.value = false
  }
}

/* ========= 提交 ========= */
async function trySubmit(){
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  const payload = {
    imageUrl: imageUrl.value,
    serverImageUrl: serverImageUrl.value,
    realName: realName.value,
    idNumber: idNumber.value,
    drivingType: drivingType.value,
    validDate: validDate.value
  }
  try{
    if (typeof props.onSubmit === 'function') {
      await props.onSubmit(payload)         // 外部自定义提交流程
    } else {
      // 如果你有固定接口，可在此处替换：
      // await submitDriving(payload)
      // 这里保持空实现，交由父组件接管
      emit('submit', payload)               // 交给父层
    }
    uni.showToast({ title: '提交成功', icon: 'success' })
  }catch(err){
    uni.showToast({ title: err?.message || '提交失败', icon: 'none' })
    emit('error', err)
  }finally{
    submitting.value = false
  }
}
</script>

<style scoped>
/* 容器与标题 */
.ocr-uploader{ padding: 0; }
.title{
  width: 550rpx; margin: 12rpx auto 16rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 400; font-size: 28rpx; line-height: 38rpx;
  color: #444444; text-align: center;
}

/* 卡片：550×330、圆角36、#F7FBFF 背、2rpx #E0EEF9 实线，水平居中 */
.card{
  position: relative;
  width: 550rpx; height: 330rpx;
  margin: 0 auto;
  border-radius: 36rpx;
  background: #F7FBFF;
  border: 2rpx solid #E0EEF9;
  box-sizing: border-box;
  overflow: hidden;
}

/* 铺满容器的图层（预览或占位） */
.fill{ position:absolute; left:0; top:0; width:100%; height:100%; display:block; object-fit:cover; }
.placeholder{ opacity: .8; pointer-events: none; border-radius: inherit; }

/* 默认：中心绿色胶囊 */
.cta{
  position:absolute; left:50%; top:50%;
  transform: translate(-50%, -50%);
  width:168rpx; height:72rpx; border-radius:48rpx;
  background:#3FD064;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 4rpx 12rpx rgba(63,208,100,.22);
}
.cta-text{
  width:126rpx; height:38rpx; text-align:center;
  font-family:'AlibabaPuHuiTi', sans-serif;
  font-weight:400; font-size:28rpx; line-height:38rpx; color:#fff;
}

/* 成功：底部整条半透明覆盖条 */
.card.success .cta{
  left:0; right:0; bottom:0; top:auto;
  transform:none;
  width:100%; height:88rpx; border-radius:0;
  background: rgba(0,0,0,.45);
  box-shadow:none;
  justify-content:center;
}
.card.success .cta-text{
  width:auto; height:88rpx; line-height:88rpx;
  padding:0 24rpx; font-size:28rpx; color:#fff;
}

/* 失败：底部覆盖条更深 */
.card.fail .cta{
  left:0; right:0; bottom:0; top:auto;
  transform:none;
  width:100%; height:88rpx; border-radius:0;
  background: rgba(0,0,0,.55);
}
.card.fail .cta-text{ width:auto; height:88rpx; line-height:88rpx; padding:0 24rpx; }

/* 识别结果 */
.result{
  width: 550rpx; margin: 20rpx auto 0;
}
.result .hd{
  display:block; margin-bottom: 8rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 600; font-size: 30rpx; line-height: 42rpx; color: #222;
}
.result .kv{
  display:flex; align-items:baseline; column-gap:12rpx;
  margin: 10rpx 0; line-height: 40rpx;
}
.result .k{ font-size:28rpx; color:#7F8A99; white-space:nowrap; }
.result .v{ font-size:28rpx; color:#222; word-break:break-all; }

/* 提交按钮（可选） */
.bottom{ margin-top: 28rpx; display:flex; justify-content:center; }
.primary{
  width: 688rpx; height: 96rpx; border-radius: 48rpx;
  display:flex; align-items:center; justify-content:center;
  font-family:'AlibabaPuHuiTi', sans-serif;
  font-weight: 600; font-size: 40rpx; line-height: 54rpx;
  border:none !important; -webkit-appearance:none; padding:0; overflow:hidden;
  background:#A9E4B2 !important; color:#fff !important;
}
.primary::after{ border:none !important; }
.primary[disabled]{ background:#A9E4B2 !important; color:#fff !important; opacity:1 !important; }
.primary.enabled{ background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%) !important; color:#fff !important; }
</style>
