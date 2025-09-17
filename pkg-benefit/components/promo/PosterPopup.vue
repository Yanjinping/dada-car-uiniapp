<template>
  <view v-if="visible" class="mask" @tap="close">
    <view class="sheet" @tap.stop>
      <!-- 海报卡：相对布局 -->
      <view class="poster">
        <!-- 顶部插画区 -->
        <view class="hero">
          <image v-if="carImg" class="car" :src="carImg" mode="widthFix" />
          <image v-if="eyeImg" class="eye" :src="eyeImg" mode="widthFix" />
          <image v-if="starImg" class="star" :src="starImg" mode="widthFix" />
        </view>

        <!-- 文案区 -->
        <view class="texts">
          <view class="title-wrap">
            <text class="title stroke">{{ title }}</text>
            <text class="title fill">{{ title }}</text>
          </view>
          <view class="subtitle-wrap">
            <text class="subtitle stroke">{{ subtitle }}</text>
            <text class="subtitle fill red">{{ subtitle }}</text>
            <view class="underline"></view>
          </view>
        </view>

        <!-- 二维码区 -->
        <view class="qr-outer">
          <view class="qr-inner">
            <image class="qrcode" :src="qrUrl" mode="aspectFit" />
          </view>
        </view>

        <!-- 提示 + 品牌 -->
        <view class="foot">
          <text class="tip">长按扫码跟我一起上车</text>
          <image v-if="brandImg" class="brand" :src="brandImg" mode="widthFix" />
        </view>
      </view>

      <!-- 底部按钮 -->
      <button class="btn" @tap="onSave">保存海报</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  visible:  { type: Boolean, default: false },
  /** 外部直传二维码图片（有就用它） */
  qrcode:   { type: String,  default: '' },
  /** 或者：用 inviterId + landingBase 拼成落地页，再通过 qrApi 获取二维码 */
  inviterId:   { type: [String, Number], default: '' },
  landingBase: { type: String, default: '' }, // 例: 'https://h5.dada.com/invite'
  qrApi:       { type: String, default: '/api/invite/qrcode' },

  title:    { type: String,  default: '我在嗒嗒赚现金' },
  subtitle: { type: String,  default: '快来扫码跟我一起赚~！' },

  carImg:   { type: String,  default: '/static/poster/car-top.png' },
  eyeImg:   { type: String,  default: '/static/poster/eye.png' },
  starImg:  { type: String,  default: '/static/poster/star.png' },
  brandImg: { type: String,  default: '/static/poster/logo-dada.png' }
})

const emit = defineEmits(['update:visible','save'])
const visible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})
function close(){ visible.value = false }

/** 真正用于展示/保存的二维码 URL */
const qrUrl = ref('')

function buildLandingUrl(){
  if (!props.landingBase || !props.inviterId) return ''
  const sep = props.landingBase.includes('?') ? '&' : '?'
  return `${props.landingBase}${sep}inviter=${encodeURIComponent(props.inviterId)}`
}

async function ensureQrUrl(){
  if (props.qrcode) { qrUrl.value = props.qrcode; return }
  const landing = buildLandingUrl()
  if (!landing) { qrUrl.value = ''; return }
  try {
    const res = await new Promise((resolve, reject) => {
      uni.request({
        url: `${props.qrApi}?url=${encodeURIComponent(landing)}`,
        method: 'GET',
        success: resolve,
        fail: reject
      })
    })
    qrUrl.value = res.data?.url || (typeof res.data === 'string' ? res.data : '')
  } catch {
    qrUrl.value = ''
  }
}

watch(() => props.visible, v => { if (v) ensureQrUrl() })

/** 保存图片（这里直接保存二维码图片；如需整张海报合成，我再给你 canvas 版） */
// function onSave(){
//   if (!qrUrl.value) { uni.showToast({ title:'暂无二维码', icon:'none' }); return }
//   uni.downloadFile({
//     url: qrUrl.value,
//     success: ({ tempFilePath }) => {
//       uni.saveImageToPhotosAlbum({
//         filePath: tempFilePath,
//         success: () => { uni.showToast({ title:'已保存到相册' }); emit('save') },
//         fail: () => uni.showToast({ title:'保存失败', icon:'none' })
//       })
//     },
//     fail: () => uni.showToast({ title:'下载失败', icon:'none' })
//   })
// }



</script>

<style scoped>
/* 遮罩 */
.mask{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:9999;}
.sheet{ width:750rpx; padding:0 60rpx; box-sizing:border-box; }

/* 海报卡 */
.poster{
  width:630rpx; height:868rpx; margin:0 auto;
  border-radius:32rpx;
  background:linear-gradient(180deg,#FBB07B 0%,#FFF9E7 26%,#FFF9E7 87%,#FAF78C 100%);
  display:flex; flex-direction:column; align-items:center;
  padding:28rpx 24rpx; box-sizing:border-box;
  gap:18rpx;
  box-shadow:0 12rpx 40rpx rgba(0,0,0,.08);
  overflow:hidden;
}

/* 顶部插画区 */
.hero{ position:relative; width:100%; height:240rpx; }
.car{ position:absolute; left:50%; bottom:0; transform:translateX(-50%); width:520rpx; }
.eye{ position:absolute; left:16rpx; top:8rpx; width:116rpx; height:146rpx; }
.star{ position:absolute; left:84rpx; top:110rpx; width:28rpx; height:28rpx; }

/* 文案 */
.texts{ width:100%; display:flex; flex-direction:column; align-items:center; gap:10rpx; }
.title-wrap{ position:relative; width:352rpx; height:66rpx; text-align:center; }
.title{ font-weight:700; font-size:48rpx; line-height:66rpx; color:#222; font-family:AlibabaPuHuiTi, system-ui, -apple-system; }
.title.stroke{ position:absolute; inset:0; color:transparent;
  text-shadow:0 -4rpx 0 #fff,0 4rpx 0 #fff,-4rpx 0 0 #fff,4rpx 0 0 #fff,-3rpx -3rpx 0 #fff,3rpx -3rpx 0 #fff,-3rpx 3rpx 0 #fff,3rpx 3rpx 0 #fff;}
.title.fill{ position:absolute; inset:0; }
.subtitle-wrap{ position:relative; width:642rpx; height:72rpx; text-align:center; }
.subtitle{ font-weight:700; font-size:52rpx; line-height:72rpx; font-family:AlibabaPuHuiTi, system-ui, -apple-system; }
.subtitle.stroke{ position:absolute; inset:0; color:transparent; text-shadow:0 -4rpx 0 #fff,0 4rpx 0 #fff,-4rpx 0 0 #fff,4rpx 0 0 #fff,-3rpx -3rpx 0 #fff,3rpx -3rpx 0 #fff,-3rpx 3rpx 0 #fff,3rpx 3rpx 0 #fff;}
.subtitle.fill{ position:absolute; inset:0; color:#F84F44; }
.underline{ position:absolute; left:50%; bottom:-15rpx; transform:translateX(-50%) rotate(-6deg); width:220rpx; height:16rpx; border-radius:10rpx; background:#7DFF58; }

/* 二维码 */
.qr-outer{ margin-top:20rpx; width:470rpx; height:468rpx; border-radius:52rpx; padding:20rpx;
  background:linear-gradient(180deg,#FDBB57 0%,#FFF5C9 100%); display:flex; align-items:center; justify-content:center; }
.qr-inner{ width:374rpx; height:406rpx; border-radius:24rpx; background:linear-gradient(180deg,#FFF7E5 0%,#FFFDF8 100%); border:4rpx solid #FFFFFF; display:flex; align-items:center; justify-content:center; }
.qrcode{ width:306rpx; height:304rpx; }

/* 底部 */
.foot{ margin-top:8rpx; display:flex; flex-direction:column; align-items:center; gap:12rpx; }
.tip{ font-size:28rpx; line-height:38rpx; color:#B36321; letter-spacing:1rpx; }
.brand{ width:160rpx; }

/* 按钮 */
.btn{ margin:24rpx auto 0; width:630rpx; height:96rpx; border-radius:48rpx;
  background:linear-gradient(270deg,#E8E535 0%, #25DC37 100%); color:#fff; font-size:40rpx; font-weight:500; line-height:96rpx; text-align:center; box-shadow:0 8rpx 20rpx rgba(37,220,55,.2); }
</style>
