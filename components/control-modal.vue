<template>
  <view v-if="visible" class="overlay">	
    <view class="mask" v-show="showMask" @tap="onMaskTap"></view>

    <!-- Bottom Sheet：高度可变（吸附） -->
    <view
      class="sheet"
      :style="{ height: sheetPx + 'px', transition: dragging ? 'none' : 'height .22s ease' }"
      @touchstart.stop="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend.stop="onTouchEnd"
    >
      <!-- 抽拉手柄 -->
      <view class="grabber"></view>

      <!-- 顶部栏（只在 full 態显示标题关闭） -->
      <view class="topbar" v-show="isFull">
        <text class="top-title">还车点</text>
        <view class="top-close" @tap="emit('close')">×</view>
      </view>

      <!-- 可滚动主体（让长内容不卡住） -->
      <scroll-view scroll-y class="body">

        <view class="panel">

          <!-- 车辆卡 -->
          <view class="car-card">
            <view class="car-row">
              <image class="car-img" :src="carImage" mode="widthFix" />
              <view class="info">
                <view class="plate">
                  <text class="pro">闽</text>
                  <text class="mid">C·</text>
                  <text class="num">{{ plateNumber || '--' }}</text>
                </view>

                <view class="model">
                  <image class="qiche" src="/static/icons/qiche.png" />
                  <text class="model-text">{{ carModel || 'EC200' }}</text>
                  <view class="vline"></view>
                  <text class="seat">{{ seatNum || 4 }}座</text>
                </view>

                <view class="stats">
                  <view class="stat">
                    <view class="dot-lv"></view>
                    <text class="stat-txt">{{ batteryPct }}%</text>
                  </view>
                  <view class="stat">
                    <view class="circle-lv"></view>
                    <text class="stat-txt">{{ fmt(range, 2) }}km</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="addr">
              <image class="pin" src="/static/icons/map-hui.png" />
              <text class="addr-text ell">{{ location || '未知网点' }}</text>
              <view class="pill-edit" @tap="onChangeLocation">修改</view>
            </view>
          </view>

          <!-- 分隔线 -->
          <view class="divider"></view>

          <!-- 三行信息 -->
          <view class="kv">
            <text class="k">行驶时间</text>
            <text class="v">{{ formatDrivingTimeFull(currentTripData.duration) }}</text>
          </view>
          <view class="kv">
            <text class="k">行驶里程</text>
            <text class="v">{{ formatDistanceKm(currentTripData.distance) }}</text>
          </view>
          <view class="kv">
            <text class="k">当前费用</text>
            <text class="v v-fee">¥{{ fmt(currentTripData.currentCost) }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="ops">
            <button class="op-btn" @tap="onOpenDoor">开门</button>
            <button class="op-btn" @tap="onCloseDoor">关门</button>
            <button class="op-btn" @tap="onHonkHorn">鸣笛</button>
            <button class="op-btn" @tap="onFindCar">找车</button>
          </view>

          <!-- 黄色提示（纯 CSS 圆点） -->
          <view class="notice">
            <view class="dot"></view>
            <text class="notice-text">请确认车辆停放在指定位置，关闭所有车灯、车门和车窗</text>
          </view>

          <!-- 主按钮 -->
          <button class="btn-primary" @tap="handleConfirm">支付并还车</button>

          <view class="safe-bottom"></view>
        </view>
      </scroll-view>
    </view>
	
	    <NiceToast ref="toastRef" />  <!-- ✅ 放在 overlay 内部，层级高 -->

  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import NiceToast from '@/components/common/NiceToast.vue'

/* --------------------------- Props & Emits --------------------------- */
const props = defineProps({
  visible: { type: Boolean, default: false },

  // 初始吸附段：'peek' | 'half' | 'full'
  snap: { type: String, default: 'half' },

  // 是否点击遮罩关闭
  closeOnMask: { type: Boolean, default: true },

  // 车辆信息
  carModel: { type: String, default: '' },
  seatNum: { type: [String, Number], default: 4 },
  batteryPct: { type: [String, Number], default: 80 },
  carImage: { type: String, default: '/static/car1.png' },
  plateNumber: { type: String, default: '' },
  location: { type: String, default: '' },
  range: { type: [String, Number], default: 0 },

  // 计费
  ratePerHour: { type: Number, default: 10, required: true },
  ratePerKilometer: { type: Number, default: 2, required: true },

  // 开始时间（秒或 ISO）
  startTime: { type: [String, Number], default: 0, required: true },
  

})

const emit = defineEmits([
  'close', 'change-location', 'cancel',
  'open-door', 'close-door', 'honk-horn', 'find-car',
  'confirm', 'update:driving-data'
])

/* --------------------------- Sheet 尺寸/拖拽 --------------------------- */
const winH = ref(uni.getSystemInfoSync().windowHeight) // px
const snaps = { peek: 0.36, half: 0.72, full: 0.96 }    // 占屏高度
const sheetPx = ref(0)
const dragging = ref(false)

const isFull = computed(() => sheetPx.value >= winH.value * snaps.full - 2)
const showMask = computed(() => true) // 始终有遮罩，页面感更强

function toPx(level){ return Math.round(winH.value * (snaps[level] || snaps.half)) }
function expandTo(level){
  sheetPx.value = toPx(level)
}
function onMaskTap(){
  if (!props.closeOnMask) return
  emit('close')
}

// touch
let startY = 0
let startH = 0
function onTouchStart(e){
  dragging.value = true
  startY = e.touches?.[0]?.clientY || 0
  startH = sheetPx.value
}
function onTouchMove(e){
  const y = e.touches?.[0]?.clientY || 0
  const dy = startY - y // 上拉为正，下拉为负
  let next = startH + dy
  const minH = toPx('peek'), maxH = toPx('full')
  if (next < minH) next = minH
  if (next > maxH) next = maxH
  sheetPx.value = next
}
function onTouchEnd(){
  dragging.value = false
  // 吸附到最近段
  const candidates = ['peek','half','full'].map(k => ({ k, v: toPx(k) }))
  candidates.sort((a,b)=> Math.abs(a.v - sheetPx.value) - Math.abs(b.v - sheetPx.value))
  expandTo(candidates[0].k)
}

/* ------------------------------ State ------------------------------- */
const currentTripData = ref({ duration: 0, distance: 0, currentCost: 0 })

/* -------------------------- Money Helpers --------------------------- */
const toCent   = (x) => Math.round(Number(x ?? 0) * 100)
const fromCent = (c) => Number(c || 0) / 100
function fmt(n, digits = 2) {
  const v = Number(n ?? 0)
  if (!Number.isFinite(v)) return (0).toFixed(digits)
  const p = 10 ** digits
  return (Math.round((v + Number.EPSILON) * p) / p).toFixed(digits)
}

/* ------------------------- Cost Computation ------------------------- */
const timeCostCent = computed(() => {
  const hours = currentTripData.value.duration / 3600
  return toCent(hours * props.ratePerHour)
})
const distanceCostCent = computed(() => {
  const kms = currentTripData.value.distance / 1000
  return toCent(kms * props.ratePerKilometer)
})

/* ---------------------------- Formatters --------------------------- */
const formatDrivingTimeFull = (seconds) => {
  const s = Math.max(0, Number(seconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}小时${m}分${sec}秒`
  if (m > 0) return `${m}分${sec}秒`
  return `${sec}秒`
}
const formatDistanceKm = (meters) => {
  const km = Number(meters || 0) / 1000
  return `${(Math.round(km * 10) / 10).toFixed(1)}公里`
}

/* ---------------------------- Handlers ----------------------------- */
const onOpenDoor = () => emit('open-door')
const onCloseDoor = () => emit('close-door')
const onHonkHorn  = () => emit('honk-horn')
const onFindCar   = () => emit('find-car')
const onChangeLocation = () => emit('change-location')

function handleConfirm(){
  stopTimer()
  emit('confirm', {
    ...currentTripData.value,
    timeCost: Number(fmt(fromCent(timeCostCent.value))),
    distanceCost: Number(fmt(fromCent(distanceCostCent.value))),
  })
}

/* ------------------------------ Timer ------------------------------ */
const timerActive = ref(false)
let timer = null

function getStartSecond() {
  if (!props.startTime) return 0
  return typeof props.startTime === 'string'
    ? Math.floor(new Date(props.startTime).getTime() / 1000)
    : Number(props.startTime || 0)
}

function updateTripData() {
  const now = Math.floor(Date.now() / 1000)
  const startSec = getStartSecond()
  if (!startSec) return
  const dur = Math.max(0, now - startSec)
  currentTripData.value.duration = dur
  currentTripData.value.distance = Math.floor(dur * 8.33) // ~30km/h
  const totalCent = timeCostCent.value + distanceCostCent.value
  currentTripData.value.currentCost = fromCent(totalCent)
  emit('update:driving-data', { ...currentTripData.value })
}

function startTimer() {
  if (timerActive.value || !getStartSecond()) return
  timerActive.value = true
  updateTripData()
  timer = setInterval(updateTripData, 1000)
}
function stopTimer() {
  if (!timerActive.value) return
  clearInterval(timer); timer = null; timerActive.value = false
}

/* --------------------------- Lifecycle/Watch ----------------------- */
onMounted(() => {
  // 初始高度
  expandTo(props.snap)
  if (props.visible && getStartSecond()) startTimer()
})
onUnmounted(() => { stopTimer() })
watch(() => props.visible, (v) => { 
  if (v) { expandTo(props.snap); startTimer() } else { stopTimer() }
})
watch(() => props.startTime, () => { if (props.visible) { stopTimer(); startTimer() } })

/* ---------------------------- 暴露方法 ----------------------------- */
defineExpose({ expandTo, close: () => emit('close'),showToast: (msg, type='success', dur=1600) => toastRef.value?.show(msg, type, dur) })
</script>

<style scoped>
/* 覆盖层 + 遮罩 */
.overlay{ position:fixed; inset:0; z-index:1500; }
.mask{ position:fixed; inset:0; background:rgba(0,0,0,.35); }

/* Bottom Sheet 容器（高度可变） */
.sheet{
  position:fixed; left:0; right:0; bottom:0;
  background:#FFFFFF;
  border-top-left-radius:24rpx; border-top-right-radius:24rpx;
  box-shadow:0 -8rpx 24rpx rgba(0,0,0,.12);
  display:flex; flex-direction:column; overflow:hidden;
}

/* 抽拉手柄 */
.grabber{
  width:88rpx; height:10rpx; border-radius:999rpx; background:#E6E8EE;
  margin:12rpx auto 8rpx;
}

/* full 态顶部栏 */
.topbar{
  height:88rpx; padding:0 18rpx;
  border-bottom:2rpx solid #F0F2F5;
  display:flex; align-items:center; justify-content:space-between;
}
.top-title{ font-size:34rpx; font-weight:600; color:#222; }
.top-close{ width:64rpx; height:64rpx; line-height:64rpx; text-align:center; font-size:44rpx; color:#999; }

/* 滚动主体 */
.body{ flex:1; }

/* 内层内容 */
.panel{ padding: 6rpx 18rpx 0; }

.car-card{
  background:#fff; border-radius:24rpx;
  box-shadow:0 8rpx 20rpx rgba(0,0,0,.06);
  padding:18rpx 18rpx 12rpx;
}
.car-row{ display:flex; gap:16rpx; }
.car-img{ width:236rpx; height:auto; display:block; }
.info{ flex:1; min-width:0; }

.plate{ height:60rpx; line-height:60rpx; }
.pro{ font-size:40rpx; color:#222; margin-right:4rpx; }
.mid,.num{ font-family:D-DIN; font-weight:700; font-size:44rpx; color:#222; }

.model{ margin-top:6rpx; display:flex; align-items:center; gap:10rpx; }
.qiche{ width:28rpx; height:28rpx; }
.model-text{ font-size:26rpx; color:#8A8A8A; }
.vline{ width:2rpx; height:26rpx; background:#DDD; margin:0 6rpx; }
.seat{ font-size:26rpx; color:#8A8A8A; }

.stats{ margin-top:8rpx; display:flex; align-items:center; gap:24rpx; }
.stat{ display:flex; align-items:center; gap:8rpx; }
.dot-lv{ width:16rpx; height:16rpx; background:#34C46E; border-radius:4rpx; }
.circle-lv{ width:16rpx; height:16rpx; border:4rpx solid #34C46E; border-radius:9999rpx; }
.stat-txt{ font-size:28rpx; color:#34C46E; }

.addr{ margin-top:10rpx; display:flex; align-items:center; gap:10rpx; }
.pin{ width:26rpx; height:26rpx; }
.addr-text{ flex:1; font-size:26rpx; color:#666; }
.pill-edit{
  background:#FFF8E6; color:#7B4A00;
  padding:0 18rpx; height:48rpx; display:flex; align-items:center; justify-content:center;
  border-radius:999rpx; font-size:26rpx; border:2rpx solid #FEC74A;
}

/* 分隔线 */
.divider{ height:2rpx; background:#EEF1F5; margin:12rpx 18rpx 0; border-radius:2rpx; }

/* 三行信息（加大） */
.kv{ display:flex; align-items:center; justify-content:space-between; padding:26rpx 18rpx 0; font-size:30rpx; color:#666; }
.kv + .kv{ margin-top:10rpx; }
.kv .v{ color:#333; font-size:34rpx; }
.kv .v-fee{ color:#E70000; font-weight:700; font-size:44rpx; }

/* 操作按钮 */
.ops{ display:flex; gap:14rpx; margin:24rpx 18rpx 14rpx; }
.op-btn{ flex:1; height:78rpx; line-height:78rpx; border:2rpx solid #15C45B; color:#15C45B; background:#F3FFF7; border-radius:16rpx; font-size:30rpx; }

/* 黄色提示 */
.notice{ margin:0 18rpx 18rpx; padding:12rpx 14rpx; background:#FFF9E6; border-radius:12rpx; display:flex; align-items:center; gap:10rpx; }
.dot{ width:22rpx; height:22rpx; background:#FFC14A; border-radius:50%; }
.notice-text{ font-size:26rpx; color:#A26B00; }

/* 主按钮 + 安全区 */
.btn-primary{
  margin: 8rpx 18rpx 18rpx;
  height:100rpx; line-height:100rpx; border-radius:50rpx;
  color:#fff; font-size:36rpx; font-weight:600;
  background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  box-shadow:0 6rpx 12rpx rgba(13,182,61,.25);
}
.safe-bottom{ height: calc(12rpx + env(safe-area-inset-bottom)); }

/* 工具 */
.ell{ overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
</style>
