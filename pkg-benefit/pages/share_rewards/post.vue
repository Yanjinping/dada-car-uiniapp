<template>
  <view class="page">
    <TitleBar title="发布晒单" />

    <!-- 活动提示 -->
    <view class="banner">
      <view class="title">#嗒嗒好礼，分享快乐#</view>
      <view class="sub">完成用车后，分享至指定微信群并附点评，审核通过得10元券</view>
    </view>

    <!-- 选择订单 -->
    <view class="section">
      <view class="sec-hd">选择要晒单的订单</view>
      <picker
        mode="selector"
        :range="orders"
        range-key="label"
        @change="onPickOrder"
      >
        <view class="picker">
          <text class="mono">{{ selectedOrder?.label || '请选择近30天已完成订单' }}</text>
          <text class="arrow">›</text>
        </view>
      </picker>
      <view class="tip">仅支持近30天完成且未参与过晒单的订单</view>
    </view>

    <!-- 点评文案 -->
    <view class="section">
      <view class="sec-hd">写点评（≥20字）</view>
      <textarea
        class="ta"
        v-model.trim="form.content"
        :maxlength="200"
        placeholder="例如：今晚回校用的嗒嗒，取还方便，车况干净，推荐给同学们～"
        @input="onContentInput"
      />
      <view class="row between small">
        <text :class="{ danger: contentTooShort }">已输入 {{ form.content.length }}/200</text>
        <button class="btn ghost sm" @tap="copy(sampleText)">一键复制示例</button>
      </view>
    </view>

    <!-- 用车照片 -->
    <view class="section">
      <view class="sec-hd">上传用车照片（1~6张）</view>
      <view class="uploader">
        <view
          v-for="(img,i) in form.ridePhotos"
          :key="'p'+i"
          class="thumb"
          @tap="preview(form.ridePhotos, i)"
        >
          <image :src="img" mode="aspectFill" />
          <text class="x" @tap.stop="removeImg('ridePhotos', i)">×</text>
        </view>
        <view class="thumb add" v-if="form.ridePhotos.length < 6" @tap="pickImg('ridePhotos')">+</view>
      </view>
      <view class="tip">建议包含车辆外观/内饰/行程相关画面，避免包含他人隐私与车牌特写</view>
    </view>

    <!-- 分享截图（可选但推荐，提高通过率） -->
    <view class="section">
      <view class="sec-hd row between">
        <text>分享到微信群的截图（0~3张，推荐）</text>
        <text class="link" @tap="openShareGuide">如何获取</text>
      </view>
      <view class="uploader">
        <view
          v-for="(img,i) in form.shareProof"
          :key="'s'+i"
          class="thumb"
          @tap="preview(form.shareProof, i)"
        >
          <image :src="img" mode="aspectFill" />
          <text class="x" @tap.stop="removeImg('shareProof', i)">×</text>
        </view>
        <view class="thumb add" v-if="form.shareProof.length < 3" @tap="pickImg('shareProof')">+</view>
      </view>
      <view class="tip">分享到“指定微信群”后上传聊天截图（自动打码不影响审核）</view>
    </view>

    <!-- 规则与提交 -->
    <view class="rules">
      <view class="hd">#活动规则#</view>
      <view class="li">· 每次通过审核奖励10元券，满20可用，7天有效；每日最多2次。</view>
      <view class="li">· 文案须≥20字，内容健康真实；图片清晰无遮挡。</view>
      <view class="li">· 严禁盗图/AI合成/重复提交；违规则取消资格。</view>
      <view class="li">· 活动时间：2025.8.20 - 2025.12.31</view>
    </view>

    <view class="submit-wrap">
      <button class="btn primary lg" :disabled="submitting" @tap="submit">
        {{ submitting ? '提交中…' : '提交审核' }}
      </button>
    </view>

    <!-- 分享引导 -->
    <uni-popup ref="sharePopup" type="center">
      <view class="pop">
        <view class="pop-hd">分享到指定微信群</view>
        <view class="pop-bd">
          1）复制上面的点评文案<br/>
          2）在微信群粘贴文字并配图发送<br/>
          3）长按聊天记录保存截图并在此上传
        </view>
        <button class="btn primary" @tap="closeShareGuide">我知道了</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import { apiShareSubmit } from '../../api/shareOrder'

const orders = ref([]) // [{value:'D2025...', label:'D2025... · 已完成 · 08-22 20:12'}]
const selectedOrder = ref(null)
const form = reactive({
  orderNum: '',
  content: '',
  ridePhotos: [],
  shareProof: []
})
const sampleText = '#嗒嗒好礼# 今晚回校用的嗒嗒，取车还车都很顺，车内干净无异味，价格也友好，安利给同学们～'
const submitting = ref(false)
const contentTooShort = computed(() => form.content.length < 20)

const sharePopup = ref(null)
function openShareGuide(){ sharePopup.value?.open() }
function closeShareGuide(){ sharePopup.value?.close() }

onMounted(() => {
  fetchEligibleOrders()
})

function fetchEligibleOrders() {
  // 实际：GET /api/promo/share/eligible-orders
  // 这里模拟
  orders.value = [
    { value: 'D202508220012', label: 'D202508220012 · 已完成 · 08/22 20:12' },
    { value: 'D202508200033', label: 'D202508200033 · 已完成 · 08/20 18:05' }
  ]
}

function onPickOrder(e) {
  const idx = Number(e.detail.value)
  selectedOrder.value = orders.value[idx]
  form.orderNum = selectedOrder.value?.value || ''
}

function onContentInput(e) {
  // 这里只做长度提示，违禁词可在后端再校验
}

function pickImg(field) {
  uni.chooseImage({
    count: 6,
    sizeType: ['compressed'],
    success: async (res) => {
      // 实际：逐张上传到你的文件服务，拿url后push
      // 例如：POST /api/upload 返回 {url}
      const urls = res.tempFilePaths.map(p => p) // 占位：直接用本地路径预览
      form[field].push(...urls)
    }
  })
}

function removeImg(field, i) { form[field].splice(i, 1) }
function preview(urls, i=0) { uni.previewImage({ urls, current: i }) }
function copy(text){ uni.setClipboardData({ data: text }) }

function validate() {
  if (!form.orderNum) return toast('请选择订单')
  if (contentTooShort.value) return toast('点评至少20字')
  if (form.ridePhotos.length < 1) return toast('至少上传1张用车照片')
  return true
}

function toast(title){ uni.showToast({ title, icon: 'none' }) }

async function submit() {
  if (submitting.value) return
  if (validate() !== true) return
  submitting.value = true
  try {
    const res = await apiShareSubmit({
      orderNum: form.orderNum,
      content: form.content,
      ridePhotos: form.ridePhotos,
      shareProof: form.shareProof
    })
    uni.showToast({ title: '已提交，等待审核', icon: 'none' })
	console.debug(res.data.id)
    uni.redirectTo({ url: `/pkg-benefit/pages/share_rewards/detail?id=${res.data.id}` })
  } catch (e) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page{min-height:100vh;background:#f6f7fb;padding-bottom:40rpx}
.banner{margin:24rpx;background:#fff;border-radius:20rpx;padding:22rpx 24rpx;box-shadow:0 6rpx 14rpx rgba(0,0,0,.04)}
.banner .title{font-size:32rpx;color:#111;font-weight:700}
.banner .sub{margin-top:6rpx;color:#666;font-size:26rpx}
.section{margin:18rpx 24rpx;background:#fff;border-radius:20rpx;padding:18rpx 20rpx}
.sec-hd{font-size:28rpx;color:#333;font-weight:600;margin-bottom:10rpx}
.picker{display:flex;justify-content:space-between;align-items:center;background:#f6f7fb;border-radius:12rpx;padding:16rpx}
.arrow{color:#bbb;font-size:32rpx}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace}
.tip{color:#999;font-size:24rpx;margin-top:8rpx}
.ta{min-height:160rpx;background:#f6f7fb;border-radius:12rpx;padding:16rpx;font-size:28rpx}
.row{display:flex;align-items:center}
.between{justify-content:space-between}
.small{font-size:24rpx;color:#666;margin-top:6rpx}
.danger{color:#a8071a}
.link{color:#1677ff}
.uploader{display:flex;flex-wrap:wrap;gap:12rpx}
.thumb{width:200rpx;height:200rpx;border-radius:12rpx;overflow:hidden;position:relative;background:#f2f3f5}
.thumb image{width:100%;height:100%}
.thumb .x{position:absolute;top:6rpx;right:6rpx;background:rgba(0,0,0,.45);color:#fff;border-radius:50%;width:40rpx;height:40rpx;text-align:center;line-height:40rpx}
.thumb.add{display:flex;align-items:center;justify-content:center;border:2rpx dashed #ddd;color:#bbb;font-size:48rpx}
.rules{margin:18rpx 24rpx;color:#666;font-size:24rpx}
.rules .hd{font-size:26rpx;color:#333;font-weight:600;margin-bottom:6rpx}
.rules .li{margin:4rpx 0;line-height:1.6}
.submit-wrap{position:sticky;bottom:0;padding:12rpx 24rpx;background:transparent}
.btn{padding:16rpx;border-radius:12rpx;text-align:center}
.btn.primary{background:#ff7a00;color:#fff}
.btn.ghost{background:#fff;color:#ff7a00;border:2rpx solid #ff7a00}
.btn.sm{padding:10rpx 16rpx;font-size:24rpx}
.btn.lg{padding:18rpx;font-size:30rpx}
.pop{width:560rpx;background:#fff;border-radius:20rpx;padding:22rpx}
.pop-hd{font-weight:700;font-size:30rpx;margin-bottom:10rpx}
.pop-bd{color:#555;font-size:26rpx;line-height:1.7;margin-bottom:12rpx}
</style>
