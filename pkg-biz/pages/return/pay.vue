	<template>
	   <!-- 根节点不再接收 $attrs，避免小程序端不支持的 v-bind 对象展开 -->
	  <view class="pay-root" >
		<scroll-view
		  class="page"
		  :class="{ 'page-locked': cashierVisible }"
		  :scroll-y="!cashierVisible"
		>
		  <TitleBar title="订单支付" background="#FFFFFF" />
		  <view class="hero">
			<StepBar :current="2" />
		  </view>

		  <!-- 顶部网络提示 -->
		  <view v-if="!online"
			style="margin: 16rpx 24rpx; padding: 16rpx; font-size: 26rpx;
			background:#FFF7E6; color:#AD6800; border-radius: 12rpx;">
			当前网络不可用，请检查网络后重试
		  </view>

		  <FeeSummary
			:total="total"
			:rows="rows"
			:saving-text="savingText"
			:package-text="packageText"
			:coupon-text="couponText"
			:distance-km="distanceKm"
			:use-duration="useDuration"
			:take-time="takeTime"
			:take-site="takeSite"
			:back-site="backSite"
		  />

		  <button
			class="primary"
			:class="{ disabled: !canPay }"
			:disabled="!canPay"
			@tap="canPay && openCashier()"
		  >
			{{ canPay ? '去支付' : (orderNum ? '无需支付' : '缺少订单') }}
		  </button>

		  <Spacer :size="24" />
		</scroll-view>

		<!-- 收银台弹层 -->
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
			  <text class="title">确认支付</text>
			  <text class="close" @tap="onCancelPay">×</text>
			</view>

			<scroll-view scroll-y class="sheet-body">
			  <Cashier
				:key="cashierKey"
				v-model:visible="cashierVisible"     
				:scene="'ORDER'"
				:biz-order-num="cashierOrderNumLocal"
				:order-num="cashierOrderNumLocal"
				:user-id="userId"
				:default-amount="cashierAmountLocal"
				:redirect-url="''"                   
				:allow-mixed="true"
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
	import { ref, computed } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import TitleBar from '@/components/header/TitleBar.vue'
	import StepBar from '../../components/return/StepBar.vue'
	import FeeSummary from '../../components/return/FeeSummary.vue'
	import Spacer from '@/components/common/Spacer.vue'
	import Cashier from '@/components/cashier/Cashier.vue'
	import { ensureReturnStep } from '../../utils/returnGuard'
	import { ReturnStep } from '../../constants/returnFlow'
	import { useReturnFlowStore } from '../../store/returnFlow'
	import { ensureExistOrNormalize } from '../../utils/orderGuard.js'
	import { getOrderBrief } from '@/api/order'

	/** 关闭自动继承（父层乱传 attrs 也不会告警/落到 DOM），与上面去掉 v-bind 配套 */
	defineOptions({ inheritAttrs: false })

	/** ----------------- 常量（动画/跳转节奏） ----------------- */
	const SHEET_ANIM_MS = 180
	const REDIRECT_DELAY = SHEET_ANIM_MS + 10
	const TOAST_SUCCESS_MS = 900

	/** ----------------- State ----------------- */
	const flow = useReturnFlowStore()
	const qOrderNum = ref('')
	const userId = ref(0)
	const online = ref(true)

	/** 展示数据 */
	const total = ref(0)
	const rows = ref([
	  { k:'时长费', v:'--' }, { k:'里程费', v:'--' },
	  { k:'不计免赔', v:'--' }, { k:'调度费', v:'--' },
	  { k:'整备服务费', v:'--' }, { k:'电池损耗费', v:'--' },
	])
	const savingText  = ref('')
	const packageText = ref('')
	const couponText  = ref('')

	const distanceKm   = ref(0)
	const useDuration  = ref('')
	const takeTime     = ref('')
	const takeSite     = ref('')
	const backSite     = ref('')

	/** 订单号（路由 -> store -> 本地存储） */
	const orderNum = computed(() =>
	  String(qOrderNum.value || flow.orderNum || uni.getStorageSync('currentOrderNum') || '')
	)

	/** 是否可支付（有订单且金额>0且在线） */
	const canPay = computed(() => !!orderNum.value && Number(total.value) > 0 && online.value)

	/** 支付成功跳转页（第三步） */
	const redirectUrl = computed(() =>
	  `/pkg-biz/pages/return/confirm?orderNum=${encodeURIComponent(orderNum.value)}`
	)

	/** 弹层控制 + 截取值 */
	const cashierVisible = ref(false)
	const cashierKey = ref(0)
	const cashierOrderNumLocal = ref('')
	const cashierAmountLocal   = ref(0)

	/** ----------------- 工具 ----------------- */
	const SNAP_KEY = 'returnFlow'
	const delay = (ms = 0) => new Promise(r => setTimeout(r, ms))

	/** 网络感知 */
	uni.getNetworkType?.({ success: (r) => { online.value = r.networkType !== 'none' } })
	uni.onNetworkStatusChange?.((r) => { online.value = !!r.isConnected })

	async function ensureUserId() {
	  if (userId.value) return userId.value
	  try { const u = uni.getStorageSync('user') || {}; if (u?.id) userId.value = Number(u.id) } catch {}
	  return userId.value || 0
	}
	function toNum(x, def = 0) { const n = Number(x); return Number.isFinite(n) ? n : def }
	async function fetchAndBindPayable(theOrderNum) {
	  const num = String(theOrderNum || orderNum.value || '')
	  if (!num) return
	  try {
		const b = await getOrderBrief(num).catch(() => null)
		const d = b?.data || {}
		const payable = toNum(d.payable, 0)
		total.value = payable; try { flow.payable = payable } catch {}

		rows.value = [
		  { k:'时长费',     v: toNum(d.durationFee, 0) },
		  { k:'里程费',     v: toNum(d.mileageFee, 0) },
		  { k:'不计免赔',   v: toNum(d.insuranceFee, 0) },
		  { k:'调度费',     v: toNum(d.dispatchFee, 0) },
		  { k:'整备服务费', v: toNum(d.serviceFee, 0) },
		  { k:'电池损耗费', v: toNum(d.batteryFee, 0) },
		]
		useDuration.value = String(d.useDuration || '')
		distanceKm.value  = toNum(d.distanceKm, 0)
		takeSite.value    = String(d.takeSite || '')
		backSite.value    = String(d.backSite || '')
		savingText.value  = String(d.savingText || '')
		packageText.value = String(d.packageText || '')
		couponText.value  = String(d.couponText || '')
	  } catch (e) {
		console.warn('[pay] fetch payable failed:', e?.message || e)
		total.value = 0
		rows.value = [
		  { k:'时长费', v: 0 }, { k:'里程费', v: 0 },
		  { k:'不计免赔', v: 0 }, { k:'调度费', v: 0 },
		  { k:'整备服务费', v: 0 }, { k:'电池损耗费', v: 0 },
		]
	  }
	}
	async function normalizeAndBindOrderNum() {
	  let num = String(orderNum.value || '').trim()
	  if (!num) return false
	  try { num = decodeURIComponent(num) } catch {}

	  let ex = null
	  try { ex = await ensureExistOrNormalize(num) } catch (err) {
		console.warn('[pay] ensureExistOrNormalize error:', err?.message || err)
	  }
	  if (ex && ex.ok === false && (ex.code === 'NOT_FOUND' || ex.code === 'EXPIRED')) return false

	  const finalNum = String(ex?.orderNum || num || '').trim()
	  if (!finalNum) return false

	  if (finalNum !== qOrderNum.value) qOrderNum.value = finalNum
	  try { flow.orderNum = finalNum } catch {}
	  try { uni.setStorageSync('currentOrderNum', finalNum) } catch {}
	  return true
	}
	function persistSnapshot() {
	  try {
		uni.setStorageSync(SNAP_KEY, {
		  step: ReturnStep.PAY,
		  orderNum: String(orderNum.value || qOrderNum.value || ''),
		  payable: Number(total.value || 0),
		  meta: {
			takeSite: takeSite.value,
			backSite: backSite.value,
			useDuration: useDuration.value,
			distanceKm: Number(distanceKm.value || 0),
		  }
		})
	  } catch {}
	}

	/** ----------------- 打开/关闭收银台 ----------------- */
	async function openCashier() {
	  const token = uni.getStorageSync('token')
	  if (!token) {
		return uni.navigateTo({
		  url: '/pages/login/index?redirect=' + encodeURIComponent('/pkg-biz/pages/return/pay?orderNum=' + orderNum.value)
		})
	  }

	  await ensureUserId()
	  const ok = await normalizeAndBindOrderNum()
	  if (!ok) return uni.showToast({ title: '订单不存在或已失效', icon: 'none' })

	  await fetchAndBindPayable(orderNum.value)

	  cashierOrderNumLocal.value = String(orderNum.value || '')
	  cashierAmountLocal.value   = Number(total.value || 0)

	  if (!cashierOrderNumLocal.value) return uni.showToast({ title: '缺少订单号', icon: 'none' })
	  if (Number.isNaN(cashierAmountLocal.value)) cashierAmountLocal.value = 0
	  if (cashierAmountLocal.value <= 0) return onPaidOk({ bizOrderNum: cashierOrderNumLocal.value, txnId: 'TXN_FREE_' + Date.now() })

	  persistSnapshot(); try { flow.setStep?.(ReturnStep.PAY) } catch {}
	  cashierKey.value += 1; cashierVisible.value = true
	}
	function closeCashier() {
	  animating.value = true
	  translateY.value = closeDistance
	  setTimeout(() => {
		cashierVisible.value = false
		animating.value = false
		translateY.value = 0
	  }, SHEET_ANIM_MS)
	}

	/** ----------------- 手势关闭动画 ----------------- */
	const startY = ref(0)
	const translateY = ref(0)
	const animating = ref(false)
	const closeDistance = 400
	function onTouchStart(e) { if (!animating.value) startY.value = e.changedTouches?.[0]?.clientY || 0 }
	function onTouchMove(e) {
	  if (animating.value) return
	  const y = e.changedTouches?.[0]?.clientY || 0
	  const delta = y - startY.value
	  translateY.value = Math.max(0, delta)
	}
	function onTouchEnd() {
	  if (translateY.value > 120) closeCashier()
	  else { animating.value = true; translateY.value = 0; setTimeout(()=> animating.value=false, 150) }
	}
	const sheetStyle = computed(() => {
	  const t = `translateY(${translateY.value}px)`
	  const tr = animating.value ? 'transform .18s ease-out' : 'transform 0s'
	  return `transform:${t};transition:${tr};`
	})

	/** ----------------- 支付回调 ----------------- */
	let redirecting = false
	function onPaidOk({ bizOrderNum, txnId }) {
	  if (redirecting) return
	  redirecting = true
	  try { uni.setStorageSync('lastPaid', { bizOrderNum, txnId, at: Date.now() }) } catch {}
	  uni.showToast({ title: '支付成功', icon: 'success', duration: TOAST_SUCCESS_MS })
	  try { closeCashier() } catch {}
	  try { flow.toConfirm?.() } catch {}

	  const url = redirectUrl.value
	  setTimeout(() => {
		try { uni.redirectTo({ url }) }
		catch { try { uni.navigateTo({ url }) } catch (e2) { console.warn('[pay] redirect failed:', e2?.message || e2) } }
	  }, REDIRECT_DELAY)
	}

	/** 统一失败处理：取消/断网/其它，都给明确提示 */
	function onPaidFail(e) {
		console.log('[pay] fail code=', e?.code, 'raw=', e)

	  const code = e?.code || 'UNKNOWN'
	  const msg =
		code === 'USER_CANCEL'      ? '您已取消支付' :
		code === 'NETWORK_OFFLINE'  ? '网络不可用，请检查后重试' :
		code === 'PAY_TIMEOUT'      ? '支付超时，请重试' :
		e?.message || '支付未完成或已取消'

	  uni.showToast({ title: msg, icon: 'none' })

	  // if (code === 'USER_CANCEL') {
	  //   // 可选：提供重试/切换
	  //   uni.showActionSheet({
	  //     itemList: ['重试当前渠道', '切换到其他渠道', '关闭'],
	  //     success: ({ tapIndex }) => {
	  //       if (tapIndex === 1) { closeCashier(); setTimeout(openCashier, 200) }
	  //     }
	  //   })
	  // } else if (code === 'NETWORK_OFFLINE') {
	  //   // 等网络恢复，保持弹层
	  // } else {
	  //   // 若后端返回 H5 兜底
	  //   const h5 = e?.data?.h5Url
	  //   if (h5) {
	  //     uni.showModal({
	  //       title: '切换网页支付',
	  //       content: '当前渠道不可用，是否切换到网页支付继续？',
	  //       success: ({ confirm }) => {
	  //         if (!confirm) return
	  //         // #ifdef H5
	  //         window.location.href = h5
	  //         // #endif
	  //         // #ifdef APP-PLUS
	  //         try{ plus.runtime.openURL(h5) }catch{ uni.navigateTo({ url:`/pages/common/web?url=${encodeURIComponent(h5)}` }) }
	  //         // #endif
	  //         // #ifdef MP-WEIXIN
	  //         uni.setClipboardData({ data: h5 })
	  //         uni.showModal({ title:'请在浏览器中打开', content:'链接已复制', showCancel:false })
	  //         // #endif
	  //       }
	  //     })
	  //   }
	  // }
	}

	function onCancelPay () {
	  uni.showModal({
		title: '提示',
		content: '订单尚未完成支付，车辆仍在计费中。若取消支付，将继续产生费用，是否确认取消？',
		cancelText: '继续支付',
		confirmText: '取消',
		success: ({ confirm }) => {
		  if (!confirm) return
		  // 统一走失败分支，维持语义一致
		  onPaidFail({ code: 'USER_CANCEL' })
		  // 立即关闭抽屉（也可以仅依赖 onPaidFail 的逻辑）
		  try { closeCashier() } catch {}
		}
	  })
	}

	/** ----------------- 生命周期 ----------------- */
	onLoad(async (opts) => {
	  try {
		flow.hydrate?.()
		const fromRoute = String(opts?.orderNum || '').trim()
		if (fromRoute) { try { flow.orderNum = fromRoute } catch {} try { uni.setStorageSync('currentOrderNum', fromRoute) } catch {} }
		qOrderNum.value = String(fromRoute || flow.orderNum || uni.getStorageSync('currentOrderNum') || '')
		await normalizeAndBindOrderNum()
		await fetchAndBindPayable(qOrderNum.value)
		try { flow.setStep?.(ReturnStep.PAY) } catch {}
		persistSnapshot()
	  } catch (error) {
		console.error('onLoad error:', error)
		uni.showToast({ title: '加载订单信息失败', icon: 'none' })
	  }
	})
	onShow(async () => {
	  await normalizeAndBindOrderNum()
	  await ensureReturnStep(ReturnStep.PAY)
	})
	</script>

	<style scoped>
	.page{ background:#fff; }
	.page-locked{ pointer-events:none; }
	.hero{ background:linear-gradient(180deg,#e8fff1,#f6f7f9) }
	.primary{
	  width: 688rpx; height: 96rpx; margin: 32rpx auto 48rpx;
	  border: none; border-radius: 48rpx;
	  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%);
	  color:#fff; font-weight:500; font-size:40rpx;
	  display:flex; align-items:center; justify-content:center;
	  box-shadow: 0 8rpx 20rpx rgba(13,182,61,.25);
	}
	.primary::after{ border: none !important; }
	.primary.disabled,
	.primary[disabled]{
	  background: linear-gradient(180deg, rgba(130,237,113,0.5) 0%, rgba(13,182,61,0.5) 100%) !important;
	  color: rgba(255,255,255,0.9) !important;
	  box-shadow: none !important;
	}

	/* 底部收银台 */
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
