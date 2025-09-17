// utils/returnGuard.js

import { useReturnFlowStore } from '../store/returnFlow'
import { ReturnStep } from '../constants/returnFlow'
import { getReturnStatus } from '@/api/order'

let __guarding = false
let __lastNavAt = 0

function now() { return Date.now() }

function currentRoute() {
  const pages = (typeof getCurrentPages === 'function') ? getCurrentPages() : []
  const cur = pages[pages.length - 1]
  return String((cur && (cur.route || (cur.$page && cur.$page.fullPath))) || '').replace(/\?.*$/, '')
}

function currentQuery() {
  const pages = (typeof getCurrentPages === 'function') ? getCurrentPages() : []
  const cur = pages[pages.length - 1]
  return (cur && (cur.options || (cur.$page && cur.$page.options))) || {}
}

function isSamePage(targetPath, targetQuery) {
  const route = currentRoute()
  if (!route) return false
  const normalize = s => String(s || '').replace(/^\//, '')
  const samePath = normalize(route) === normalize(targetPath)
  if (!samePath) return false

  const curQ = currentQuery()
  return String(curQ.orderNum || '') === String((targetQuery && targetQuery.orderNum) || '')
}

function safeRedirect(url) {
  const targetPath = url.replace(/^\//, '').split('?')[0]
  const targetQuery = {}
  const qs = url.split('?')[1] || ''
  qs.split('&').forEach(kv => {
    const pair = kv.split('=')
    if (pair[0]) targetQuery[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  })

  if (isSamePage(targetPath, targetQuery)) return
  const t = now()
  if (t - __lastNavAt < 250) return
  __lastNavAt = t

  uni.redirectTo({ url })
}

// ===== 修复点：路由优先取号，立即写回 store/local =====
function pickOrderNumFromRoute() {
  try {
    const q = currentQuery()
    return String(q?.orderNum || '').trim()
  } catch (_) { return '' }
}

function pickOrderNumSafely(flow) {
  const fromRoute = pickOrderNumFromRoute()
  const fromFlow  = String(flow?.orderNum || '').trim()
  const fromLocal = String(uni.getStorageSync('currentOrderNum') || '').trim()

  const num = fromRoute || fromFlow || fromLocal
  if (fromRoute) {
    try { flow.orderNum = fromRoute } catch (_) {}
    try { uni.setStorageSync('currentOrderNum', fromRoute) } catch (_) {}
  }
  return num
}

// ===== 新增：支持 REBATE（晒单返利） =====
function mapServerToStep(s) {
  const x = String(s && s.status || '').toLowerCase()
  if (x.includes('rebate') || x.includes('share')) return ReturnStep.REBATE
  if (x.includes('confirm')) return ReturnStep.CONFIRM
  if (x.includes('pay'))     return ReturnStep.PAY
  if (x.includes('photo'))   return ReturnStep.PHOTOS
  return undefined
}

export async function ensureReturnStep(expected) {
  if (__guarding) return true
  __guarding = true
  try {
    const flow = useReturnFlowStore()
    if (typeof flow.hydrate === 'function') flow.hydrate()

    const orderNum = pickOrderNumSafely(flow)
    if (!orderNum) {
      safeRedirect('/pkg-biz/pages/return/photos')
      return false
    }
    try { uni.setStorageSync('currentOrderNum', orderNum) } catch (_) {}

    let serverStep
    try {
      const s = await getReturnStatus(orderNum)
      serverStep = mapServerToStep(s)
    } catch (_) {}

    const localStep  = (typeof flow.step === 'number') ? flow.step : ReturnStep.PHOTOS
    const mergedStep = Math.max(localStep, (typeof serverStep === 'number' ? serverStep : localStep))

    if (mergedStep !== flow.step) {
      flow.step = mergedStep
      try {
        const snap = uni.getStorageSync('returnFlow') || {}
        uni.setStorageSync('returnFlow', { ...snap, step: mergedStep, orderNum })
      } catch (_) {}
    }

    if (mergedStep < expected) {
      const url =
        expected === ReturnStep.PHOTOS  ? `/pkg-biz/pages/return/photos?orderNum=${encodeURIComponent(orderNum)}`
      : expected === ReturnStep.PAY     ? `/pkg-biz/pages/return/pay?orderNum=${encodeURIComponent(orderNum)}`
      : expected === ReturnStep.CONFIRM ? `/pkg-biz/pages/return/confirm?orderNum=${encodeURIComponent(orderNum)}`
      : /* REBATE */                      `/pkg-biz/pages/return/rebate?orderNum=${encodeURIComponent(orderNum)}`
      safeRedirect(url)
      return false
    }

    if (mergedStep !== expected) {
      const target = mergedStep
      const url =
        target === ReturnStep.PHOTOS   ? `/pkg-biz/pages/return/photos?orderNum=${encodeURIComponent(orderNum)}`
      : target === ReturnStep.PAY      ? `/pkg-biz/pages/return/pay?orderNum=${encodeURIComponent(orderNum)}`
      : target === ReturnStep.CONFIRM  ? `/pkg-biz/pages/return/confirm?orderNum=${encodeURIComponent(orderNum)}`
      : /* REBATE */                      `/pkg-biz/pages/return/rebate?orderNum=${encodeURIComponent(orderNum)}`
      safeRedirect(url)
      return false
    }

    return true
  } finally {
    setTimeout(() => { __guarding = false }, 200)
  }
}
