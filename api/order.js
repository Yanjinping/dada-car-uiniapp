// src/api/order.js
import { get, post } from './request'

/** ========= 接口路径集中 ========= */
const API = {
  orderBrief:           (orderNum) => `/order/brief/${encodeURIComponent(orderNum)}`,
  getReturnStatus:      (orderNum) => `/order/return/status/${encodeURIComponent(orderNum)}`,
  confirmReturn:        (orderNum) => `/order/return/confirm/${encodeURIComponent(orderNum)}`,
  payQuote: '/pay/quote',
  payInit:  '/pay/init',
  // 降级口（若没有 brief/quote 时）
  orderPayableSummary:  (orderNum) => `/api/orders/payable-summary/${encodeURIComponent(orderNum)}`,
  benefitPackageById:   (id) => `/api/benefit/packages/${id}`,
}

/** ========= 统一出参 ========= */
function norm(res) {
  const packet = res?.data ?? res
  const ok = (packet?.success === true) || (Number(packet?.code) === 0) || !!packet?.ok
  const message = packet?.message || packet?.msg || ''
  const code = ok ? 0 : (packet?.bizCode || packet?.code || packet?.status || 'ERR')
  return { ok, data: packet?.data ?? packet, message, code }
}

function withNotFoundMap(ret, hint = '') {
  const r = { ...ret }
  const msg = (r.message || hint || '').toUpperCase()
  if (!r.ok && (r.code === 404 || msg.includes('NOT FOUND') || msg.includes('ORDER_NOT_FOUND'))) {
    r.code = 'ORDER_NOT_FOUND'
  }
  return r
}

/** ========= 对外 API ========= */

// A1) 订单最小摘要（存在性/状态/应付）
export async function getOrderBrief(orderNum) {
  if (!orderNum) return { ok: false, data: null, message: '缺少 orderNum', code: 'ARG_MISSING' }
  try {
    const res = await get(API.orderBrief(orderNum), {}, true, { showLoading: false })
    return withNotFoundMap(norm(res))
  } catch (e) {
    return withNotFoundMap({ ok: false, data: null, message: e?.message || '网络异常', code: 500 })
  }
}

// A2) 查询归还状态（是否已支付/应付/是否需照片）
export async function getReturnStatus(orderNum) {
  if (!orderNum) return { ok: false, data: null, message: '缺少 orderNum', code: 'ARG_MISSING' }
  try {
    const res = await get(API.getReturnStatus(orderNum), {}, true, { showLoading: false })
    return withNotFoundMap(norm(res))
  } catch (e) {
    return withNotFoundMap({ ok: false, data: null, message: e?.message || '网络异常', code: 500 })
  }
}

// A3) 客户确认归还
export async function confirmReturn(orderNum, body = {}) {
  if (!orderNum) return { ok: false, data: null, message: '缺少 orderNum', code: 'ARG_MISSING' }
  try {
    const res = await post(API.confirmReturn(orderNum), body, true, { loadingText: '提交中...' })
    return norm(res)
  } catch (e) {
    return { ok: false, data: null, message: e?.message || '提交失败', code: 500 }
  }
}

// A4) 统一金额试算（优先 pay-quote，失败降级）
export async function getPayQuote({ scene = 'ORDER', orderNum = '', packageId = null } = {}) {
  const sceneUpper = String(scene).toUpperCase()
  const bizTypeMap = { ORDER:'ORDER_RENT', PACKAGE:'BENEFIT_PACKAGE', DEPOSIT:'DEPOSIT', PENALTY:'PENALTY', RECHARGE:'RECHARGE' }
  const pkgId = sceneUpper === 'PACKAGE' ? parsePkg(orderNum, packageId) : undefined

  try {
    const res = await post(API.payQuote, {
      bizType: bizTypeMap[sceneUpper] || 'ORDER_RENT',
      bizOrderNum: sceneUpper === 'PACKAGE' ? undefined : (orderNum || undefined),
      packageId:   sceneUpper === 'PACKAGE' ? pkgId : undefined
    }, true, { showLoading: false })
    const r = norm(res); if (r.ok) return r
  } catch {}

  try {
    if (sceneUpper === 'ORDER') {
      const res = await get(API.orderPayableSummary(orderNum), {}, true, { showLoading: false })
      return norm(res)
    }
    if (sceneUpper === 'PACKAGE') {
      const res = await get(API.benefitPackageById(pkgId), {}, true, { showLoading: false })
      return norm(res)
    }
  } catch {}

  return { ok: true, data: { totalAmount: 0, currency: 'CNY' }, message: '', code: 0 }
}

// A5) 发起支付（编排器统一入口）
export async function payInitUnified(body) {
  try {
    const res = await post(API.payInit, body, true, { loadingText: '下单中...' })
    const r = norm(res)
    return withNotFoundMap(r)
  } catch (e) {
    return withNotFoundMap({ ok: false, data: null, message: e?.message || '下单失败', code: 500 })
  }
}

/** ========= 工具 ========= */
function parsePkg(orderNum, packageId) {
  if (packageId != null && packageId !== '') {
    const n = Number(packageId); if (Number.isFinite(n)) return n
  }
  const m = String(orderNum || '').match(/^p(\d+)$/i)
  return m ? Number(m[1]) : null
}
