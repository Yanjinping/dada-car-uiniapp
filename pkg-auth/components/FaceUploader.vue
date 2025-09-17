<template>
  <view class="face-uploader">

    <!-- 卡片 -->
    <view class="card" :class="state" @click="!uploading && pickAndVerify()">
      <!-- 预览 or 占位图：都铺满容器 -->
      <image v-if="imageUrl" :src="imageUrl" class="fill" mode="aspectFill" />
	  <view v-else class="placeholder fill">
	    <image src="/static/auth/renlian.png" class="fill" mode="aspectFill" />
	  </view>

      <!-- 覆盖 CTA：空态=中心胶囊；成功/失败=底部整条 -->
      <view class="cta">
        <text class="cta-text">
          {{
            state === 'fail'
              ? '身份匹配失败，请重新上传'
              : (imageUrl ? '重新上传' : '拍照/上传')
          }}
        </text>
      </view>
    </view>

    <!-- 识别结果 -->
<!-- 只要进入 success/fail 就显示结果；idle 完全不显示 -->
<view v-if="state === 'success' || state === 'fail'" class="result">
  <text class="hd">识别结果</text>

  <!-- 成功才展示置信度 -->
  <view class="kv" v-if="state === 'success' && confidence > 0">
    <text class="k">识别置信度：</text>
    <text class="v">{{ confidence }}%</text>
  </view>

  <view class="kv">
    <text class="k">匹配状态：</text>
    <text class="v" :style="{color: state === 'success' ? '#16a34a' : '#ef4444'}">
      {{ state === 'success' ? '身份匹配成功' : '身份匹配失败' }}
    </text>
  </view>
</view>

  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { verifyFace } from '../api/auth'

const props = defineProps({
  /** 证件号与姓名用于服务端比对 */
  idCardNumber: { type: String, default: '' },
  realName:     { type: String, default: '' },
  /** v-model 透传的对象：{ imageUrl, confidence, verified, state } */
  modelValue:   { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue', 'verified', 'error'])

/* 状态 */
const imageUrl   = ref('')
const confidence = ref(0)
const verified   = ref(false)
const state      = ref('idle') // idle | success | fail
const uploading  = ref(false)

/* 同步父值 */
watch(() => props.modelValue, (v = {}) => {
  imageUrl.value   = v.imageUrl   || ''
  confidence.value = Number(v.confidence || 0)
  verified.value   = !!v.verified
  state.value      = v.state || (verified.value ? 'success' : (imageUrl.value ? 'fail' : 'idle'))
}, { immediate: true, deep: true })

function resetResult() {
  confidence.value = 0
  verified.value   = false
  state.value      = 'idle'
}

/* chooseImage 兼容路径 */
function pickLocalPreview(res){
  if (Array.isArray(res?.tempFiles) && res.tempFiles[0]?.path) return res.tempFiles[0].path
  if (Array.isArray(res?.tempFilePaths) && res.tempFilePaths[0]) return res.tempFilePaths[0]
  if (typeof res?.tempFilePath === 'string') return res.tempFilePath
  return ''
}

/* 选图 + 人脸核验 */
async function pickAndVerify(){
  if (uploading.value) return
  uploading.value = true
  try{
    const r = await uni.chooseImage({ count: 1, sourceType: ['camera','album'] })
    const file = pickLocalPreview(r)
    if (!file){ uploading.value = false; return }      // 取消选择：静默
	    
		resetResult() // 新一轮开始：清掉上次数据
		
    imageUrl.value = file                              // 先出预览
    try{
      const res  = await verifyFace(file, props.idCardNumber, props.realName)
      const data = res?.data || {}
      confidence.value = Number(data.confidence || 0)
      verified.value   = !!data.verified
      state.value      = verified.value ? 'success' : 'fail'
      sync()
      emit('verified', verified.value, confidence.value)
    }catch(err){
    confidence.value = 0
      verified.value   = false
      state.value      = 'fail'
      sync()
      uni.showToast({ title: err?.message || '识别失败', icon: 'none' })
      emit('verified', false, 0)
      emit('error', err)
    }
  }catch(e){
    // 用户取消等：不提示
  }finally{
    uploading.value = false
  }
}

function sync(){
  emit('update:modelValue', {
    imageUrl: imageUrl.value,
    confidence: confidence.value,
    verified: verified.value,
    state: state.value
  })
}
</script>

<style scoped>
.face-uploader{ padding: 0; }

/* 顶部小标题（与卡片同宽） */
.title{
  width: 550rpx; margin: 12rpx auto 16rpx;
  font-family:'AlibabaPuHuiTi',sans-serif;
  font-weight:400; font-size:28rpx; line-height:38rpx;
  color:#444; text-align:center;
}

/* 卡片：550×330、圆角36、浅蓝底、描边实线 */
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
.fill{ position:absolute; left:0; top:0; width:100%; height:100%; object-fit:cover; display:block; }
.placeholder{ display:flex; align-items:center; justify-content:center; opacity:.92; }
.ph-text{
  padding: 0 16rpx;
  height: 72rpx;
  line-height:72rpx;
  border-radius:48rpx;
  background:#3FD064;
  color:#fff;
  font-size:28rpx;
}

/* 默认：中心绿色胶囊 */
.cta{
  position:absolute; left:50%; top:50%;
  transform: translate(-50%, -50%);
  width:168rpx; height:72rpx; border-radius:48rpx;
  background:#3FD064;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 4rpx 12rpx rgba(63,208,100,.22);
}
.cta-text{ width:126rpx; text-align:center; color:#fff; font-size:28rpx; line-height:38rpx; }

/* 成功/失败：底部整条覆盖条 */
.card.success .cta,
.card.fail .cta{
  left:0; right:0; bottom:0; top:auto;
  transform:none;
  width:100%; height:88rpx; border-radius:0;
  background: rgba(0,0,0,.48);
  box-shadow:none; justify-content:center;
}
.card.fail .cta{ background: rgba(0,0,0,.58); }
.card.success .cta-text,
.card.fail .cta-text{ width:auto; height:88rpx; line-height:88rpx; padding:0 24rpx; }

/* 识别结果（与卡片等宽、居中） */
.result{ width:550rpx; margin:20rpx auto 0; }
.result .hd{
  display:block; margin-bottom:8rpx;
  font-family:'AlibabaPuHuiTi',sans-serif;
  font-weight:600; font-size:30rpx; line-height:42rpx; color:#222;
}
.result .kv{ display:flex; align-items:baseline; column-gap:12rpx; margin:10rpx 0; line-height:40rpx; }
.result .k{ font-size:28rpx; color:#7F8A99; white-space:nowrap; }
.result .v{ font-size:28rpx; color:#222; word-break:break-all; }
</style>
