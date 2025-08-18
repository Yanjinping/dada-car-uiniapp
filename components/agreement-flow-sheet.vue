<template>
  <view v-if="visible" class="afs-mask" @touchmove.stop.prevent>
    <view class="afs-panel">
      <!-- 顶部步骤 -->
      <view class="afs-steps">
        <text :class="['s', step>=1 && 'on']">1.《租赁服务协议》</text>
        <text :class="['s', step>=2 && 'on']">2.《不计免赔说明》</text>
        <text :class="['s', step>=3 && 'on']">3.签名</text>
        <text class="x" @tap="$emit('close')">✕</text>
      </view>

      <!-- 内容 -->
      <scroll-view scroll-y class="afs-body" v-if="step<=2">
        <view class="doc">
          <slot v-if="false" />
          <view v-if="step===1">
            <text class="h1">嗒嗒用户服务协议</text>
            <text class="p">（此处放你的协议正文，示例略……）</text>
          </view>
          <view v-else>
            <text class="h1">不计免赔说明</text>
            <text class="p">（此处放不计免赔说明正文，示例略……）</text>
          </view>
        </view>
      </scroll-view>

      <!-- 签名 -->
      <view v-else class="sign-wrap">
        <text class="sign-title">请在屏幕上签署您的姓名</text>
        <canvas
          class="sign-board"
          :id="canvasId"
          :canvas-id="canvasId"
          @touchstart="onStart"
          @touchmove="onMove"
          @touchend="onEnd"
        />
        <view class="sign-tools">
          <button class="btn ghost" @tap="clear">清除</button>
          <button class="btn main" :disabled="!hasStroke" @tap="ok">确定</button>
        </view>
      </view>

      <!-- 底部按钮（步骤1/2） -->
      <view class="afs-actions" v-if="step<=2">
        <button v-if="step===1" class="btn main" @tap="next">我已阅读</button>
        <button v-else class="btn main" @tap="next">我已阅读</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false } })
const emit = defineEmits(['close','finished'])

const step = ref(1)
const canvasId = 'signBoard'
let ctx = null
const last = { x: 0, y: 0, moving: false }
const hasStroke = ref(false)

watch(() => props.visible, (v) => {
  if (v) { step.value = 1; hasStroke.value = false; setTimeout(initCanvas, 0) }
})

function next(){ step.value = Math.min(3, step.value + 1); if (step.value===3) setTimeout(initCanvas, 0) }
function initCanvas(){
  // 小程序/APP/WEB 通用 API
  try{
    ctx = uni.createCanvasContext(canvasId)
    ctx.setStrokeStyle('#FF3B30')
    ctx.setLineWidth(4)
    ctx.setLineCap('round')
    ctx.setLineJoin('round')
  }catch(e){ /* 兼容不阻断 */ }
}
function pos(e){ const t = e.touches[0] || e.changedTouches[0]; return { x:t.x || t.clientX, y:t.y || t.clientY } }
function onStart(e){ const p=pos(e); last.x=p.x; last.y=p.y; last.moving=true }
function onMove(e){
  if (!last.moving || !ctx) return
  const p = pos(e)
  ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.draw(true)
  last.x=p.x; last.y=p.y; hasStroke.value = true
}
function onEnd(){ last.moving=false }
function clear(){ hasStroke.value=false; initCanvas(); ctx.clearRect && ctx.clearRect(0,0,10000,10000); ctx.draw && ctx.draw(false) }
function ok(){
  if (!hasStroke.value){ uni.showToast({ title:'请先签名', icon:'none' }); return }
  emit('finished')
}
</script>

<style scoped>
.afs-mask{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:flex-end; z-index:9999; }
.afs-panel{ width:750rpx; max-height:86vh; background:#fff; border-radius:32rpx 32rpx 0 0; overflow:hidden; }

.afs-steps{ position:relative; display:flex; gap:16rpx; align-items:center; padding:20rpx 24rpx; border-bottom:2rpx solid #eee; }
.s{ font-size:28rpx; color:#999; }
.s.on{ color:#333; font-weight:600; }
.x{ position:absolute; right:24rpx; top:20rpx; font-size:36rpx; color:#666; }

.afs-body{ max-height:50vh; }
.doc{ padding:24rpx; color:#333; }
.h1{ display:block; font-size:34rpx; font-weight:600; margin-bottom:12rpx; }
.p{ display:block; font-size:28rpx; line-height:44rpx; color:#555; }

.sign-wrap{ padding:24rpx; }
.sign-title{ display:block; text-align:center; font-size:36rpx; font-weight:600; color:#222; margin-bottom:16rpx; }
.sign-board{ width:702rpx; height:700rpx; background:#fff; border:2rpx dashed #ddd; border-radius:12rpx; }
.sign-tools{ margin-top:16rpx; display:flex; justify-content:space-between; gap:16rpx; }
.btn{ flex:1; height:90rpx; border-radius:54rpx; font-size:34rpx; display:flex; align-items:center; justify-content:center; }
.btn.ghost{ background:#f5f5f5; color:#333; }
.btn.main{ background:#1BBD43; color:#fff; }
.btn.main:disabled{ opacity:.5; }

.afs-actions{ padding:16rpx 24rpx 28rpx; }
</style>
