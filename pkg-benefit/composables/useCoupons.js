// composables/useCoupons.js
import { ref, computed } from 'vue'

/**
 * 优惠券筛选与展示
 * @param {Object} opts
 *  - couponListRef: ref(Array<{ couponId, name, discountAmount, type?, threshold? ... }>)
 *  - orderDraftRef?: ref({ leaseType, hours, miles, comboId, cityId, ...}) // 如需做更严谨过滤
 *  - selectedCouponRef: ref({ couponId?, name?, discountAmount? })
 */
export function useCoupons (opts = {}) {
  const { couponListRef, orderDraftRef, selectedCouponRef } = opts

  // —— 基础过滤（可按需扩展：门槛、有效期、车型/城市等）——
  const availableCoupons = computed(() => {
    const list = Array.isArray(couponListRef?.value) ? couponListRef.value : []
    // 这里只做最简单的“未使用且折扣>0”的过滤；你后端若会返回不可用状态，可在此补充过滤条件
    return list.filter(c => Number(c?.discountAmount) > 0)
  })

  // —— 最优券（折扣最大者）——
  const bestCoupon = computed(() => {
    const arr = availableCoupons.value.slice().sort(
      (a, b) => Number(b.discountAmount || 0) - Number(a.discountAmount || 0)
    )
    return arr[0] || null
  })

  // —— 顶部展示文案（入口行）——
  const couponBestText = computed(() => {
    const sel = selectedCouponRef?.value
    if (sel && sel.couponId) {
      const cut = Number(sel.discountAmount || 0)
      return `太棒了，为您省了${cut}元！`
    }
    const cnt = availableCoupons.value.length
    return cnt > 0 ? `${cnt}张优惠券可用，快去选择吧~` : '暂无可用优惠券'
  })

  // —— 选择事件（供页面调用/或下级页面回传时复用）——
  function pickCoupon(coupon) {
    if (!coupon) {
      selectedCouponRef.value = {}
      uni.removeStorageSync('tempCoupon')
      return
    }
    const { couponId, name, discountAmount } = coupon
    selectedCouponRef.value = { couponId, name, discountAmount }
    uni.setStorageSync('tempCoupon', selectedCouponRef.value)
  }

  // —— 跳转参数（订单页 -> 券列表页）——
  function buildCouponNavigateParams ({ carId, isPayment, defaultTab = 'coupon' } = {}) {
    return `/pages/coupon/index?carId=${carId}&isPayment=${isPayment}&defaultTab=${defaultTab}`
  }

  return {
    availableCoupons,
    bestCoupon,
    couponBestText,
    pickCoupon,
    buildCouponNavigateParams
  }
}
