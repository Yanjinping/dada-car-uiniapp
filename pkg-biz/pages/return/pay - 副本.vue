<template>
  <scroll-view scroll-y class="page">
    <TitleBar title="订单支付" background="#FFFFFF" />
    <view class="hero">
      <StepBar :current="2" />
    </view>

    <!-- 费用汇总：保持你原有展示 -->
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

    <!-- ✅ 统一收银台（Cashier） -->
    <Cashier
	  :visible="false"
	  :show-header="false" 
	  :show-amount="false" 
      scene="ORDER"
      :order-num="orderNum"
      :user-id="userId"
      :default-amount="Number(total)"
      :allow-mixed="false"
      :enable-wechat="true"
      :enable-alipay="true"
      :redirect-url="redirectUrl"
      @success="onPaidOk"
      @fail="onPaidFail"
    />
	
	<!-- 主按钮 -->
	<button class="payment-button" v-if="showButton" @tap="handlePayment"></button>

  </scroll-view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import TitleBar from '@/components/header/TitleBar.vue'
import StepBar from '../../components/return/StepBar.vue'
import FeeSummary from '../../components/return/FeeSummary.vue'
import Cashier from '@/components/cashier/Cashier.vue'

import { ensureReturnStep } from '../../utils/returnGuard'
import { ReturnStep } from '../../constants/returnFlow'
import { useReturnFlowStore } from '@/stores/returnFlow.js'

/** store & 路由 */
const flow = useReturnFlowStore()
const qOrderNum = ref('')
const userId = ref(0) // 如有登录态，可在这里赋真实 userId

/** 展示数据（沿用你示例） */
const total = ref(32.5)
const rows = ref([
  { k:'时长费', v:'28.00' }, { k:'里程费', v:'14.50' },
  { k:'不计免赔', v:'5.00' }, { k:'调度费', v:'0.00' },
  { k:'整备服务费', v:'5.00' }, { k:'电池损耗费', v:'0.00' },
])
const savingText  = ref('套餐已为您节省20.00元')
const packageText = ref('19.9元三小时免里程套餐')
const couponText  = ref('-¥10')

const distanceKm   = ref(60)
const useDuration  = ref('3小时20分钟')
const takeTime     = ref('2025-07-29 10:10:10')
const takeSite     = ref('丰泽区｜坪山加油站（勿停充电桩位置）')
const backSite     = ref('丰泽区｜坪山加油站（勿停充电桩位置）')

/** 订单号：store / 路由 / 本地存储 取其一 */
const orderNum = computed(() =>
  String(qOrderNum.value || flow.orderNum || uni.getStorageSync('currentOrderNum') || '')
)

/** 支付成功后的跳转页（沿用你之前到确认页） */
const redirectUrl = computed(() =>
  `/pkg-biz/pages/return/confirm?orderNum=${encodeURIComponent(orderNum.value)}`
)

/** 事件回调（成功/失败） */
function onPaidOk(payload) {
  try { flow.toConfirm?.() } catch(e) {}
  // Cashier 内部已做 redirect，这里通常无需再跳
}
function onPaidFail(err) {
  // 失败提示 Cashier 已做；这里可加埋点/日志
}

/** 生命周期 */
onLoad((opts) => {
  flow.hydrate?.()
  qOrderNum.value = String(opts?.orderNum || flow.orderNum || uni.getStorageSync('currentOrderNum') || '')

  if (Number(flow.payable)) total.value = Number(flow.payable)

  const m = flow.meta || {}
  if (m.distanceKm != null) distanceKm.value = m.distanceKm
  if (m.useDuration)        useDuration.value = m.useDuration
  if (m.takeSite)           takeSite.value    = m.takeSite
  if (m.backSite)           backSite.value    = m.backSite
})

onShow(async () => { await ensureReturnStep(ReturnStep.PAY) })
</script>

<style scoped>
.page{ background:#fff; }
.hero{ background:linear-gradient(180deg,#e8fff1,#f6f7f9) }
.payment-button { position: fixed; bottom: 60rpx; left: 40rpx; right: 40rpx; height: 88rpx; line-height: 88rpx; background-color: #FFCC00; color: #333; font-size: 32rpx; font-weight: bold; border-radius: 44rpx; text-align: center; border: none; }

</style>
