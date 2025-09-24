// src/api/pay-sdk.js
import { get, post } from './request'

/** ================= 配置 ================ */
export const API = {
  payInit: '/pay/init',                 // 你的 request 会自动加 '/api' 前缀
  payQuote: '/pay/quote',
  walletBalance: '/wallet/balance',
  payQueryPrepay: '/pay/query/prepay',  // 根据 txnId 查询预下单参数（兜底轮询用）
  payQueryByTxn: '/pay/query/byTxn'     // 可选：按需使用
}

export const BizType = {
  ORDER:    'ORDER_RENT',
  PACKAGE:  'BENEFIT_PACKAGE',
  DEPOSIT:  'DEPOSIT',
  PENALTY:  'PENALTY',
  RECHARGE: 'RECHARGE'
}
export const PayMethod = {
  WALLET_ONLY:    'WALLET_ONLY',
  WALLET_COMBINE: 'WALLET_COMBINE',
  WECHAT:         'WECHAT',
  ALIPAY:         'ALIPAY'
}
export const Channel = { WECHAT: 'WECHAT', ALIPAY: 'ALIPAY' }

/** ================= 小工具 ================ */
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0 }

function unwrapPkgId(x) {
  if (x == null) return undefined
  const s = String(x)
  if (/^p\d+$/i.test(s)) return Number(s.replace(/^p/i, ''))
  const n = Number(s); return Number.isFinite(n) ? n : undefined
}

export function getClientHints() {
  const up = (uni.getSystemInfoSync?.().uniPlatform || '').toLowerCase()
  const isMp = up.includes('mp'), isApp = up.includes('app'), isH5 = up.includes('h5')
  const clientType = isMp ? 'JSAPI' : (isApp ? 'APP' : (isH5 ? 'H5' : 'PC'))
  const sceneOf = (ch) => {
    if (ch === 'WECHAT') return isMp ? 'WECHAT_JSAPI' : (isApp ? 'WECHAT_APP' : (isH5 ? 'WECHAT_H5' : 'WECHAT_NATIVE'))
    if (ch === 'ALIPAY') return isApp ? 'ALIPAY_APP' : (isH5 ? 'ALIPAY_WAP' : 'ALIPAY_PC')
    return null
  }
  return { clientType, sceneOf }
}

/** 合并支付/渠道判定（唯一真相：后端仍会二次裁决） */
export function decidePayIntent({ allowMixed = true, selectedPayment = 'WECHAT', orderAmount = 0, userBalance = 0 }) {
  const balancePay = Math.min(num(userBalance), num(orderAmount))
  const remainPay  = Math.max(0, num(orderAmount) - balancePay)

  // 合并
  if (allowMixed && balancePay > 0 && remainPay > 0) {
    return {
      payMethod: PayMethod.WALLET_COMBINE,
      channel: selectedPayment === 'ALIPAY' ? Channel.ALIPAY : Channel.WECHAT,
      walletUse: balancePay
    }
  }
  // 单渠道
  if (selectedPayment === 'WECHAT') return { payMethod: PayMethod.WECHAT, channel: Channel.WECHAT }
  if (selectedPayment === 'ALIPAY') return { payMethod: PayMethod.ALIPAY, channel: Channel.ALIPAY }
  return { payMethod: PayMethod.WALLET_ONLY, channel: null }
}

/** 统一金额预览（用不到可不调用） */
export async function payQuote({ scene = 'ORDER', bizOrderNum = '', packageId }) {
  const body = {
    bizType: BizType[scene] || BizType.ORDER,
    bizOrderNum: scene === 'PACKAGE' ? undefined : (bizOrderNum || undefined),
    packageId:   scene === 'PACKAGE' ? (unwrapPkgId(packageId ?? bizOrderNum)) : undefined
  }
  const r = await post(API.payQuote, body)
  const d = r?.data ?? r
  const ok = !!(d?.ok || d?.success || d?.code === 0 || d?.data)
  const node = d?.data ?? d ?? {}
  return {
    ok,
    data: {
      totalAmount: num(node.totalAmount),
      currency: node.currency || 'CNY',
      summary: node.summary || {}
    },
    message: d?.message || d?.msg || ''
  }
}

/** 统一初始化支付（唯一需要调用的中台接口） */
export async function payInitUnified({
  userId,
  scene = 'ORDER',
  bizOrderNum = '',
  packageId,
  selectedPayment = 'WECHAT',
  allowMixed = true,
  orderAmount = 0,
  userBalance = 0,
  userOpenId = null,                 // 小程序可传 openid；推荐前端传 code、后端换 openid
  clientToken
}) {
  const bt = BizType[scene] || BizType.ORDER
  const { payMethod, channel, walletUse } = decidePayIntent({ allowMixed, selectedPayment, orderAmount, userBalance })
  const { clientType } = getClientHints()

  const body = {
    userId: Number(userId || 0),
    bizType: bt,
    // bizOrderNum: scene === 'PACKAGE' ? undefined : bizOrderNum,
	bizOrderNum: bizOrderNum ?? null,  
    packageId:   scene === 'PACKAGE' ? unwrapPkgId(packageId ?? bizOrderNum) : undefined,
    totalAmount: num(orderAmount),   // 仅用于展示参考，后端会重算
    payMethod, channel,
    walletUse,                       // 仅在合并时传
    clientType,
    userOpenId,
    clientToken: clientToken || (Date.now() + '_' + Math.random().toString(16).slice(2))
  }

  const res = await post(API.payInit, body, true, { showLoading: false })
  return normalizeInit(res)
}

/** 预下单参数查询（用于兜底轮询） */
export async function payQueryPrepay(txnId) {
  const r = await get(API.payQueryPrepay, { txnId }, true)
  return normalizeInit(r)            // 复用同一规范化
}

/** （可选）按交易号查询支付单 */
export async function queryByTxnId(txnId) {
  const r = await get(API.payQueryByTxn, { txnId }, true)
  const d = r?.data ?? r
  const ok = !!(d?.ok || d?.success || d?.code === 0 || d?.data)
  return { ok, data: d?.data ?? d ?? {}, message: d?.message || d?.msg || '' }
}

/** 统一规范返回结构，方便组件使用 */
function normalizeInit(res) {
  const d = res?.data ?? res
  const ok = !!(d?.ok || d?.success || d?.code === 0 || d?.data)
  const n = d?.data ?? d ?? {}
  return {
    ok,
    message: d?.message || d?.msg || '',
    data: {
      paid: !!n.paid,
      txnId: n.txnId ?? null,
      bizOrderNum: n.bizOrderNum ?? n.orderNo ?? null,
      channel: n.channel ?? null,
      wechatParams: n.wechatParams ?? null,
      alipayParams: n.alipayParams ?? null,     // APP：{orderInfo}；WAP：{payUrl}；PC：{formHtml}
      h5Url: n.h5Url ?? n.mwebUrl ?? n.payUrl ?? null,
      codeUrl: n.codeUrl ?? null,
      formHtml: n.formHtml ?? null,
      walletPart: num(n.walletPart),
      externalPart: num(n.externalPart),
      finalAmount: num(n.finalAmount ?? (num(n.walletPart) + num(n.externalPart)))
    }
  }
}

/** ================= 余额获取 ================ */
// 获取指定 moneyType 的余额（带 userId，默认 accountBalance）
export const getWalletBalance = async (moneyType = 'accountBalance') => {
  try {
    const userId = uni.getStorageSync('userId')
    const resp = await get(API.walletBalance, { userId, moneyType }, true)
    const raw  = resp?.data  // 后端可直接返回数值，如 "218.6"
    return toAmount(raw)
  } catch (e) {
    console.warn('getWalletBalance error:', e)
    return 0
  }
}

function toAmount(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (v == null) return 0
  // 兼容 {data: ...} 或直接原始值
  const raw = (typeof v === 'object' && 'data' in v) ? v.data : v
  // 兼容 "1,234.56" / "1.234,56" / "218,6"
  let s = String(raw).trim().replace(/[^\d,.\-]/g, '')
  const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.')
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) { s = s.replace(/\./g, '').replace(',', '.') }
    else { s = s.replace(/,/g, '') }
  } else if (lastComma !== -1) {
    s = s.replace(',', '.')
  } else {
    s = s.replace(/,/g, '')
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}
