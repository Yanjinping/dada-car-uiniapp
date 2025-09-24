// src/api/deposit.js
import { get, post } from './request'

// 统一前缀（你的 request.js 里 BASE 已经是完整域名，这里只拼相对路径）
const BASE = '/deposit'

/** 获取押金信息：是否已缴纳、金额、绑定的押金订单号 */
export const getDepositInfo = async () => {
  try {
    const userId = uni.getStorageSync('userId')
    const r = await get(`${BASE}/info`, { userId }, true)
    const d = r?.data ?? r?.result ?? r
    return {
      hasPaid: !!(d?.hasPaid ?? d?.paid),
      amount: Number(d?.amount ?? 0),
      bizOrderNum: d?.bizOrderNum || d?.orderNum || ''
    }
  } catch (e) {
    console.warn('getDepositInfo error:', e)
    return { hasPaid: false, amount: 0, bizOrderNum: '' }
  }
}

/** 创建押金订单（若还没有 bizOrderNum 时） */
export const createDepositOrder = async (amount = 10) => {
  try {
    const r = await post(`${BASE}/order/create`, { amount }, true)
    const d = r?.data ?? r?.result ?? r
    return { bizOrderNum: d?.bizOrderNum || d?.orderNum || '' }
  } catch (e) {
    console.warn('createDepositOrder error:', e)
    return { bizOrderNum: '' }
  }
}

/** 申请退还押金 */
export const refundDeposit = async () => {
  try {
    const r = await post(`${BASE}/refund`, {}, true)
    // 按你的 request.js，成功会返回 { success: true, data: ... }
    return r?.data ?? r
  } catch (e) {
    console.warn('refundDeposit error:', e)
    return { success: false }
  }
}

/** 芝麻免押：查询授权状态 */
export const getSesameStatus = async () => {
  try {
    const r = await get(`${BASE}/sesame/status`, {}, true)
    const d = r?.data ?? r?.result ?? r
    return { authorized: !!d?.authorized }
  } catch (e) {
    console.warn('getSesameStatus error:', e)
    return { authorized: false }
  }
}

/**
 * 芝麻免押：发起授权
 * 后端若返回 H5 跳转链接用 url；小程序可能返回 params（appId、path、extraData 等）
 */
export const startSesameAuth = async () => {
  try {
    const r = await post(`${BASE}/sesame/start`, {}, true)
    const d = r?.data ?? r?.result ?? r
    return {
      url: d?.url || '',
      params: d?.params || null
    }
  } catch (e) {
    console.warn('startSesameAuth error:', e)
    return { url: '', params: null }
  }
}

/** 芝麻免押：解除授权 */
export const cancelSesameAuth = async () => {
  try {
    const r = await post(`${BASE}/sesame/cancel`, {}, true)
    return r?.data ?? r
  } catch (e) {
    console.warn('cancelSesameAuth error:', e)
    return { success: false }
  }
}
