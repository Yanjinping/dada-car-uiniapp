// src/api/balance.js
import { get, post } from './request'


// ---- 幂等 refNo 工具 ----
const REF_KEY = 'pendingRechargeRefNo'

function genRefNo(prefix = 'RC') {
  const ts = Date.now()
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${ts}${rnd}`
}

function getOrCreateRefNo() {
  let refNo = uni.getStorageSync(REF_KEY)
  if (!refNo) {
    refNo = genRefNo()
    uni.setStorageSync(REF_KEY, refNo)
  }
  return refNo
}

// ========== 余额相关 ==========
function clearRefNo() {
  uni.removeStorageSync(REF_KEY)
}



// 获取指定账户类型余额（如：accountBalance / reward / deposit）
export function getBalance(params) {
  return get('/wallet/balance', params, true)
}

// 获取用户所有账户余额（返回一个 map）
export function getAllBalances(params) {
  return get('/wallet/all', params, true)
}

// 获取指定 moneyType 的余额（带 userId，默认 accountBalance）
export const getWalletBalance = async (moneyType = 'accountBalance') => {
  try {
    const userId = uni.getStorageSync('userId')
    return await get('/wallet/balance', { userId, moneyType }, true)
  } catch (e) {
    console.warn('getWalletBalance error:', e)
    return { data: { data: 0 } } // 兜底返回结构
  }
}

// ========== 充值与扣款 ==========

// 充值账户（JSON 版，对齐 /wallet/recharge）
export async function recharge({ amount, moneyType = 'accountBalance', memo = '' }) {
  // BigDecimal 建议用字符串
  const refNo = getOrCreateRefNo()

  try {
    const res = await post(
      '/wallet/recharge',
      { amount: String(amount), moneyType, refNo, memo },
      true, // needAuth：带上 token
      // 你的 post 封装里默认 Content-Type 已是 application/json，无需额外 headers
    )
    // 后端 Result.success=true → 充值成功
    clearRefNo()
    return res
  } catch (e) {
    // 若服务端做了“重复提交或已受理”提示，这里当作成功处理（幂等）
    const msg = e?.message || ''
    if (msg.includes('重复提交') || msg.includes('已受理')) {
      clearRefNo()
      return { success: true, message: '已受理（幂等）' }
    }
    // 其他错误保留 refNo，便于重试仍然使用同一单号
    throw e
  }
}



// 账户扣款
export function deduct(params) {
  return post('/wallet/deduct', params, true)
}

// ========== 提现相关 ==========

// 申请提现
export function applyWithdraw(params) {
  return post('/wallet/withdraw', params, true)
}

// ========== 交易记录相关 ==========

// 获取交易记录（支持分页 / 账户类型筛选）
export function getTransactionRecords(params) {
  return get('/wallet/records', params, true)
}

// ✅ 别名（保持结构完整）
export const getAccountTransactionRecords = getTransactionRecords
