<template>
  <view v-if="visible" class="overlay" @tap.stop="" catchtouchmove="true" @touchmove.stop.prevent>	
    <view class="mask" v-show="showMask"
        catchtap="true" catchtouchmove="true" @touchmove.stop.prevent ></view>

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
        <text class="top-title">车辆控制</text>
        <!-- <view class="top-close" @tap="emit('close')">×</view> -->
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
           <!--       <text class="pro">闽</text>
                  <text class="mid">C·</text> -->
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
                    <!-- <view class="dot-lv"></view> -->
					 <image class="ico ico-battery" src="/static/icons/battery.png" mode="widthFix" />
                    <text class="stat-txt">{{ batteryPct }}%</text>
                  </view>
                  <view class="stat">
                    <image class="ico ico-range" src="/static/icons/licheng.png"  mode="widthFix" />
                    <text class="stat-txt">{{ fmt(range, 2) }}km</text>
                  </view>
                </view>
              </view>
            </view>

            <view class="addr">
              <image class="pin" src="/static/icons/map-hui.png" />
              <text class="addr-text ell">{{ location || '未知网点' }}</text>
              <!-- 把这里的“修改”做成小按钮 -->
              <view class="pill-edit"  
			    @tap.stop="onChangeLocation"
			      @touchstart.stop="tgStart($event, onChangeLocation)"
			      @touchmove.stop="tgMove"
			      @touchend.stop="tgEnd">
			  <text>修改</text></view>
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

          <!-- 操作按钮（新版：小按钮） -->
          <view class="op-row">
            <view class="op-small"
                  @tap.stop="onOpenDoor"
                  @touchstart.stop="tgStart($event, onOpenDoor)"
                  @touchmove.stop="tgMove"
                  @touchend.stop="tgEnd">
              <text>开门</text>
            </view>
          
            <view class="op-small"
                  @tap.stop="onCloseDoor"
                  @touchstart.stop="tgStart($event, onCloseDoor)"
                  @touchmove.stop="tgMove"
                  @touchend.stop="tgEnd">
              <text>关门</text>
            </view>
          
            <view class="op-small"
                  @tap.stop="onHonkHorn"
                  @touchstart.stop="tgStart($event, onHonkHorn)"
                  @touchmove.stop="tgMove"
                  @touchend.stop="tgEnd">
              <text>鸣笛</text>
            </view>
          
            <view class="op-small"
                  @tap.stop="onFindCar"
                  @touchstart.stop="tgStart($event, onFindCar)"
                  @touchmove.stop="tgMove"
                  @touchend.stop="tgEnd">
              <text>找车</text>
            </view>
          </view>



          <!-- 分隔线 -->
          <view class="divider"></view>
		  
          <!-- 黄色提示（纯 CSS 圆点） -->
          <view class="notice">
            <image class="notice-icon" src="/static/icons/warn-yellow.png" mode="widthFix" />
            <text class="notice-text">请确认车辆停放在指定位置，关闭所有车灯、车门和车窗</text>
          </view>

          <!-- 主按钮 -->
          <button class="btn-primary"
		   @tap.stop="handleConfirm"
		   @touchstart.stop="tgStart($event, handleConfirm)"
		   @touchmove.stop="tgMove"
		   @touchend.stop="tgEnd"
		   @tap="handleConfirm">还车</button>

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
  'close', 'change-location',
  'open-door', 'close-door', 'honk-horn', 'find-car',
  'confirm', 'update:driving-data'
])

/* --------------------------- Sheet 尺寸/拖拽 --------------------------- */
// 统一拿窗口尺寸（优先新 API，向下兼容旧端）
function getWindowHeight() {
  // #ifdef MP-WEIXIN
  if (wx.getWindowInfo) {
    const info = wx.getWindowInfo()
    return info.windowHeight
  }
  // #endif
  if (typeof uni.getWindowInfo === 'function') {
    const info = uni.getWindowInfo()
    return info.windowHeight
  }
  try {
    const info = uni.getSystemInfoSync()
    return info.windowHeight
  } catch (e) {
    return 667 // 兜底
  }
}

const winH = ref(getWindowHeight()) // px

const snaps = { peek: 0.36, half: 0.72, full: 0.96 }    // 占屏高度
const sheetPx = ref(0)
const dragging = ref(false)

const isFull = computed(() => sheetPx.value >= winH.value * snaps.full - 2)
const showMask = computed(() => true) // 始终有遮罩，页面感更强

// ✅ 补上 toastRef，避免 defineExpose 用到时报错
const toastRef = ref(null)

// 图标路径（按你项目静态资源放置；若命名不同，替换为你的文件名即可）
const rangeIcon = '/static/icons/battery.png' // e.g. 里程/路线图标

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

// // --- 兜底 tap：在祖先 touchmove.prevent 存在时，自己决定“算点击” ---
// const peState = { x: 0, y: 0, moved: false, t: 0 }
// const TAP_MOVE_THRESHOLD = 8   // px，手指移动小于 8px 视为点击
// const TAP_TIME_THRESHOLD = 350 // ms，时间太久就不算点击

// function peOnStart(e){
//   const t = e.touches?.[0]
//   peState.x = t?.clientX || 0
//   peState.y = t?.clientY || 0
//   peState.moved = false
//   peState.t = Date.now()
// }

// function peOnMove(e){
//   const t = e.touches?.[0]
//   const dx = Math.abs((t?.clientX || 0) - peState.x)
//   const dy = Math.abs((t?.clientY || 0) - peState.y)
//   if (dx > TAP_MOVE_THRESHOLD || dy > TAP_MOVE_THRESHOLD) {
//     peState.moved = true
//   }
// }

// function peOnEnd(){
//   // 若 tap 被上层 prevent 吃掉，这里手动触发
//   const dt = Date.now() - peState.t
//   if (!peState.moved && dt < TAP_TIME_THRESHOLD) {
//     // ✅ 兜底：当成点击
//     onChangeLocation()
//   }
//   // 若已经触发了 @tap，重复调用也无副作用（你可按需加节流）
// }

/* ---------------------- */
// —— 通用“安全点击”守卫：tap 被上层 prevent 吃掉时，自己在 touchend 里补触发 —— //
const TG_MOVE_PX = 8;      // 手指移动阈值（px）
const TG_TIME_MS = 350;    // 点击最长时间（ms）
const tgState = { x:0, y:0, moved:false, t:0, fn:null };

function tgStart(e, fn){
  const t = e.touches?.[0];
  tgState.x = t?.clientX || 0;
  tgState.y = t?.clientY || 0;
  tgState.moved = false;
  tgState.t = Date.now();
  tgState.fn = fn;         // 记录要触发的函数（如 onOpenDoor）
}

function tgMove(e){
  const t = e.touches?.[0];
  const dx = Math.abs((t?.clientX || 0) - tgState.x);
  const dy = Math.abs((t?.clientY || 0) - tgState.y);
  if (dx > TG_MOVE_PX || dy > TG_MOVE_PX) tgState.moved = true;
}

function tgEnd(){
  const dt = Date.now() - tgState.t;
  if (!tgState.moved && dt < TG_TIME_MS) {
    // ✅ 兜底触发（即使 tap 因祖先 touchmove.prevent 没有合成）
    tgState.fn && tgState.fn();
  }
  tgState.fn = null;
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
.overlay{ position:fixed; inset:0; z-index: 9999;}
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
  position: relative; 
  height:88rpx; padding:0 18rpx;
  border-bottom:2rpx solid #F0F2F5;
  display:flex; align-items:center; justify-content:space-between;
}
.top-title{ position:absolute; left:50%; transform:translateX(-50%);  font-size:34rpx; font-weight:600; color:#222;   text-align: center;   /* 水平居中 */ }
.top-close{ position: absolute; right:18rpx; top:50%; transform:translateY(-50%);   width:64rpx; height:64rpx; line-height:64rpx; text-align:center; font-size:44rpx; color:#999; }

/* 滚动主体 */
.body{ flex:1; }

/* 内层内容 */
.panel{ padding: 6rpx 18rpx 0; }

.car-card{
  background:#fff; border-radius:24rpx;
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

/* 统计图标 */
.ico{ width:28rpx; height:28rpx; display:block; }
.ico-battery, .ico-range{ width:28rpx; height:28rpx; }

/* 统计文案统一保持绿色系，与设计一致 */
.stat-txt{ font-size:28rpx; color:#13BC45; }


.addr{ margin-top:10rpx; display:flex; align-items:center; gap:10rpx; }
.pin{ width:26rpx; height:26rpx; }
.addr-text{ flex:1; font-size:26rpx; color:#666; }
.pill-edit{
    width:128rpx;
    height:48rpx;
    background: linear-gradient(270deg, #FDD41F 0%, #FFC868 100%);
    border-radius:24rpx;
    display:flex;
    align-items:center;
    justify-content:center;
}
.pill-edit text{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight:400;
  font-size:28rpx;
  color:#222222;
  line-height:32rpx;
  text-align:center;
}

/* 行容器 */
.op-row{
  margin: 40rpx 10rpx;
  display:flex; flex-wrap:wrap; gap:18rpx;
}

/* 小按钮：#E4F6EC 背景、8rpx 圆角、文字 #13BC45 */
.op-small{
  width:160rpx; height:80rpx;
  background:#E4F6EC;
  border-radius:8rpx;
  display:flex; align-items:center; justify-content:center;
  transition: transform .06s ease, opacity .06s ease;
}
.op-small:active{ transform:scale(.98); opacity:.9; }

.op-small text{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight:500;
  font-size:32rpx;
  color:#13BC45;
  line-height:32rpx;
  text-align:center;
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
.notice{
  margin: 20rpx 0;
  padding: 7rpx 24rpx;
  background: transparent;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}.notice-icon{
  width: 32rpx;
  height: 32rpx;
}
.notice-text{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 550;
  font-size: 22rpx;
  color: #F4A33E;
  line-height: 36rpx;
  text-align: right;
  font-style: normal;
  text-transform: none;
  
}

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
