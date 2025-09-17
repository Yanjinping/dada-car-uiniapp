<!-- pages/wallet/deposit.vue -->
<template>
  <!-- 根节点不接收 $attrs，避免小程序端 v-bind 对象展开告警 -->
  <view class="pay-root">
    <scroll-view
      class="page"
      :class="{ 'page-locked': cashierVisible }"
      :scroll-y="!cashierVisible"
    >
      <TitleBar title="押金管理" background="#FFFFFF" />

      <view class="body">
        <!-- 分时押金 -->
        <view class="card card-green" @tap="goPayDeposit">
          <view class="card-left">
            <text class="c-title">分时押金</text>
            <text class="c-sub">
              {{
                depositInfo.paid
                  ? `已缴纳：¥${Number(depositInfo.amount || 0).toFixed(2)}`
                  : `查询违章倒数天数： ${timeDepositDays} 工作日`
              }}
            </text>
          </view>
          <view class="card-right">
            <text class="cta">{{ depositInfo.paid ? '去退款' : '去缴纳' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 芝麻免押 -->
        <view class="card card-blue" @tap="handleSesameAction">
          <view class="card-left">
            <text class="c-title">芝麻免押</text>
            <text class="c-sub">
              {{
                sesame.auth
                  ? `已授权（自动结算倒数：${sesameDays} 工作日）`
                  : `未授权，授权后可免缴押金`
              }}
            </text>
          </view>
          <view class="card-right">
            <text class="cta">{{ sesame.auth ? '解除授权' : '去授权' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 顶部网络提示 -->
        <view v-if="!online"
          style="margin: 16rpx 24rpx; padding: 16rpx; font-size: 26rpx;
          background:#FFF7E6; color:#AD6800; border-radius: 12rpx;">
          当前网络不可用，请检查网络后重试
        </view>

        <!-- 温馨提示 -->
        <view class="tips">
          <view class="tips-hd">
            <view class="line"></view>
            <text class="tips-title">温馨提示</text>
            <view class="line"></view>
          </view>
          <text class="tips-txt">分时押金和芝麻免押，只需满足一项均可用车</text>
        </view>
      </view>
    </scroll-view>

    <!-- ===== 与 pay.vue 一致的“底部收银台抽屉” ===== -->
    <view
      v-show="cashierVisible"
      class="cashier-root"
      :class="{ closing: animating && translateY > 0, hidden: !cashierVisible }"
    >
      <view class="cashier-mask" @tap="onCancelPay"></view>

      <view
        class="cashier-sheet"
        :style="sheetStyle"
        @touchstart="onTouchStart"
        @touchmove.stop.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @tap.stop
      >
        <view class="sheet-grip" />
        <view class="sheet-header">
          <text class="title">确认缴纳押金</text>
          <text class="close" @tap="onCancelPay">×</text>
        </view>

        <scroll-view scroll-y class="sheet-body">
          <Cashier
            :key="cashierKey"
            v-model:visible="cashierVisible"
            :scene="'DEPOSIT'"
            :biz-order-num="cashierOrderNum"
            :user-id="userId"
            :default-amount="cashierAmount"
            :redirect-url="''"
            :allow-mixed="false"
            :show-balance-toggle="false"
            :allowed-methods="['WECHAT','ALIPAY']"
            :enable-wechat="true"
            :enable-alipay="true"
            :show-header="false"
            :button-fixed="false"
            @success="onPaidOk"
            @fail="onPaidFail"
          />
        </scroll-view>

        <view class="safe-bottom" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import Cashier from '@/components/cashier/Cashier.vue'
import {
  getDepositInfo,
  refundDeposit,
  getSesameStatus,
  startSesameAuth,
  cancelSesameAuth,
  createDepositOrder
} from '../../api/deposit'

defineOptions({ inheritAttrs: false })

/** ----------------- State ----------------- */
const userId = ref(0)
const online = ref(true)

const timeDepositDays = ref(30)
const sesameDays = ref(45)
const depositInfo = ref({ paid: false, amount: 0, bizOrderNum: '' })
const sesame = ref({ auth: false })

/** 抽屉态 + 拉起参数 */
const cashierVisible = ref(false)
const cashierKey = ref(0)
const cashierOrderNum = ref('')
const cashierAmount = ref(0)

/** 动画/手势（保持与 pay.vue 一致） */
const SHEET_ANIM_MS = 180
const startY = ref(0)
const translateY = ref(0)
const animating = ref(false)
const closeDistance = 400
function onTouchStart(e){ if (!animating.value) startY.value = e.changedTouches?.[0]?.clientY || 0 }
function onTouchMove(e){
  if (animating.value) return
  const y = e.changedTouches?.[0]?.clientY || 0
  const delta = y - startY.value
  translateY.value = Math.max(0, delta)
}
function onTouchEnd(){
  if (translateY.value > 120) closeCashier()
  else { animating.value = true; translateY.value = 0; setTimeout(()=> animating.value=false, 150) }
}
const sheetStyle = computed(() => {
  const t  = `translateY(${translateY.value}px)`
  const tr = animating.value ? 'transform .18s ease-out' : 'transform 0s'
  return `transform:${t};transition:${tr};`
})
function closeCashier(){
  animating.value = true
  translateY.value = closeDistance
  setTimeout(() => {
    cashierVisible.value = false
    animating.value = false
    translateY.value = 0
  }, SHEET_ANIM_MS)
}

/** 网络感知 */
uni.getNetworkType?.({ success: (r) => { online.value = r.networkType !== 'none' } })
uni.onNetworkStatusChange?.((r) => { online.value = !!r.isConnected })

/** ----------------- 初始化 ----------------- */
async function refreshAll () {
  try {
    const d = await getDepositInfo()
    depositInfo.value = {
      paid: !!d?.hasPaid,          // 映射 hasPaid -> paid
      amount: d?.amount ?? 0,
      bizOrderNum: d?.bizOrderNum ?? ''
    }
  } catch {}

  try {
    const z = await getSesameStatus()
    sesame.value = { auth: !!z?.authorized }
  } catch {}
}
onMounted(() => {
  try { const u = uni.getStorageSync('user') || {}; if (u?.id) userId.value = Number(u.id) } catch {}
  refreshAll()
})

/** ----------------- 交互：去缴押金 / 退款 ----------------- */
function goPayDeposit () {
  if (depositInfo.value.paid) {
    // 已缴纳：引导退款
    uni.showModal({
      title: '申请退款',
      content: `已缴纳押金 ¥${Number(depositInfo.value.amount || 0).toFixed(2)}，确定要申请退款吗？`,
      success: async ({ confirm }) => {
        if (!confirm) return
        try {
          uni.showLoading({ title: '提交中...' })
          await refundDeposit()
          uni.hideLoading()
          uni.showToast({ title: '已提交退款申请', icon: 'success' })
          setTimeout(refreshAll, 500)
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: e?.message || '退款失败', icon: 'none' })
        }
      }
    })
    return
  }
  openCashier()
}

async function openCashier(){
  if (!online.value) return uni.showToast({ title: '网络不可用，请检查后重试', icon: 'none' })

  try {
    uni.showLoading({ title: '准备中...' })
    // 1) 创建押金单，拿到 bizOrderNum + amount（演示值做兜底）
    const r = await createDepositOrder().catch(() => null)
    const biz = r?.bizOrderNum || r?.data?.bizOrderNum || 'DEP123456789'
    const amt = Number(r?.amount ?? r?.data?.amount ?? 500.00)

    if (!biz) {
      uni.hideLoading()
      return uni.showToast({ title: '创建押金单失败', icon: 'none' })
    }

    cashierOrderNum.value = String(biz)
    cashierAmount.value   = Number.isFinite(amt) ? amt : 0

    // 2) 打开抽屉
    cashierKey.value += 1
    cashierVisible.value = true
    uni.hideLoading()
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: e?.message || '创建押金单失败', icon: 'none' })
  }
}

function onPaidOk({ bizOrderNum, txnId }){
  uni.showToast({ title: '押金缴纳成功', icon: 'success', duration: 900 })
  try { uni.setStorageSync('lastDepositPaid', { bizOrderNum, txnId, at: Date.now() }) } catch {}
  closeCashier()
  setTimeout(refreshAll, 400)
}
function onPaidFail(e){
  const code = e?.code || 'UNKNOWN'
  const msg =
    code === 'USER_CANCEL'     ? '您已取消支付' :
    code === 'NETWORK_OFFLINE' ? '网络不可用，请检查后重试' :
    code === 'PAY_TIMEOUT'     ? '支付超时，请重试' :
    e?.message || '支付未完成或已取消'
  uni.showToast({ title: msg, icon: 'none' })
}

function onCancelPay(){
  uni.showModal({
    title: '提示',
    content: '尚未完成缴纳，是否确认取消？',
    cancelText: '继续缴纳',
    confirmText: '取消',
    success: ({ confirm }) => {
      if (!confirm) return
      onPaidFail({ code: 'USER_CANCEL' })
      try { closeCashier() } catch {}
    }
  })
}

/** ----------------- 芝麻免押 ----------------- */
async function handleSesameAction () {
  if (sesame.value.auth) {
    uni.showModal({
      title: '解除授权',
      content: '解除后将不再享受免押，请确认是否继续？',
      success: async ({ confirm }) => {
        if (!confirm) return
        try {
          uni.showLoading({ title: '处理中...' })
          await cancelSesameAuth()
          uni.hideLoading()
          uni.showToast({ title: '已解除授权', icon: 'success' })
          setTimeout(refreshAll, 300)
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
        }
      }
    })
  } else {
    try {
      uni.showLoading({ title: '跳转中...' })
      const r = await startSesameAuth()
      uni.hideLoading()
      const url = r?.url
      if (url) {
        // #ifdef H5
        if (typeof window !== 'undefined') window.location.href = url
        // #endif
        // #ifndef H5
        else uni.navigateTo({ url: `/pages/common/web?url=${encodeURIComponent(url)}` })
        // #endif
      } else {
        uni.showToast({ title: '未拿到跳转链接', icon: 'none' })
      }
    } catch (e) {
      uni.hideLoading()
      uni.showToast({ title: e?.message || '授权失败', icon: 'none' })
    }
  }
}
</script>

<style scoped>
/* 页面骨架与 pay.vue 风格保持一致 */
.page{ background:#fff; min-height:100vh; }
.page-locked{ pointer-events:none; }
.body{ padding: 28rpx; }

/* 卡片样式 */
.card{
  min-height:176rpx; padding:32rpx 34rpx; border-radius:24rpx;
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:28rpx; color:#fff; box-shadow:0 8rpx 24rpx rgba(0,0,0,0.08);
}
.card-green{ background:#22B46E; }
.card-blue{  background:#0A94F5; }

.card-left{ max-width:72%; }
.c-title{ display:block; font-size:40rpx; font-weight:800; letter-spacing:1rpx; }
.c-sub{ margin-top:10rpx; font-size:28rpx; opacity:.95; }

.card-right{ display:flex; align-items:center; gap:10rpx; }
.cta{ font-size:30rpx; font-weight:700; }
.arrow{ font-size:44rpx; margin-left:2rpx; }

/* 提示 */
.tips{ padding:24rpx 8rpx; margin-top:20rpx; text-align:center; }
.tips-hd{ display:flex; align-items:center; gap:24rpx; justify-content:center; margin-bottom:16rpx; }
.line{ width:180rpx; height:2rpx; background:#DBDBDB; border-radius:2rpx; }
.tips-title{ font-size:30rpx; color:#444; font-weight:700; }
.tips-txt{ display:block; margin-top:16rpx; font-size:26rpx; color:#666; }

/* ===== 与 pay.vue 一致的底部收银台抽屉 ===== */
.cashier-root{ position: fixed; inset: 0; z-index: 999; }
.cashier-root.hidden { pointer-events: none; }
.cashier-mask{
  position: absolute; inset: 0; background: rgba(0,0,0,.45);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  animation: maskIn .18s ease-out;
}
@keyframes maskIn { from{ opacity:.2 } to{ opacity:1 } }
.cashier-root.closing .cashier-mask{ animation: maskOut .18s ease-in forwards; }
@keyframes maskOut { from{ opacity:1 } to{ opacity:0 } }

.cashier-sheet{
  position: absolute; left:0; right:0; bottom:0; background:#fff;
  border-top-left-radius:24rpx; border-top-right-radius:24rpx;
  box-shadow: 0 -12rpx 32rpx rgba(0,0,0,.08);
  max-height: 78vh; overflow: hidden;
  transform: translateY(16%); animation: slideUp .2s ease-out forwards;
}
@keyframes slideUp { from { transform: translateY(16%) } to { transform: translateY(0) } }
.sheet-grip{ width: 88rpx; height: 8rpx; border-radius: 8rpx; background: #E7E9ED; margin: 16rpx auto 10rpx; }
.sheet-header{
  display:flex; align-items:center; justify-content:center;
  position:relative; height:88rpx; border-bottom:1rpx solid #F1F2F5;
}
.sheet-header .title{ font-size:30rpx; font-weight:600; color:#222; }
.sheet-header .close{ position:absolute; right:24rpx; top:0; bottom:0; display:flex; align-items:center; font-size:40rpx; color:#999; }
.sheet-body{
  max-height: calc(78vh - 88rpx - 24rpx);
  padding: 8rpx 24rpx 0; box-sizing: border-box;
  -webkit-overflow-scrolling: touch; overflow-y: auto;
}
.safe-bottom{ height: calc(16rpx + env(safe-area-inset-bottom)); }
</style>
