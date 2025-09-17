// src/api/balance.js
import { get, post } from './request'

// ========== 余额相关 ==========

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

// 充值账户（Spring 的 @RequestParam 方式）
export function recharge({ userId, amount, moneyType }) {
  const query = new URLSearchParams()
  query.append('userId', userId)
  query.append('amount', amount)
  if (moneyType) query.append('moneyType', moneyType)

  return post(`/wallet/recharge?${query.toString()}`, {}, true)
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
