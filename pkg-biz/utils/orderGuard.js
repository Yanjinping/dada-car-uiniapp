// src/utils/orderGuard.js
import { getOrderBrief } from '@/api/order'
import { useReturnFlowStore } from '../store/returnFlow'

/**
 * 幽灵订单处理：后端查不到 → 静默清理本地与 store，回归正常空态
 * @returns {Promise<{ok:boolean, normalized:boolean}>} normalized=true 表示已做归一化
 */
export async function ensureExistOrNormalize(orderNum) {
  const num = String(orderNum || uni.getStorageSync('currentOrderNum') || '')
  if (!num) return { ok: false, normalized: true } // 本就没有，当作已归一化

  try {
    const r = await getOrderBrief(num) // { ok, data } | 404→ORDER_NOT_FOUND
    if (r?.ok && r?.data) return { ok: true, normalized: false }
  } catch (_) { /* 下方统一处理 */ }

  // —— 查不到订单：做“静默归一化” —— //
  try { uni.removeStorageSync('currentOrderNum') } catch {}
  try { uni.removeStorageSync('lastPaid') } catch {}

  const flow = useReturnFlowStore()
  try { flow.reset?.() } catch {}
  // 如果没有 reset，可手动清空关键字段：
  try {
    flow.orderNum = ''
    flow.payable = 0
    flow.meta = {}
  } catch {}
  return { ok: false, normalized: true }
}
