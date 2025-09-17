// composables/useOrderPricing.js
import { computed } from 'vue'

export function useOrderPricing (opts = {}) {
  const {
    baseFeeRef,
    selectedComboRef,
    selectedCouponRef,
    isPaymentRef,
    orderInfoRef
  } = opts

  // —— 工具 —— //
  const n = (v, d = 0) => {
    const x = Number(v)
    if (!Number.isFinite(x)) return d
    return x % 1 ? Number(x.toFixed(2)) : x
  }
  const money = (v) => `¥${n(v)}`
  const pick = (obj, key, d = 0) => n(obj?.[key], d) // 安全取数

  // —— 基础费用（给默认值，避免为空） —— //
  const timeRent   = computed(() => pick(baseFeeRef?.value, 'timeRent', 8))
  const mileRent   = computed(() => pick(baseFeeRef?.value, 'mileRent', 0.9))
  const noDeduct   = computed(() => pick(baseFeeRef?.value, 'notDeductibleFee', 5))
  const serviceFee = computed(() => pick(baseFeeRef?.value, 'serviceFee', 5))
  const dispatch   = computed(() => pick(baseFeeRef?.value, 'dispatchFee', 0))

  // —— 套餐 / 优惠券 —— //
  const comboRent = computed(() => pick(selectedComboRef?.value, 'comboRent', 0))
  const couponCut = computed(() => {
    const c = selectedCouponRef?.value
    return c && c.couponId ? n(c.discountAmount, 0) : 0
  })

  // 节省额（后端字段优先，兜底=原价-套餐价）
  const comboSaving = computed(() => {
    const sc = selectedComboRef?.value || {}
    const direct = sc.saveAmount ?? sc.saved ?? sc.discount ?? sc.saving
    if (direct != null && Number.isFinite(Number(direct))) return Math.max(0, n(direct))
    const origin = n(sc.originPrice ?? sc.originalPrice ?? sc.listPrice, 0)
    const price  = n(sc.comboRent ?? sc.price, 0)
    return Math.max(0, n(origin - price))
  })

  // —— 费用行（用 v-for 渲染，避免 <text> 嵌套偶发不显示） —— //
  const feeRows = computed(() => ([
    {
      label: '时租费用',
      rich: true,
      valueRich: `¥<span class="din48">${timeRent.value}</span>/小时 + ¥<span class="din48">${mileRent.value}</span>/公里`,
      danger: true
    },
    { label: '不计免赔',  value: money(noDeduct.value),  danger: true },
    { label: '整备服务费', value: money(serviceFee.value), danger: true },
    { label: '调度费',    value: money(dispatch.value),    danger: true }
  ]))

  // —— 预估金额（默认包含四项 + 套餐 − 优惠券）——
  // 如果你不想把“不计免赔/调度费”算进预估，把对应项减掉即可。
  const estimatedAmount = computed(() => {
    const v =
      comboRent.value +
      noDeduct.value +       // 如不需要，改成 0
      serviceFee.value +
      dispatch.value -       // 如不需要，改成 0
      couponCut.value
    return Math.max(0, n(v))
  })

  // 支付态金额（订单详情）
  const payAmount = computed(() => {
    const o = orderInfoRef?.value || {}
    return n(o.totalFee ?? o.totalAmount, 0)
  })

  // 底部“优惠后金额”
  const bottomAmount = computed(() =>
    isPaymentRef?.value ? payAmount.value : estimatedAmount.value
  )

  const noticeText = '若还车时续航< 30km，则收取¥200电损费'

  return {
    // 输出给页面
    feeRows, noticeText,
    comboSaving,
    estimatedAmount, bottomAmount,
    timeRent, mileRent
  }
}
