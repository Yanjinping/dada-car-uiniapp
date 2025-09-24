<template>
  <view class="payment-container" v-if="isVisible">
    <slot name="header" v-if="showHeader">
      <view class="payment-header">收银台</view>
    </slot>

    <!-- 顶部状态提示 -->
    <view v-if="lastError"
      style="background:#FFF1F0;color:#A8071A;padding:16rpx 20rpx;margin-bottom:16rpx;font-size:26rpx;border-radius:12rpx;">
      {{ lastError.message || '支付失败，请稍后重试' }}
    </view>
    <view v-else-if="!online"
      style="background:#FFF7E6;color:#AD6800;padding:16rpx 20rpx;margin-bottom:16rpx;font-size:26rpx;border-radius:12rpx;">
      当前网络不可用，请检查后重试
    </view>
    <view v-else-if="expired"
      style="background:#FFF7E6;color:#AD6800;padding:16rpx 20rpx;margin-bottom:16rpx;font-size:26rpx;border-radius:12rpx;">
      订单已超时，请返回重新下单
    </view>

    <!-- 倒计时（若提供 expireAt） -->
    <view v-if="showCountdown" style="background:#F0FAFF;color:#096DD9;padding:16rpx 20rpx;margin-bottom:16rpx;font-size:26rpx;border-radius:12rpx;">
      支付剩余时间：{{ countdownText }}
    </view>

    <!-- 金额区 -->
    <view class="payment-amount" v-if="showAmount">
      <view class="amount-label">需支付</view>
      <view class="amount-value">¥{{ Number(orderAmount || 0).toFixed(2) }}</view>
    </view>

    <!-- 支付方式区 -->
    <view class="payment-methods" v-if="showMethods">
      <view class="methods-title">选择支付方式</view>

      <!-- 合并支付开关 -->
      <view
        v-if="allowMixed && showBalanceToggle"
        class="balance-toggle"
        @tap="toggleBalancePayment"
      >
        <view class="toggle-left">
          <image class="toggle-icon" src="/static/icons/wallet.png" />
          <view class="toggle-text">
            <view>使用余额合并支付</view>
            <view>
              (当前余额:
              <text class="balance-amount">¥{{ Number(userBalance || 0).toFixed(2) }})</text>
            </view>
          </view>
        </view>
        <view :class="['toggle-switch', useBalance ? 'active' : '']">
          <view class="toggle-knob"></view>
        </view>
      </view>

      <!-- 提示：仅在合并支付开启时展示 -->
      <view v-if="useBalance" style="font-size: 24rpx; color: #999; margin-bottom: 20rpx;">
        <view v-if="isBalanceSufficient">您可使用余额全额支付！</view>
        <view v-else>余额不足，将合并{{ payChannelText }}支付</view>
      </view>

      <!-- 支付渠道（父组件白名单 + 平台能力 + 余额逻辑） -->
      <radio-group class="method-list" @change="handlePaymentChange">
        <label
          class="method-item"
          v-for="method in availablePaymentMethods"
          :key="method.value"
          :class="{ selected: selectedPayment === method.value }"
        >
          <view class="method-left">
            <image class="method-icon" :src="method.icon" />
            <view class="method-info">
              <view class="method-name">{{ method.name }}</view>
              <view v-if="useBalance && method.value !== 'BALANCE'" class="method-remain">
                还需支付: ¥{{ Math.max(0, orderAmount - Math.min(userBalance, orderAmount)).toFixed(2) }}
              </view>
            </view>
          </view>
          <radio :value="method.value" :checked="selectedPayment === method.value" />
        </label>
      </radio-group>

      <!-- 合并明细 -->
      <view class="merge-detail" v-if="useBalance">
        <view class="detail-row">
          <view>余额支付</view>
          <view>-¥{{ Math.min(userBalance, orderAmount).toFixed(2) }}</view>
        </view>
        <view class="detail-row" v-if="orderAmount > userBalance">
          <view>{{ selectedPayment === 'WECHAT' ? '微信' : '支付宝' }}支付</view>
          <view>¥{{ Math.max(0, orderAmount - userBalance).toFixed(2) }}</view>
        </view>
      </view>
    </view>

    <!-- 主按钮 -->
    <button
      class="payment-button"
      v-if="showButton"
      :disabled="paying || !online || expired"
      @tap="handlePayment"
    >
      {{ paying ? '发起中...' : paymentButtonText }}
    </button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { payInitUnified, getWalletBalance, queryByTxnId } from '@/api/pay-sdk' // 需要提供 queryByTxnId
// 可按需替换为你的工具
const genUUID = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

defineOptions({ inheritAttrs: false })

/** ---------- props / emits ---------- */
const props = defineProps({
  scene: { type: String, default: 'ORDER' },           // ORDER | PACKAGE | DEPOSIT | RECHARGE ...
  bizOrderNum: { type: String, default: '' },
  packageId: { type: [Number, String], default: null },
  userId: { type: [Number, String], default: 0 },
  defaultAmount: { type: Number, default: 0 },
  redirectUrl: { type: String, default: '/pages/order/success' },

  /** 业务开关 */
  allowMixed: { type: Boolean, default: false },

  /** 平台能力开关 */
  enableWechat: { type: Boolean, default: true },
  enableAlipay: { type: Boolean, default: true },

  /** UI 显隐开关 */
  visible: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showAmount: { type: Boolean, default: true },
  showMethods: { type: Boolean, default: true },
  showButton: { type: Boolean, default: true },
  autoHideWhenZero: { type: Boolean, default: false },

  /** 合并支付开关的显示 */
  showBalanceToggle: { type: Boolean, default: true },

  /** 支付方式白名单 */
  allowedMethods: {
    type: Array,
    default: () => ['WECHAT', 'ALIPAY', 'BALANCE']
  },

  /** 🔧 全局“时间策略”参数（可在父层/Pinia统一配置） */
  timeoutMs: { type: Number, default: 15000 },                 // 下单/拉起超时
  toastDurationMs: { type: Number, default: 2500 },            // 错误提示停留
  successRedirectDelayMs: { type: Number, default: 400 },      // 成功后跳转延迟
  pollingIntervalMs: { type: Number, default: 2000 },          // 外部支付回查间隔
  pollingMaxTimes: { type: Number, default: 30 },              // 外部支付回查次数（≈60s）
  expireAt: { type: Number, default: 0 }                       // 订单超时时间戳(ms)，0表示不启用
})
const emit = defineEmits(['success','fail','update:visible'])

/** ---------- 工具：错误与超时 ---------- */
function normalizePayError(err, extra = {}) {
  const msg = String(err?.message || err?.errMsg || err || '')
  const isCancel =
    /cancel/i.test(msg) || /用户取消/.test(msg) || err?.code === -2 || err?.errCode === 'USER_CANCEL'
  const isOffline =
    /network/i.test(msg) || /网络/.test(msg) || err?.errCode === 'NETWORK_OFFLINE' || extra?.offline === true
  const isTimeout = /timeout/i.test(msg) || err?.errCode === 'ETIMEOUT'

  let code = 'UNKNOWN'
  if (isCancel) code = 'USER_CANCEL'
  else if (isOffline) code = 'NETWORK_OFFLINE'
  else if (isTimeout) code = 'PAY_TIMEOUT'
  else if (extra?.server === true) code = 'SERVER_ERROR'
  else if (extra?.channel === true) code = 'CHANNEL_UNAVAILABLE'
  else if (extra?.errCode) code = extra.errCode

  return {
    code,
    message:
      (code === 'USER_CANCEL' && '您已取消支付') ||
      (code === 'NETWORK_OFFLINE' && '网络不可用，请检查后重试') ||
      (code === 'PAY_TIMEOUT' && '支付超时，请重试') ||
      (extra?.msg || msg || '支付失败'),
    raw: err,
    data: extra?.data
  }
}
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(normalizePayError(new Error('timeout'), { errCode: 'ETIMEOUT' })), ms)
    )
  ])
}

/** ---------- 会话/状态 ---------- */
const paySessionId = ref(genUUID()) // 一次收银台会话ID
const attemptNo = ref(0)            // 点击计数（幂等辅助）
const clientToken = computed(() => `${paySessionId.value}_${props.scene}_${props.bizOrderNum || ''}_${attemptNo.value}`)
const userBalance = ref(0)
const selectedPayment = ref('WECHAT') // WECHAT | ALIPAY | BALANCE
const useBalance = ref(false)
const orderAmount = ref(0)
const paying = ref(false)
const lastError = ref(null)
const online = ref(true)
const paidOk = ref(false) // 成功标记
const currentTxnId = ref('') // 记录下单返回的 txnId 用于回查

/** 网络感知 */
uni.getNetworkType?.({ success: (r) => { online.value = r.networkType !== 'none' } })
uni.onNetworkStatusChange?.((r) => { online.value = !!r.isConnected })

/** 监听 visible：关闭视为取消（若未成功） */
watch(() => props.visible, (nv, ov) => {
  if (ov === true && nv === false && !paidOk.value) {
    const err = normalizePayError(new Error('用户取消'), { errCode: 'USER_CANCEL' })
    emit('fail', err)
  }
})

/** 平台判断 */
const platformRaw = (process?.env?.UNI_PLATFORM || (uni.getSystemInfoSync?.().uniPlatform) || '').toLowerCase()
const isMpWeixin = computed(() => platformRaw.includes('mp-weixin'))
const isH5       = computed(() => platformRaw === 'h5')
const isApp      = computed(() => platformRaw.includes('app'))

/** 方法集 */
const builtinMethods = ref([
  { name: '微信支付', value: 'WECHAT',  icon: '/static/icons/wechat-pay.png' },
  { name: '支付宝',   value: 'ALIPAY',  icon: '/static/icons/alipay.png' },
  { name: '余额支付', value: 'BALANCE', icon: '/static/icons/wallet.png' }
])

/** 过滤(平台+白名单) */
const filteredByPlatformAndParent = computed(() => {
  return builtinMethods.value.filter(m => {
    if (!props.allowedMethods.includes(m.value)) return false
    if (m.value === 'WECHAT' && !props.enableWechat) return false
    if (m.value === 'ALIPAY' && !props.enableAlipay) return false
    if (isMpWeixin.value && m.value === 'ALIPAY') return false
    return true
  })
})

const payChannelText = computed(() => selectedPayment.value === 'WECHAT' ? '微信' : '支付宝')
const isBalanceSufficient = computed(() => userBalance.value >= orderAmount.value)
const availablePaymentMethods = computed(() => {
  return filteredByPlatformAndParent.value.filter(m => {
    if (m.value === 'BALANCE') {
      return !useBalance.value && isBalanceSufficient.value
    }
    return true
  })
})
const isZeroPay = computed(() => Number(orderAmount.value || 0) <= 0)
const isVisible = computed(() => props.visible && (!props.autoHideWhenZero || !isZeroPay.value))

/** 倒计时/过期 */
const nowMs = ref(Date.now())
let tickTimer = null
const showCountdown = computed(() => props.expireAt > 0 && !expired.value)
const expired = computed(() => props.expireAt > 0 && nowMs.value >= props.expireAt)
const countdownText = computed(() => {
  if (!showCountdown.value) return ''
  const rest = Math.max(0, props.expireAt - nowMs.value)
  const ss = Math.floor(rest / 1000)
  const m = Math.floor(ss / 60).toString().padStart(2, '0')
  const s = (ss % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})
function startTick() {
  stopTick()
  if (props.expireAt > 0) {
    tickTimer = setInterval(() => { nowMs.value = Date.now() }, 1000)
  }
}
function stopTick() {
  if (tickTimer) { clearInterval(tickTimer); tickTimer = null }
}

onMounted(() => { startTick() })
onBeforeUnmount(() => { stopTick(); stopPolling() })

/** 0 元单：自动成功 */
watch(isZeroPay, (zero) => {
  if (!props.autoHideWhenZero) return
  if (zero) {
    onPaidSuccess({ bizOrderNum: props.bizOrderNum, txnId: 'TXN_FREE_' + Date.now(), paid: true })
  }
}, { immediate: true })

/** ---------- 初始化金额/余额 ---------- */
async function initAmount(){ orderAmount.value = Number(props.defaultAmount || 0) }
async function initBalanceAndDefault(){
  try {
    const r = await getWalletBalance()
    const val = r?.data ?? r
    userBalance.value = Number.isFinite(Number(val)) ? Number(val) : 0
  } catch {
    userBalance.value = 0
  }
  if (userBalance.value >= orderAmount.value){
    selectedPayment.value = 'BALANCE'
    useBalance.value = false
  } else {
    selectedPayment.value = props.enableWechat ? 'WECHAT' : (props.enableAlipay ? 'ALIPAY' : 'WECHAT')
    useBalance.value = props.allowMixed
  }
}
/** props 关键变更时重算 */
watch(() => [props.scene, props.bizOrderNum, props.packageId, props.defaultAmount], async () => {
  await initAmount(); await initBalanceAndDefault()
})
onMounted(async () => { await initAmount(); await initBalanceAndDefault() })

/** 状态兜底 */
watch([userBalance, orderAmount, useBalance, () => props.allowedMethods, () => props.enableWechat, () => props.enableAlipay], () => {
  const allowBalanceOnly = !useBalance.value && isBalanceSufficient.value
  const codes = availablePaymentMethods.value.map(i => i.value)
  if (!codes.includes(selectedPayment.value)) {
    selectedPayment.value =
      ['WECHAT','ALIPAY','BALANCE'].find(c => codes.includes(c)) || codes[0] || 'WECHAT'
  }
  if (!allowBalanceOnly && selectedPayment.value === 'BALANCE') {
    selectedPayment.value =
      ['WECHAT','ALIPAY'].find(c => codes.includes(c)) || codes[0] || 'WECHAT'
  }
}, { immediate: true })

/** 交互 */
function clearErrorSoon(){ setTimeout(()=> lastError.value = null, props.toastDurationMs) }
function toggleBalancePayment(){
  if (!props.allowMixed) return
  useBalance.value = !useBalance.value
  if (useBalance.value && selectedPayment.value === 'BALANCE') {
    selectedPayment.value =
      (availablePaymentMethods.value.find(m => m.value !== 'BALANCE')?.value) || 'WECHAT'
  }
  if (!useBalance.value && !isBalanceSufficient.value) {
    uni.showToast({ title: '余额不足，无法仅用余额支付', icon: 'none' })
    selectedPayment.value =
      (availablePaymentMethods.value.find(m => m.value !== 'BALANCE')?.value) || 'WECHAT'
  }
}
function handlePaymentChange(e){ selectedPayment.value = e.detail.value }

/** 主按钮文案 */
const paymentButtonText = computed(() => {
  if (useBalance.value){
    const b = Math.min(userBalance.value, orderAmount.value)
    const r = Math.max(0, orderAmount.value - b)
    return `合并支付(余额¥${b.toFixed(2)} + ${selectedPayment.value==='WECHAT'?'微信':'支付宝'}¥${r.toFixed(2)})`
  }
  if (selectedPayment.value==='BALANCE') return '使用余额支付'
  return `使用${selectedPayment.value==='WECHAT'?'微信':'支付宝'}支付`
})

/** PACKAGE 场景：严格取 packageId */
function getStrictPackageId(){
  if (props.packageId!=null && props.packageId!==''){
    const n=Number(props.packageId); return Number.isFinite(n)?n:null
  }
  const s=String(props.bizOrderNum||''); return /^p\d+$/i.test(s)?Number(s.slice(1)):null
}

/** 轮询回查（外部支付 H5/表单/扫码） */
let pollingTimer = null
let pollingTimes = 0
function stopPolling(){
  if (pollingTimer){ clearInterval(pollingTimer); pollingTimer = null }
  pollingTimes = 0
}
async function startPolling(txnId){
  stopPolling()
  if (!txnId) return
  currentTxnId.value = txnId
  pollingTimer = setInterval(async () => {
    pollingTimes++
    try{
      const r = await withTimeout(queryByTxnId(txnId), Math.min(props.timeoutMs, 10000))
      const d = r?.data ?? r ?? {}
      if (d?.paid === true){
        stopPolling()
        onPaidSuccess({ bizOrderNum: d.bizOrderNum || props.bizOrderNum, txnId })
      } else if (d?.status === 'FAIL'){
        stopPolling()
        const err = normalizePayError(new Error(d?.message || '支付失败'), { server: true, data: d })
        lastError.value = err; clearErrorSoon(); emit('fail', err)
      } else if (pollingTimes >= props.pollingMaxTimes){
        stopPolling()
        const err = normalizePayError(new Error('支付确认超时'), { errCode: 'QUERY_TIMEOUT' })
        lastError.value = err; clearErrorSoon(); emit('fail', err)
      }
    }catch(e){
      // 查询报错不立即终止，直到达到最大次
      if (pollingTimes >= props.pollingMaxTimes){
        stopPolling()
        const err = normalizePayError(e, { errCode: 'QUERY_TIMEOUT' })
        lastError.value = err; clearErrorSoon(); emit('fail', err)
      }
    }
  }, props.pollingIntervalMs)
}

/** 发起支付 */
async function handlePayment(){
  if (paying.value) return
  if (!online.value) { uni.showToast({ title:'网络不可用，请检查后重试', icon:'none' }); return }
  if (expired.value){ uni.showToast({ title:'订单已超时', icon:'none' }); return }
  paying.value = true
  lastError.value = null
  attemptNo.value += 1
  uni.showLoading({ title: '支付中...', mask: true })
  try{
    const sceneUpper = String(props.scene||'ORDER').toUpperCase()
    const bizOrderNum = props.bizOrderNum || ''
	console.debug(bizOrderNum)
    const pkgId = getStrictPackageId()

    if (sceneUpper==='PACKAGE' && !pkgId){
      const err = normalizePayError(new Error('套餐ID异常'), { server:true, msg:'套餐ID异常' })
      lastError.value = err; clearErrorSoon(); emit('fail', err); return
    }
    if (sceneUpper!=='PACKAGE' && !bizOrderNum){
      const err = normalizePayError(new Error('缺少业务单号'), { server:true, msg:'缺少业务单号' })
      lastError.value = err; clearErrorSoon(); emit('fail', err); return
    }
	
	const payload = {
	  userId: props.userId,
	  scene: sceneUpper,
	  bizOrderNum,           // 这里应当是你在 419 行看到的值
	  packageId: pkgId,
	  selectedPayment: selectedPayment.value,
	  allowMixed: useBalance.value,
	  orderAmount: orderAmount.value,
	  userBalance: userBalance.value,
	  userOpenId: '',
	  clientToken: clientToken.value,
	  clientDeadline: props.expireAt || 0
	}
	console.log('[Cashier] init payload =', JSON.stringify(payload))
	const resp = await withTimeout(payInitUnified(payload), props.timeoutMs)

    // const resp = await withTimeout(payInitUnified({
    //   userId: props.userId,
    //   scene: sceneUpper,
    //   bizOrderNum,
    //   packageId: pkgId,
    //   selectedPayment: selectedPayment.value,
    //   allowMixed: useBalance.value,
    //   orderAmount: orderAmount.value,
    //   userBalance: userBalance.value,
    //   userOpenId: '',
    //   clientToken: clientToken.value,     // 幂等关键
    //   clientDeadline: props.expireAt || 0 // 前端预期最晚完成时间，后端可据此拒绝“必超时”的交易
    // }), props.timeoutMs)

    const raw = resp || {}
    const data = raw.data ?? raw.result ?? {}
    const ok =
      raw.ok ??
      (typeof raw.code === 'number' ? raw.code === 0 : undefined) ??
      (typeof raw.status === 'number' ? raw.status === 0 : undefined) ??
      (raw.success === true)
    const message = raw.message ?? raw.msg ?? raw.error ?? '服务繁忙'

    // 已完成（纯余额/0元）
    if (data?.paid === true) return onPaidSuccess(data)

    // 真失败
    if (ok === false) {
      const err = normalizePayError(new Error(message || '下单失败'), { server: true, msg: message, data })
      lastError.value = err; clearErrorSoon(); emit('fail', err); return
    }

    // 记录 txnId（供轮询使用）
    if (data?.txnId) currentTxnId.value = data.txnId

    // 微信原生
    if (data.channel==='WECHAT' && data.wechatParams && data.wechatParams.timeStamp && data.wechatParams.nonceStr && data.wechatParams.package && data.wechatParams.paySign){
      await new Promise((resolve,reject)=>{
        uni.requestPayment({
          provider:'wxpay',
          timeStamp: data.wechatParams.timeStamp,
          nonceStr:  data.wechatParams.nonceStr,
          package:   data.wechatParams.package,
          signType:  data.wechatParams.signType || 'RSA',
          paySign:   data.wechatParams.paySign,
          success: resolve, fail: reject
        })
      }).catch(err => { throw normalizePayError(err) })
      return onPaidSuccess(data)
    }

    // 支付宝原生
    if (data.channel==='ALIPAY' && data.alipayParams && data.alipayParams.orderInfo){
      await new Promise((resolve,reject)=>{
        uni.requestPayment({ provider:'alipay', orderInfo: data.alipayParams.orderInfo, success: resolve, fail: reject })
      }).catch(err => { throw normalizePayError(err) })
      return onPaidSuccess(data)
    }

    // H5 跳转 —— 通知父层等待 & 开始轮询
    if (data.h5Url){
      emit('fail', normalizePayError(new Error('等待外部支付'), { channel:true, errCode:'PENDING_EXTERNAL', data }))
      if (isH5.value)      window.location.href = data.h5Url
      else if (isApp.value) try{ plus.runtime.openURL(data.h5Url) }catch{ uni.navigateTo({ url:`/pages/common/web?url=${encodeURIComponent(data.h5Url)}` }) }
      else if (isMpWeixin.value){ uni.setClipboardData({ data: data.h5Url }); uni.showModal({ title:'请在浏览器中打开', content:'链接已复制', showCancel:false }) }
      if (data.txnId) startPolling(data.txnId)
      return
    }

    // PC 表单 —— 通知父层等待 & 开始轮询
    if (data.formHtml){
      emit('fail', normalizePayError(new Error('等待外部支付'), { channel:true, errCode:'PENDING_EXTERNAL', data }))
      if (isH5.value && typeof window!=='undefined'){
        const w = window.open('', '_blank')
        if (w){ w.document.open(); w.document.write(data.formHtml); w.document.close() }
        else { document.open(); document.write(data.formHtml); document.close() }
      }else{
        uni.showModal({ title:'请在浏览器中完成支付', content:'PC 网页支付需要在浏览器中打开。', showCancel:false })
      }
      if (data.txnId) startPolling(data.txnId)
      return
    }

    // 扫码 —— 通知父层等待 & 开始轮询
    if (data.codeUrl){
      emit('fail', normalizePayError(new Error('等待外部支付'), { channel:true, errCode:'PENDING_EXTERNAL', data }))
      try{
        uni.setClipboardData({ data: data.codeUrl })
        uni.showModal({ title:'请使用微信扫码', content:'二维码链接已复制', showCancel:false })
      }catch{}
      if (data.txnId) startPolling(data.txnId)
      return
    }

    const err = normalizePayError(new Error('缺少拉起参数'), { channel: true, msg: '缺少拉起参数', data })
    lastError.value = err; clearErrorSoon(); emit('fail', err)
  }catch(e){
    const err = normalizePayError(e)
    lastError.value = err; clearErrorSoon(); emit('fail', err)
  }finally{
    paying.value = false
    uni.hideLoading()
  }
}

/** 成功回调 */
function onPaidSuccess(d){
  stopPolling()
  paidOk.value = true
  lastError.value = null
  emit('success', { scene: props.scene, bizOrderNum: d.bizOrderNum ?? props.bizOrderNum, txnId: d.txnId ?? currentTxnId.value, data: d })
  emit('update:visible', false)
  if (props.redirectUrl) setTimeout(()=> uni.redirectTo({ url: props.redirectUrl }), props.successRedirectDelayMs)
}
</script>

<style scoped>
.payment-container { padding: 40rpx; background-color: #FFFFFF; min-height: 60vh; }
.payment-header { font-size: 36rpx; font-weight: bold; text-align: center; margin: 40rpx 0 60rpx; }

.payment-amount { text-align: center; margin-bottom: 60rpx; }
.amount-label { font-size: 28rpx; color: #666; margin-bottom: 16rpx; }
.amount-value { font-size: 48rpx; font-weight: bold; }

.methods-title { font-size: 28rpx; color: #666; margin-bottom: 30rpx; }

/* 单行不换行 + 省略号 */
.balance-toggle {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24rpx 0; margin-bottom: 20rpx; border-bottom: 1rpx solid #f5f5f5;
}
.toggle-left { display: flex; align-items: center; font-size: 22rpx; min-width: 0; flex: 1; }
.toggle-icon { width: 36rpx; height: 36rpx; margin-right: 16rpx; flex: 0 0 36rpx; }
.toggle-text { font-size: 26rpx; line-height: 36rpx; display: flex; flex-direction: column; }
.balance-amount { color: #E53935; font-weight: bold; }
.toggle-switch { width: 80rpx; height: 40rpx; background-color: #e0e0e0; border-radius: 20rpx; position: relative; transition: all .3s; flex: 0 0 80rpx; margin-left: 16rpx; }
.toggle-switch.active { background-color: #FFCC00; }
.toggle-knob { width: 36rpx; height: 36rpx; background-color: #fff; border-radius: 50%; position: absolute; top: 2rpx; left: 2rpx; transition: all .3s; }
.toggle-switch.active .toggle-knob { left: 42rpx; }

.method-list { margin-bottom: 40rpx; }
.method-item { display: flex; justify-content: space-between; align-items: center; padding: 30rpx; border: 2rpx solid #EEE; border-radius: 16rpx; margin-bottom: 24rpx; }
.method-item.selected { border-color: #FFCC00; }
.method-left { display: flex; align-items: center; flex: 1; }
.method-info { flex: 1; }
.method-icon { width: 48rpx; height: 48rpx; margin-right: 24rpx; }
.method-name { font-size: 32rpx; }
.method-remain { font-size: 24rpx; color: #999; margin-top: 8rpx; }

.merge-detail { background-color: #F8F8F8; border-radius: 16rpx; padding: 24rpx; margin-bottom: 40rpx; }
.detail-row { display: flex; justify-content: space-between; font-size: 28rpx; margin-bottom: 16rpx; }

.payment-button {
  margin: 24rpx 0 8rpx;
  height: 88rpx; line-height: 88rpx; background-color: #FFCC00; color: #333;
  font-size: 32rpx; font-weight: bold; border-radius: 44rpx; text-align: center; border: none;
}
.payment-button[disabled]{ opacity: .7 }
</style>
