// src/api/pay.js
import { post } from './request'

/**
 * 统一支付初始化（前端包装器）
 * - PACKAGE 场景：调用 /user/packages/purchase/init 并传入 { packageId, ... }
 * - 其他场景：暂时同样走上面的接口（等后端开放 /pay/init 可再切路径）
 *
 * 统一返回给收银台的字段：
 *  data: {
 *    paid           是否已完成（0元/纯钱包）
 *    txnId          我方支付流水号
 *    orderNo        兼容字段（=txnId 或 bizOrderNum）
 *    bizOrderNum    业务单号
 *    channel        WECHAT | ALIPAY | null
 *    wechatParams   JSAPI/APP 的拉起参数；H5 的 { mwebUrl }；Native 的 { codeUrl }
 *    alipayParams   APP { orderInfo }；WAP { payUrl }；PC { formHtml }
 *    h5Url          统一用于 H5 跳转（mwebUrl/payUrl）
 *    codeUrl        Native 场景二维码链接（用于生成二维码）
 *    formHtml       电脑端表单（字符串，前端自行写入页面）
 *  }
 */
export async function payInit (opt = {}) {
  const scene = opt.scene || 'PACKAGE'
  const clientType = opt.clientType || guessClientType()
  const channel = resolveChannel(opt.payMethod, opt.channel, clientType)
  const sceneEnum = opt.scene || guessScene(channel)

  // =================== 套餐购买 ===================
  if (scene === 'PACKAGE' || opt.bizType === 'BENEFIT_PACKAGE' || opt.packageId != null) {
    const packageId =
      opt.packageId ??
      unwrapPkgId(opt.bizOrderNum) ??   // 兼容 p12 形式
      unwrapPkgId(opt.orderNum)

    if (!packageId) {
      return { success: false, message: '缺少 packageId（或 bizOrderNum/orderNum 形如 p12）' }
    }

    // 未传 payMethod 时按 allowMixed + channel 推断
    const payMethod = opt.payMethod || (
      opt.allowMixed && (channel === 'WECHAT' || channel === 'ALIPAY')
        ? 'WALLET_COMBINE'
        : (channel === 'WECHAT' ? 'WECHAT'
            : (channel === 'ALIPAY' ? 'ALIPAY' : 'WALLET_ONLY'))
    )

    const body = {
      packageId,                                   // ★ 服务端必需
      overridePrice: numOrUndef(opt.totalAmount),  // 可选：覆盖价格
      payMethod,                                   // WALLET_ONLY / WALLET_COMBINE / WECHAT / ALIPAY
      clientType,                                  // mp-weixin / app / h5 / pc
      channel,                                     // WECHAT / ALIPAY / null
      scene: sceneEnum,                            // WECHAT_* 或 ALIPAY_*
      openId: opt.userOpenId || null,             // JSAPI/小程序需传
      idempotentKey: opt.idempotentKey,           // 幂等键（建议订单号）
      asSubscription: !!opt.asSubscription
    }

    // 注意：你的 request 已带 '/api' 前缀，这里保持相对路径
    const resp = await post('/user/packages/purchase/init', body, true)
    const vo = (resp && resp.data) || {}
    const prepay = vo.prepayParams || {}
    const paid = vo.payStatus === 'SUCCESS' || vo.payStatus === 'PAID'

    return {
      success: resp?.success !== false,
      data: {
        paid,
        txnId: vo.txnId || null,
        orderNo: vo.txnId || vo.bizOrderNum || null,
        bizOrderNum: vo.bizOrderNum || null,
        channel,
        // WeChat：JSAPI/APP 直接拉起；H5 返回 { mwebUrl }；Native 返回 { codeUrl }
        wechatParams: channel === 'WECHAT' ? prepay : null,
        // Alipay：APP(orderStr) / WAP(payUrl) / PC(formHtml)
        alipayParams: channel === 'ALIPAY' ? normalizeAlipay(prepay) : null,
        // 便于外层 H5/PC 统一处理
        h5Url: prepay.mwebUrl || prepay.payUrl || null,
        codeUrl: prepay.codeUrl || null,
        formHtml: prepay.formHtml || null
      }
    }
  }

  // =================== 其它场景（暂沿用同一接口；待切换 /pay/init） ===================
  const body = {
    userId: numOrUndef(opt.userId),
    bizType: opt.bizType,
    bizOrderNum: opt.bizOrderNum,
    totalAmount: Number(opt.totalAmount || 0),
    payMethod: opt.payMethod,   // 与后端枚举一致
    clientType,
    channel,
    scene: sceneEnum,
    userOpenId: opt.userOpenId || null,
    walletUse: opt.walletUse != null ? Number(opt.walletUse) : undefined
  }

  const resp = await post('/user/packages/purchase/init', body, true)
  const vo = (resp && resp.data) || {}
  const prepay = vo.prepayParams || {}
  const paid = vo.payStatus === 'SUCCESS' || vo.payStatus === 'PAID'

  return {
    success: resp?.success !== false,
    data: {
      paid,
      txnId: vo.txnId || null,
      orderNo: vo.txnId || vo.bizOrderNum || null,
      bizOrderNum: vo.bizOrderNum || null,
      channel,
      wechatParams: channel === 'WECHAT' ? prepay : null,
      alipayParams: channel === 'ALIPAY' ? normalizeAlipay(prepay) : null,
      h5Url: prepay.mwebUrl || prepay.payUrl || null,
      codeUrl: prepay.codeUrl || null,
      formHtml: prepay.formHtml || null
    }
  }
}

/* ----------------- Helpers ----------------- */

// 适配 uni.requestPayment（Alipay）与 H5/PC
function normalizeAlipay (prepayParams = {}) {
  // APP：{ orderStr }；WAP：{ payUrl }；PC：{ formHtml }
  if (prepayParams.orderStr) return { orderInfo: prepayParams.orderStr }
  if (prepayParams.payUrl)   return { payUrl: prepayParams.payUrl }
  if (prepayParams.formHtml) return { formHtml: prepayParams.formHtml }
  return null
}

// 解析 'p12' => 12；或普通 '12' => 12；否则 undefined
function unwrapPkgId (x) {
  if (x == null) return undefined
  const s = String(x)
  if (/^p\d+$/i.test(s)) return Number(s.replace(/^p/i, ''))
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

function numOrUndef (v) {
  return v == null ? undefined : Number(v)
}

// 根据 payMethod / 已传 channel / clientType 推断渠道
function resolveChannel (payMethod, given, clientType = '') {
  if (given) return given
  if (payMethod === 'WECHAT') return 'WECHAT'
  if (payMethod === 'ALIPAY') return 'ALIPAY'
  if (payMethod === 'WALLET_COMBINE') {
    // 组合支付未指定渠道：按平台偏好
    const ct = (clientType || '').toLowerCase()
    if (ct.includes('mp') || ct.includes('weixin') || ct.includes('h5') || ct.includes('app')) return 'WECHAT'
    if (ct.includes('pc')) return 'ALIPAY'
    return 'WECHAT'
  }
  return null
}

// 推断客户端类型：mp-weixin / app / h5 / pc
function guessClientType () {
  const up = (uni.getSystemInfoSync?.().uniPlatform || '').toLowerCase()
  if (up.includes('mp'))  return 'mp-weixin'
  if (up.includes('app')) return 'app'
  if (up.includes('h5'))  return 'h5'
  if (up.includes('pc'))  return 'pc'
  return 'h5'
}

// 推断场景（与渠道配合）
function guessScene (channel) {
  const up = (uni.getSystemInfoSync?.().uniPlatform || '').toLowerCase()
  if (channel === 'WECHAT') {
    if (up.includes('mp'))  return 'WECHAT_JSAPI'
    if (up.includes('app')) return 'WECHAT_APP'
    if (up.includes('h5'))  return 'WECHAT_H5'
    return 'WECHAT_NATIVE'
  }
  if (channel === 'ALIPAY') {
    if (up.includes('app')) return 'ALIPAY_APP'
    if (up.includes('pc'))  return 'ALIPAY_PC'
    return 'ALIPAY_WAP'
  }
  return null
}
