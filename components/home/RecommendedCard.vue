<template>
  <view class="reco-wrap">
    <view class="reco-hd">
      <image class="car-ico" src="/static/home/car.png" />
      <view class="reco-title-wrap">
        <text class="reco-title">推荐用车</text>
        <image class="reco-underline" src="/static/home/huxing.png" mode="widthFix" />
      </view>
    </view>

    <view class="rec-card">
      <image class="che-pic" :src="carImage" mode="widthFix" />
      <image class="tag-zuijia" src="/static/home/zuijia.png" />
      <image class="btn-youhua" src="/static/home/youhua.png" />

      <view class="plate-price">
        <text class="plate-num">
          <text class="plate-prov">{{ plate.prov }}</text>
          <text class="plate-mid">{{ plate.mid }}</text>
          <text class="plate-id">{{ plate.id }}</text>
        </text>
        <view class="price-box">
          <text class="price-n">{{ price }}</text>
          <text class="price-u">¥</text>
        </view>
        <text class="price-qi">起</text>
      </view>

      <view class="spec-line">
        <image class="sp-ico" src="/static/home/battery.png" />
        <text class="sp-txt">{{ restEnergy }}</text>
        <image class="sp-ico" src="/static/home/licheng.png" />
        <text class="sp-txt">{{ distanceKm }}</text>
        <image class="sp-ico" src="/static/home/walk.png" />
        <text class="sp-txt">30m</text>
        <text class="sp-sub">（约1min）</text>
      </view>

      <button class="big-btn" @tap="$emit('use', raw)">立即用车</button>

      <view class="zhima-row">
        <image class="zhima-ico" src="/static/home/zhima.png" />
        <text class="zhima-txt">芝麻信用分｜650分以上有机会免押租车</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'               // ✅ 必须引入
const props = defineProps({
  car: { type: Object, default: () => ({}) },
  formatImage: { type: Function, default: (s)=>s }
})

const raw = computed(() => props.car || {})

// 兜底图片
const carImage = computed(() => {
  const img = raw.value?.carImage
  const url = props.formatImage ? props.formatImage(img) : img
  return url || '/static/home/che-pic.png'
})

// 兜底车牌，按“闽C·D12345”这种分三段展示
const plateText = computed(() => (raw.value?.carNum || '闽C·D12345') + '')
const plate = computed(() => {
  const t = plateText.value
  // 去掉空白，保证有长度
  const s = (t || '').trim()
  // 允许没有中间的“·”
  const p1 = s.slice(0, 1)
  const p2 = s.slice(1, 3)
  const p3 = s.slice(3)
  return { prov: p1 || '', mid: p2 || '', id: p3 || '' }
})

const price = computed(() => (raw.value?.price ?? 8.0))
const restEnergy = computed(() => (raw.value?.restEnergy ?? 0))
const distanceKm = computed(() => (raw.value?.distanceKm ?? 0))
</script>

<style scoped>
/* —— 样式保持你之前版本 —— */
.reco-wrap{width:710rpx;margin:-14rpx auto 0;border-radius:24rpx;overflow:hidden;background:linear-gradient(180deg,#F4FFF8 0%,#F9FFFC 100%);box-shadow:0 8rpx 24rpx rgba(0,0,0,.06);position:relative;z-index:1;padding-bottom:22rpx}
.reco-hd{display:flex;align-items:center;height:72rpx;margin:16rpx 20rpx 0;padding:0 20rpx;background:none;box-shadow:none;border-radius:0}
.car-ico{width:40rpx;height:40rpx;margin-right:12rpx}
.reco-title-wrap{position:relative;display:inline-flex;align-items:flex-end;padding-bottom:8rpx}
.reco-title{font-weight:800;font-size:32rpx;color:#222;line-height:40rpx}
.reco-underline{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:44rpx;height:6rpx}
.rec-card{padding:20rpx;position:relative}
.che-pic{width:560rpx;max-width:100%;margin:18rpx auto;display:block;object-fit:contain}
.tag-zuijia{position:absolute;left:70rpx;top:0;width:160rpx;height:48rpx}
.btn-youhua{position:absolute;right:24rpx;top:116rpx;width:48rpx;height:48rpx}
.plate-price{display:flex;align-items:flex-start;gap:18rpx}
.plate-num{color:#222;display:flex;align-items:flex-start;line-height:66rpx}
.plate-prov{font-weight:500;font-size:48rpx;line-height:66rpx;color:#222}
.plate-mid{font-weight:700;font-size:56rpx;line-height:66rpx;letter-spacing:6rpx;color:#222}
.plate-id{font-weight:700;font-size:56rpx;line-height:66rpx;letter-spacing:3rpx;color:#222}
.price-box{margin-left:auto;display:flex;align-items:flex-start}
.price-n{font-weight:700;font-size:80rpx;line-height:86rpx;color:#FD0300}
.price-u{font-weight:700;font-size:36rpx;line-height:86rpx;color:#FD0300;margin-left:2rpx}
.price-qi{font-weight:400;font-size:26rpx;line-height:40rpx;color:#AAA;margin-top:30rpx}
.spec-line{display:flex;align-items:center;flex-wrap:wrap;gap:6rpx 14rpx;padding:4rpx 2rpx}
.sp-ico{width:34rpx;height:32rpx;margin-right:4rpx}
.sp-txt{font-size:30rpx;color:#56CA74;line-height:42rpx}
.sp-sub{font-size:22rpx;color:#CCC}
.big-btn{width:100%;height:96rpx;border-radius:48rpx;background:linear-gradient(180deg,#82ED71 0%,#0DB63D 100%);color:#fff;font-size:32rpx;font-weight:800;letter-spacing:2rpx;box-shadow:0 10rpx 22rpx rgba(19,182,61,.22);display:flex;align-items:center;justify-content:center;margin-top:14rpx}
.zhima-row{display:flex;justify-content:center;align-items:center;gap:10rpx;margin-top:16rpx}
.zhima-ico{width:28rpx;height:28rpx}
.zhima-txt{text-align:center;font-size:24rpx;color:#888;line-height:34rpx}
</style>
