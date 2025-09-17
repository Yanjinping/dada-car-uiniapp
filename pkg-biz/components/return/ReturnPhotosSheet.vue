<template>
  <!-- ✅ 内联也能用：inline=true 时不需要 visible，也不显示遮罩/拖拽 -->
  <view v-if="visible || inline" class="overlay" :class="{ inline: inline }">
    <!-- 遮罩（仅弹出模式） -->
    <view
      v-if="!inline"
      class="mask"
      v-show="showMask"
      @tap="onMaskTap"
      @touchstart.stop
      @touchmove.stop.prevent
    ></view>

    <!-- 容器 -->
    <view
      class="sheet"
      :class="{ 'sheet-inline': inline }"
      :style="sheetStyle"
    >
      <!-- 关闭/抓手（仅弹出模式） -->
      <view v-if="!inline" class="close-x" @tap="onCancel">×</view>
      <view
        v-if="!inline"
        class="grabber"
        @touchstart.stop="onDragStart"
        @touchmove.stop.prevent="onDragMove"
        @touchend.stop="onDragEnd"
      ></view>

      <!-- 顶栏标题：弹出满屏时显示 -->
      <view class="topbar" v-show="!inline && isFull">
        <text class="top-title">{{ title }}</text>
      </view>

      <!-- 主体 -->
      <view class="body">
        <!-- 标题 + 下划线 + 描述 -->
        <view class="section">
          <view class="title-wrap">
            <text class="title-lg">{{ title }}</text>
            <view class="underline"></view>
          </view>
          <text class="desc">
            为了保障你的合法权益，请您拍摄四个角度的车辆照片，辛苦啦~
          </text>
        </view> 

      <!-- ✅ 四宫格（flex+wrap，跨端稳定） -->
      <view class="photo-grid">
        <!-- #ifdef H5 -->
        <view
          v-for="(item, index) in photoList"
          :key="'h5-'+index"
          class="photo-item"
          @click.stop="onUpload(index)"
        >
          <image v-if="item.url" :src="item.url" class="photo" mode="aspectFill" />
          <view v-else class="placeholder">
            <image class="ico" src="/static/icons/pic-kong.png" mode="aspectFit" />
          </view>
          <view v-if="item.url" class="overlay-tag">重新上传</view>
          <text class="label">{{ item.label }}</text>
        </view>
        <!-- #endif -->
      
        <!-- #ifndef H5 -->
        <view
          v-for="(item, index) in photoList"
          :key="'other-'+index"
          class="photo-item"
          @tap="onUpload(index)"
        >
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
      <view class="footer-fixed">
        <NoticeBar class="notic-bar" />
        <button
          class="primary"
          :class="{ 'is-disabled': !canSubmit }"
          :disabled="!canSubmit"
          @tap="onSubmit"
        >
          下一步
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import NoticeBar from '../../components/return/NoticeBar.vue'

/** ==== Props & Emits ==== */
const props = defineProps({
  visible: { type: Boolean, default: false },   // 弹出模式显隐
  inline:  { type: Boolean, default: false },   // ✅ 内联模式（同页使用）
  /** 初始吸附段：'peek' | 'half' | 'full' | 'twoThirds' */
  snap: { type: String, default: 'twoThirds' },
  /** 自定义初始占比（0~1，优先级高于 snap，默认 2/3） */
  initialRatio: { type: Number, default: 0.666 },
  /** 点击遮罩是否关闭（弹出模式有效） */
  closeOnMask: { type: Boolean, default: false },
  /** 取消动作：'back' 返回上一页 | 'close' 仅关闭组件（弹出模式有效） */
  cancelAction: { type: String, default: 'back' },
  /** 拍照模式 */
  mode: { type: String, default: 'pickup' } // pickup | return
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

/** ==== 尺寸/拖拽（内联时全部短路） ==== */
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

const snaps = { peek: 0.36, half: 0.68, full: 0.96, twoThirds: 0.666 }
const sheetPx = ref(0)
const dragging = ref(false)
const isFull = computed(() => props.inline ? true : (sheetPx.value >= winH.value * snaps.full - 2))
const showMask = computed(() => !props.inline)

function toPx(level){
  const key = snaps[level] != null ? level : 'half'
  return Math.round(winH.value * snaps[key])
}
function expandTo(level){
  if (props.inline) return
  if (level === 'custom') {
    sheetPx.value = Math.round(winH.value * Math.min(Math.max(props.initialRatio, 0.3), 0.98))
  } else {
    sheetPx.value = toPx(level)
  }
}
const sheetStyle = computed(() => {
  if (props.inline) return ''
  return {
    height: sheetPx.value + 'px',
    transition: dragging.value ? 'none' : 'height .22s cubic-bezier(.2,.8,.3,1)',
    willChange: 'height'
  }
})

function onMaskTap(){ if (props.closeOnMask) onCancel() }

/** 只允许从“抓手”开始，或列表已在顶部时下拉；上推交给滚动（仅弹出模式） */
const dragFromGrabber = ref(false)
function onGrabStart(){ if (!props.inline) dragFromGrabber.value = true }

let startY = 0
let startH = 0
let startScrollTop = 0
const bodyScrolledTop = ref(true)

function onTouchStart(e){
  if (props.inline) return
  startY = e.touches?.[0]?.clientY || 0
  startH = sheetPx.value
  startScrollTop = lastScrollTop.value
  dragging.value = dragFromGrabber.value || bodyScrolledTop.value
}
function onTouchMove(e){
  if (props.inline || !dragging.value) return
  const y = e.touches?.[0]?.clientY || 0
  const dy = startY - y // 上拉正、下拉负

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
  if (props.inline) return
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

/** ==== body 滚动同步（预留，当前未包 scroll-view） ==== */
const scrollTop = ref(0)
const lastScrollTop = ref(0)
function onBodyScroll(e){
  const st = Number(e.detail?.scrollTop || 0)
  lastScrollTop.value = st
  bodyScrolledTop.value = st <= 0
}

/** body 高度（扣掉底部按钮 & 顶部栏）—当前未用到，保留逻辑 */
const bodyStyle = computed(() => {
  const reserved = (isFull.value ? 88 : 38) + 112
  const h = Math.max(0, sheetPx.value - reserved)
  return `height:${h}px`
})

/** 抓手事件代理，只在抓手上启用拖拽，避免吃掉子元素点击 */
const onDragStart = (e) => { dragFromGrabber.value = true; onTouchStart(e) }
const onDragMove  = (e) => onTouchMove(e)
const onDragEnd   = ()   => onTouchEnd()

/** ==== 交互 ==== */
// 统一取返回的本地临时路径（兼容 tempFilePaths / tempFiles）
function pickFirstPath(res){
  if (res?.tempFilePaths && res.tempFilePaths.length) return res.tempFilePaths[0]
  if (res?.tempFiles && res.tempFiles.length) return res.tempFiles[0].path || res.tempFiles[0].tempFilePath
  return ''
}

// 平台兼容的选择图片（优先走微信 chooseMedia，其他走 chooseImage）
function pickImage({count = 1} = {}) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    // 微信：使用 chooseMedia 兼容部分机型 chooseImage 无响应的问题
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album','camera'],
      sizeType: ['compressed'],
      success: (res) => {
        try {
          const file = res.tempFiles?.[0]
          resolve(file?.tempFilePath || file?.path || '')
        } catch (e) { reject(e) }
      },
      fail: (err) => {
        // 兜底再试一次 chooseImage（个别旧版基础库）
        uni.chooseImage({
          count,
          sourceType: ['album','camera'],
          sizeType: ['compressed'],
          success: (r2) => resolve(pickFirstPath(r2)),
          fail: reject
        })
      }
    })
    // #endif

    // #ifndef MP-WEIXIN
    // 其他端（含 H5 / APP / 支付宝小程序等）
    uni.chooseImage({
      count,
      sourceType: ['album','camera'],
      sizeType: ['compressed'],
      success: (res) => resolve(pickFirstPath(res)),
      fail: reject
    })
    // #endif
  })
}

/* 🔧 修复点：重入锁，防止 H5 双触发导致重复弹窗 */
const picking = ref(false)

async function onUpload(index){
  if (picking.value) return
  picking.value = true
  try{
    const path = await pickImage({ count: 1 })
    if (!path) throw new Error('EMPTY_PATH')
    photoList.value[index].url = path
  }catch(err){
    console.warn('choose image fail:', err)
    const msg = /cancel/i.test(String(err?.errMsg || err)) ? '已取消'
             : /auth|deny|permission/i.test(String(err?.errMsg || err)) ? '请在系统设置开启相机/相册权限'
             : '选择图片失败，请重试'
    uni.showToast({ title: msg, icon: 'none' })
  }finally{
    setTimeout(()=> { picking.value = false }, 200) // 轻微延迟更稳
  }
}

function onSubmit(){
  if (!canSubmit.value){
    uni.showToast({ title: '请上传所有照片', icon: 'none' })
    return
  }
  emit('submit', photoList.value.map(x => x.url))
}
function onCancel(){
  if (props.inline) { emit('close'); return }
  if (props.cancelAction === 'back') {
    uni.navigateBack()
  } else {
    emit('close')
  }
}

/** ==== H5 额外锁定滚动（防止背景滚动）==== */
function lockBodyScroll(lock){
  if (props.inline) return
  // #ifdef H5
  try{
    document.body.style.overflow = lock ? 'hidden' : ''
    document.documentElement.style.overflow = lock ? 'hidden' : ''
  }catch(e){}
  // #endif
}

onMounted(() => {
  if (!props.inline){
    if (props.initialRatio) {
      expandTo('custom')
    } else {
      expandTo(props.snap)
    }
    if (props.visible) lockBodyScroll(true)
  }
})
onUnmounted(() => { lockBodyScroll(false) })
watch(() => props.visible, v => {
  if (props.inline) return
  if (props.initialRatio) expandTo('custom'); else expandTo(props.snap)
  dragging.value = false
  dragFromGrabber.value = false
  lastScrollTop.value = 0
  bodyScrolledTop.value = true
  lockBodyScroll(v)
})
</script>

<style scoped>
/* 覆盖层 + 遮罩 */
.overlay{ position:fixed; inset:0; z-index:999999; }
.overlay.inline{ position:relative; inset:auto; z-index:auto; } /* ✅ 内联模式 */
.mask{ position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:0; }

/* 容器 */
.sheet{
  position:fixed; left:0; right:0; bottom:0; z-index:1;
  background:#FFF;
  border-top-left-radius:24rpx; border-top-right-radius:24rpx;
  box-shadow:0 -8rpx 24rpx rgba(0,0,0,.18);
  display:flex; flex-direction:column; overflow:hidden;
  will-change: height;
}
/* ✅ 内联样式：去定位、去阴影、自然高度 */
.sheet-inline{
  position:relative; left:auto; right:auto; bottom:auto;
  height:auto !important; border-radius:0; box-shadow:none;
}

/* 浮动关闭/抓手（仅弹出模式） */
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

/* 顶栏（弹出满屏时显示） */
.topbar{
  height:88rpx; padding:0 18rpx; border-bottom:2rpx solid #F0F2F5;
  display:flex; align-items:center; justify-content:center;
}
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

/* ✅ 四宫格：flex + wrap（两列） */
.photo-grid{
  margin-top:24rpx; padding:0 44rpx;
  display:flex; flex-wrap:wrap; justify-content:space-between;
}
.photo-item{
  width:300rpx; margin-bottom:24rpx;
  position:relative; display:flex; flex-direction:column; align-items:center;
}
.placeholder, .photo{ width:300rpx; height:200rpx; border-radius:24rpx; }
.placeholder{
  background:#F7FBFF; border:2rpx solid #E0EEF9;
  display:flex; align-items:center; justify-content:center;
}
.ico{  opacity:.5; }
.label{ margin-top:14rpx; font-size:28rpx; color:#333333; }
.overlay-tag{
  position:absolute; left:0; right:0; bottom:38rpx;
  height:56rpx; line-height:56rpx; text-align:center;
  font-size:28rpx; color:#FFFFFF;
  background: linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.40) 100%);
  border-bottom-left-radius:24rpx; border-bottom-right-radius:24rpx;
}

/* 占位高度 = 按钮高 + 上下内边距 + 安全区 */
.footer-spacer{
  height: calc(96rpx + 32rpx + env(safe-area-inset-bottom));
}

/* 底部固定容器：默认不吃点击，子元素再开启 */
.footer-fixed{
  position: fixed;
  left: 0; right: 0; bottom: 30rpx;
  box-sizing: border-box;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  background: transparent;
  z-index: 10;
  pointer-events: none;            /* ✅ 关键：不拦截点击 */
}
.notic-bar{ padding-bottom: 30rpx; pointer-events: auto; }

/* 大按钮：688×96、圆角48、渐变 #82ED71→#0DB63D */
.primary{
  width: 688rpx;
  height: 96rpx;
  margin: 0 auto;
  border: none !important;
  border-radius: 48rpx;
  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%);
  color: #FFFFFF;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 40rpx;
  line-height: 54rpx;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;            /* ✅ 允许按钮接收点击 */
}
.primary::after{ border: none !important; } /* 兼容小程序默认边框 */

/* 禁用态：不用属性选择器，避免组件 WXSS 报错 */
.primary.is-disabled{
  background: linear-gradient(180deg, rgba(130,237,113,0.5) 0%, rgba(13,182,61,0.5) 100%) !important;
  color: rgba(255,255,255,0.8) !important;
  opacity: 1 !important;
  box-shadow: none !important;
  filter: none !important;
  cursor: not-allowed;
  pointer-events: none;
}
/* 小程序默认会用 ::after 加边框/按压层，禁用时把它关掉 */
.primary.is-disabled::after{
  display: none !important;
}
</style>
