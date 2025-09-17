<template>
  <view v-if="visible" class="overlay"
        @tap.stop="" catchtouchmove="true" @touchmove.stop.prevent>
    <!-- 遮罩 -->
    <view class="mask" v-show="showMask"
          @tap="onMaskTap"
          @touchstart.stop
          @touchmove.stop.prevent></view>

    <!-- Sheet -->
    <view class="sheet" :style="sheetStyle"
          @touchstart.stop="onTouchStart"
          @touchmove.stop.prevent="onTouchMove"
          @touchend.stop="onTouchEnd">

      <!-- 全局关闭 -->
      <!-- #ifdef H5 -->
      <view class="close-x" @click.stop="safeCancel">×</view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="close-x"
            @tap.stop="safeCancel"
            @touchstart.stop="tgStart($event, safeCancel)"
            @touchmove.stop="tgMove"
            @touchend.stop="tgEnd">×</view>
      <!-- #endif -->

      <!-- 抓手 -->
      <view class="grabber" @touchstart.stop="onGrabStart"></view>

      <!-- 顶部栏 -->
      <view class="topbar" v-show="isFull">
        <text class="top-title">{{ title }}</text>
      </view>

      <!-- 主体 -->
      <view class="body">
        <view class="section">
          <view class="title-wrap">
            <text class="title-lg">{{ title }}</text>
            <view class="underline"></view>
          </view>
          <text class="desc">
            为了你的合法权益，请您拍摄四个角度的车辆照片，辛苦啦~
          </text>
        </view>

        <!-- 照片网格 -->
        <view class="photo-grid">
          <!-- H5：仅 click -->
          <!-- #ifdef H5 -->
          <view v-for="(item, index) in photoList"
                :key="'h5-'+index"
                class="photo-item"
                @click.stop="safeUpload(index)">
            <image v-if="item.url" :src="item.url" class="photo" mode="aspectFill" />
            <view v-else class="placeholder">
              <image class="ico" src="/static/icons/pic-kong.png" mode="aspectFit" />
            </view>
            <view v-if="item.url" class="overlay-tag">重新上传</view>
            <text class="label">{{ item.label }}</text>
          </view>
          <!-- #endif -->

          <!-- 非 H5：沿用 tap + tg* 守卫 -->
          <!-- #ifndef H5 -->
          <view v-for="(item, index) in photoList"
                :key="'other-'+index"
                class="photo-item"
                @tap.stop="safeUpload(index)"
                @touchstart.stop="tgStart($event, () => safeUpload(index))"
                @touchmove.stop="tgMove"
                @touchend.stop="tgEnd">
            <image v-if="item.url" :src="item.url" class="photo" mode="aspectFill" />
            <view v-else class="placeholder">
              <image class="ico" src="/static/icons/pic-kong.png" mode="aspectFit" />
            </view>
            <view v-if="item.url" class="overlay-tag">重新上传</view>
            <text class="label">{{ item.label }}</text>
          </view>
          <!-- #endif -->
        </view>

        <view class="safe-bottom"></view>
      </view>

      <!-- 底部提交 -->
      <view class="footer">
        <!-- H5：仅 click -->
        <!-- #ifdef H5 -->
        <button class="btn-primary"
                :class="{ disabled: !canSubmit }"
                :disabled="!canSubmit"
                @click.stop="safeSubmit">
          {{ btnText }}
        </button>
        <!-- #endif -->

        <!-- 非 H5：tap + tg* -->
        <!-- #ifndef H5 -->
        <button class="btn-primary"
                :class="{ disabled: !canSubmit }"
                :disabled="!canSubmit"
                @tap.stop="safeSubmit"
                @touchstart.stop="tgStart($event, safeSubmit)"
                @touchmove.stop="tgMove"
                @touchend.stop="tgEnd">
          {{ btnText }}
        </button>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

/** ==== Props & Emits ==== */
const props = defineProps({
  visible: { type: Boolean, default: false },
  snap: { type: String, default: 'twoThirds' },
  initialRatio: { type: Number, default: 0.666 },
  closeOnMask: { type: Boolean, default: false },
  cancelAction: { type: String, default: 'back' },
  mode: { type: String, default: 'pickup' }
})
const emit = defineEmits(['close', 'submit'])

/** ==== 文案 ==== */
const title   = computed(() => (props.mode === 'pickup' ? '取车照片' : '还车照片'))
const btnText = computed(() => (props.mode === 'pickup' ? '取车' : '还车'))

/** ==== 照片列表 ==== */
const photoList = ref([
  { label: '车辆左前方照片', url: '' },
  { label: '车辆右前方照片', url: '' },
  { label: '车辆左后方照片', url: '' },
  { label: '车辆右后方照片', url: '' },
])
const canSubmit = computed(() => photoList.value.every(p => !!p.url))

/** ==== 尺寸/拖拽 ==== */
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
    return 667
  }
}
const winH = ref(getWindowHeight()) // px
const snaps = { peek: 0.36, half: 0.68, full: 0.96, twoThirds: 0.666 }
const sheetPx = ref(0)
const dragging = ref(false)
const isFull = computed(() => sheetPx.value >= winH.value * snaps.full - 2)
const showMask = computed(() => true)

function toPx(level){
  const key = snaps[level] != null ? level : 'half'
  return Math.round(winH.value * snaps[key])
}
function expandTo(level){
  if (level === 'custom') {
    sheetPx.value = Math.round(winH.value * Math.min(Math.max(props.initialRatio, 0.3), 0.98))
  } else {
    sheetPx.value = toPx(level)
  }
}
const sheetStyle = computed(() => ({
  height: sheetPx.value + 'px',
  transition: dragging.value ? 'none' : 'height .22s cubic-bezier(.2,.8,.3,1)',
  willChange: 'height'
}))

function onMaskTap(){ if (props.closeOnMask) onCancel() }

/** 拖拽逻辑 */
const dragFromGrabber = ref(false)
function onGrabStart(){ dragFromGrabber.value = true }

let startY = 0, startH = 0, startScrollTop = 0
const bodyScrolledTop = ref(true)
const lastScrollTop = ref(0)

function onTouchStart(e){
  startY = e.touches?.[0]?.clientY || 0
  startH = sheetPx.value
  startScrollTop = lastScrollTop.value
  dragging.value = dragFromGrabber.value || bodyScrolledTop.value
}
function onTouchMove(e){
  if (!dragging.value) return
  const y = e.touches?.[0]?.clientY || 0
  const dy = startY - y
  if (!bodyScrolledTop.value && dy > 0) {
    dragging.value = false
    dragFromGrabber.value = false
    return
  }
  const minH = Math.round(winH.value * snaps.peek)
  const maxH = Math.round(winH.value * snaps.full)
  let next = startH + dy
  if (next < minH) next = minH
  if (next > maxH) next = maxH
  sheetPx.value = next
}
function onTouchEnd(){
  if (!dragging.value) { dragFromGrabber.value = false; return }
  dragging.value = false
  dragFromGrabber.value = false
  const candidates = [
    { k: 'peek', v: Math.round(winH.value * snaps.peek) },
    { k: 'twoThirds', v: Math.round(winH.value * snaps.twoThirds) },
    { k: 'half', v: Math.round(winH.value * snaps.half) },
    { k: 'full', v: Math.round(winH.value * snaps.full) },
  ]
  candidates.sort((a,b)=> Math.abs(a.v - sheetPx.value) - Math.abs(b.v - sheetPx.value))
  expandTo(candidates[0].k)
}

/** body 滚动同步（当前 body 未做 scroll-view，这里保留接口） */
function onBodyScroll(e){
  const st = Number(e.detail?.scrollTop || 0)
  lastScrollTop.value = st
  bodyScrolledTop.value = st <= 0
}

/** ========= 交互 ========= */
const openedAt = ref(0)
watch(() => props.visible, v => { if (v) openedAt.value = Date.now() })
function guardJustOpened(){ return Date.now() - openedAt.value < 220 }

/* 额外防重入：H5 某些内核可能仍触发两次，这里再加一层锁 */
const pickingUpload = ref(false)

function onUpload(index){
  if (guardJustOpened()) return
  if (pickingUpload.value) return
  pickingUpload.value = true
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      photoList.value[index].url = res.tempFilePaths?.[0] || ''
    },
    complete: () => {
      // 给个极小延迟，保证第二路事件也被忽略
      setTimeout(() => { pickingUpload.value = false }, 200)
    }
  })
}

function onSubmit(){
  if (!canSubmit.value){
    uni.showToast({ title: '请上传所有照片', icon: 'none' })
    return
  }
  emit('submit', photoList.value.map(x => x.url))
}
function onCancel(){
  if (props.cancelAction === 'back') {
    uni.navigateBack()
  } else {
    emit('close')
  }
}

/** ========= 通用“只执行一次”工具 & 安全封装 ========= */
const _onceMap = new Map()
function runOnce(key, fn, cooldown = 350){
  const now = Date.now()
  const last = _onceMap.get(key) || 0
  if (now - last < cooldown) return
  _onceMap.set(key, now)
  fn && fn()
}
function safeUpload(index){ runOnce('upload-'+index, () => onUpload(index)) }
function safeSubmit(){ runOnce('submit', () => onSubmit()) }
function safeCancel(){ runOnce('cancel', () => onCancel()) }

/** ========= 小程序端“tap 兜底点击守卫” ========= */
const TG_MOVE_PX = 8, TG_TIME_MS = 350
const tgState = { x:0, y:0, moved:false, t:0, fn:null }
function tgStart(e, fn){
  const t = e.touches?.[0]
  tgState.x = t?.clientX || 0
  tgState.y = t?.clientY || 0
  tgState.moved = false
  tgState.t = Date.now()
  tgState.fn = fn
}
function tgMove(e){
  const t = e.touches?.[0]
  const dx = Math.abs((t?.clientX || 0) - tgState.x)
  const dy = Math.abs((t?.clientY || 0) - tgState.y)
  if (dx > TG_MOVE_PX || dy > TG_MOVE_PX) tgState.moved = true
}
function tgEnd(){
  const dt = Date.now() - tgState.t
  if (!tgState.moved && dt < TG_TIME_MS) {
    tgState.fn && tgState.fn()
  }
  tgState.fn = null
}

/** H5 锁滚动 */
function lockBodyScroll(lock){
  // #ifdef H5
  try{
    document.body.style.overflow = lock ? 'hidden' : ''
    document.documentElement.style.overflow = lock ? 'hidden' : ''
  }catch(e){}
  // #endif
}

onMounted(() => {
  if (props.initialRatio) expandTo('custom'); else expandTo(props.snap)
  if (props.visible) lockBodyScroll(true)
})
onUnmounted(() => { lockBodyScroll(false) })
watch(() => props.visible, v => {
  if (props.initialRatio) expandTo('custom'); else expandTo(props.snap)
  dragging.value = false
  dragFromGrabber.value = false
  lastScrollTop.value = 0
  bodyScrolledTop.value = true
  lockBodyScroll(v)
})
</script>

<style scoped>
.overlay{ position:fixed; inset:0; z-index:999999; }
.mask{ position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:0; }
.sheet{
  position:fixed; left:0; right:0; bottom:0; z-index:1;
  background:#FFF;
  border-top-left-radius:24rpx; border-top-right-radius:24rpx;
  box-shadow:0 -8rpx 24rpx rgba(0,0,0,.18);
  display:flex; flex-direction:column; overflow:hidden;
}
.close-x{
  position:absolute; top:16rpx; right:20rpx;
  width:64rpx; height:64rpx; border-radius:50%;
  text-align:center; line-height:64rpx;
  font-size:44rpx; color:#666; background:#F2F4F7; z-index:3;
}
.grabber{
  width:88rpx; height:10rpx; border-radius:999rpx; background:#E6E8EE;
  margin:12rpx auto 8rpx;
}
.topbar{ height:88rpx; padding:0 18rpx; border-bottom:2rpx solid #F0F2F5;
         display:flex; align-items:center; justify-content:center; }
.top-title{ font-size:34rpx; font-weight:600; color:#222; }
/* 主体 */
.body{ width:100%; }

/* 标题 + 渐变下划线 + 描述 */
.section{ padding: 30rpx 24rpx 0; }
.title-wrap{ position: relative; display: inline-block; }
.title-lg{
  display:inline-block; margin-left:30rpx; width:160rpx; height:54rpx;
  font-weight:500; font-size:40rpx; color:#222; line-height:54rpx;
}
.underline{
  margin-top: -16rpx;
  margin-left:36rpx; width:180rpx; height:16rpx;
  background: linear-gradient(90deg, #8AF1A5 0%, rgba(255,255,255,0) 100%);
}
.desc{
  display:block; margin-left:54rpx; margin-top:12rpx;
  width:614rpx; color:#666; font-size:28rpx; line-height:38rpx;
  white-space:normal; word-break:break-word;
}

.photo-grid{ margin-top:24rpx; padding:0 24rpx;
             display:grid; grid-template-columns:1fr 1fr; gap:24rpx; }
.photo-item{ position:relative; display:flex; flex-direction:column; align-items:center; }
.placeholder, .photo{ width:300rpx; height:200rpx; border-radius:24rpx; }
.placeholder{ background:#F7FBFF; border:2rpx solid #E0EEF9;
              display:flex; align-items:center; justify-content:center; }
.label{ margin-top:14rpx; font-size:28rpx; color:#333; }
.overlay-tag{ position:absolute; left:0; right:0; bottom:38rpx;
              height:56rpx; line-height:56rpx; text-align:center;
              font-size:28rpx; color:#fff;
              background:linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.40));
              border-bottom-left-radius:24rpx; border-bottom-right-radius:24rpx; }
.footer{ padding:24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
         background:#fff; box-shadow:0 -4rpx 12rpx rgba(0,0,0,.04); }
.btn-primary{ width:688rpx; height:96rpx; border-radius:48rpx;
              font-size:40rpx; line-height:96rpx; text-align:center; color:#fff;
              background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%); }
.btn-primary.disabled{ background:#CCF0D4 !important; color:#fff !important; }
.safe-bottom{ height:12rpx; }
</style>
