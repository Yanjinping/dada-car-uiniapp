<template>
  <view class="ocr-uploader">
    <!-- 可显示或隐藏标题；这里默认隐藏以贴你现有页面 -->
    <!-- <view class="title">上传身份证{{ type==='front' ? '正面' : '反面' }}</view> -->

    <!-- 卡片 -->
    <view class="card" :class="localState" @click="handleUpload">
      <!-- 预览 or 占位图：都铺满容器 -->
      <image
        v-if="model.imageUrl"
        :src="model.imageUrl"
        class="fill"
        mode="aspectFill"
      />
      <image
        v-else
        :src="placeholderSrc"
        class="fill placeholder"
        mode="aspectFill"
      />

      <!-- 覆盖 CTA：空态=中心胶囊；成功/失败=底部整条 -->
      <view class="cta">
        <text class="cta-text">
			
          {{
            localState === 'fail'
              ? '识别失败，请重新上传'
              : (model.imageUrl ? '重新上传' : '拍照/上传')
          }}
        </text>
      </view>
	  
    </view>

    <!-- 识别结果（按需开启：把 v-if 改为 showInfo 即可） -->
    <!-- 紧跟样式：字段名＋冒号＋值 -->
    <view v-if="showInfo && props.type === 'driving' " class="result">
      <text class="hd">识别结果</text>
      <view v-if="model.realName" class="kv"><text class="k">姓名：</text><text class="v">{{ model.realName }}</text></view>
      <view v-if="model.idNumber" class="kv"><text class="k">身份证号：</text><text class="v">{{ model.idNumber }}</text></view>
      <view v-if="model.sex" class="kv"><text class="k">性别：</text><text class="v">{{ model.sex }}</text></view>
      <view v-if="model.birth" class="kv"><text class="k">出生日期：</text><text class="v">{{ model.birth }}</text></view>
      <view v-if="model.address" class="kv"><text class="k">地址：</text><text class="v">{{ model.address }}</text></view>
      <view v-if="model.issueOrg" class="kv"><text class="k">发证机关：</text><text class="v">{{ model.issueOrg }}</text></view>
      <view v-if="model.validDate" class="kv"><text class="k">有效期：</text><text class="v">{{ model.validDate }}</text></view>
    </view>
	
  </view>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { ocrIdCard } from '@/api/user'
import { getPlatform, Platform } from '@/utils/platform'

const props = defineProps({
  type: { type: String, required: true },   // 'front' | 'back'
  modelValue: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:modelValue'])

// 本地模型
const model = reactive({
  ...(props.modelValue || {}),
  serverImageUrl: (props.modelValue && props.modelValue.serverImageUrl) || '',
  state: (props.modelValue && props.modelValue.state) || 'idle'
})

const localState = computed(() => model.state || 'idle')
const showInfo = computed(() =>
  !!(model.realName || model.idNumber || model.issueOrg || model.validDate || model.address)
)

// 占位图
const placeholderSrc = computed(() =>
  props.type === 'back' ? '/static/auth/sfz-guo.png' : '/static/auth/sfz-ren.png'
)

/* ---------- 兼容工具 ---------- */
// chooseImage 预览路径
function pickLocalPreview(res){
  if (Array.isArray(res?.tempFiles) && res.tempFiles[0]?.path) return res.tempFiles[0].path
  if (Array.isArray(res?.tempFilePaths) && res.tempFilePaths[0]) return res.tempFilePaths[0]
  if (typeof res?.tempFilePath === 'string') return res.tempFilePath
  return ''
}
// 服务端图片地址
function pickServerImageUrl(data = {}, type = 'front') {
  const keysFront = ['frontImageUrl', 'front_url', 'frontUrl']
  const keysBack  = ['backImageUrl',  'back_url',  'backUrl']
  const common    = ['imageUrl', 'url', 'ossUrl', 'cosUrl', 'cdnUrl', 'previewUrl']
  const keys = type === 'front' ? [...keysFront, ...common] : [...keysBack, ...common]
  for (const k of keys) { const v = data?.[k]; if (typeof v === 'string' && v) return v }
  return ''
}
let uploading = false

/* ---------- 上传主流程 ---------- */
async function handleUpload(){
  if (uploading) return
  uploading = true
  let preview = ''
  try{
    // 统一：所有端（含 H5）都先本地选图，再调 OCR
    const r = await uni.chooseImage({ count: 1 })
    preview = pickLocalPreview(r)
    if (!preview) { uploading = false; return }  // 没选图/取消，不提示

    // 先出本地预览
    model.imageUrl = preview

    try{
      const res = await ocrIdCard(preview, props.type)  // H5 需确保后端支持 filePath/multipart
      const apiUrl = pickServerImageUrl(res?.data, props.type)
      onSuccess(preview || apiUrl, res?.data)
    }catch(err){
      // 如果后端改成直传才需要这里的兜底
      const msg = err?.message || err?.errMsg || '身份证OCR识别失败'
      onFail(msg)
    }
  }catch(e){
    // 选择框取消：静默返回
    const msg = e?.errMsg || e?.message || ''
    if (/cancel/i.test(msg)) { uploading = false; return }
    onFail('身份证OCR识别失败')
  }finally{
    uploading = false
  }
}

/* ---------- 成功/失败回调 ---------- */
function onSuccess(url, data = {}) {
  const apiUrl = pickServerImageUrl(data, props.type)

  // 展示用
  model.imageUrl = url || apiUrl || model.imageUrl
  // 提交用
  model.serverImageUrl = apiUrl || model.serverImageUrl

  // 字段同步
  model.realName = data.realName || ''
  model.idNumber = data.idNumber || ''
  model.sex      = data.sex || ''
  model.birth    = data.birth || ''
  model.address  = data.address || ''
  model.issueOrg = data.issueOrg || ''
  model.validDate= data.validDate || ''

  // 成功判断：正面（姓名+身份证号）/ 反面（发证机关或有效期）
  model.state = (props.type === 'front')
    ? (model.realName && model.idNumber ? 'success' : 'fail')
    : (model.issueOrg || model.validDate ? 'success' : 'fail')

  emit('update:modelValue', { ...model })
}

function onFail(msg) {
  model.state = 'fail'
  uni.showToast({ title: msg, icon: 'none' })
  emit('update:modelValue', { ...model })
}
</script>

<style scoped>
.ocr-uploader{ padding: 0; }
/* 可选标题 */
.title{
  width: 550rpx; margin: 12rpx auto 16rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 400; font-size: 28rpx; line-height: 38rpx;
  color: #444; text-align: center;
}

/* 卡片：550×330、圆角36、浅蓝底 + 实线描边，图像铺满 */
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
.fill{ position:absolute; left:0; top:0; width:100%; height:100%; display:block; object-fit:cover; }
.placeholder{ opacity:.8; pointer-events:none; border-radius:inherit; }

/* 默认：中心绿色胶囊按钮（空态） */
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

/* 识别成功：底部整条半透明覆盖条（蓝湖风） */
.card.success .cta{
  left:0; right:0; bottom:0; top:auto;
  transform:none;
  width:100%; height:88rpx; border-radius:0;
  background: rgba(0,0,0,.45);
  box-shadow:none; justify-content:center;
}
.card.success .cta-text{
  width:auto; height:88rpx; line-height:88rpx; padding:0 24rpx;
  font-size:28rpx; color:#fff;
}

/* 失败：同样底部覆盖条，略深一点 */
.card.fail .cta{
  left:0; right:0; bottom:0; top:auto;
  transform:none;
  width:100%; height:88rpx; border-radius:0;
  background: rgba(0,0,0,.55);
}
.card.fail .cta-text{ width:auto; height:88rpx; line-height:88rpx; padding:0 24rpx; }

/* 识别结果（与卡片等宽、居中；字段名＋冒号＋值紧跟） */
.result{
  width: 550rpx; margin: 20rpx auto 0;
}
.result .hd{
  display:block; margin-bottom:8rpx;
  font-family:'AlibabaPuHuiTi',sans-serif;
  font-weight:600; font-size:30rpx; line-height:42rpx; color:#222;
}
.result .kv{
  display:flex; align-items:baseline; column-gap:12rpx;
  margin:10rpx 0; line-height:40rpx;
}
.result .k{ font-size:28rpx; color:#7F8A99; white-space:nowrap; }
.result .v{ font-size:28rpx; color:#222; word-break:break-all; }
</style>
