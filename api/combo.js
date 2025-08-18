// src/api/userCombo.js
import { get, post, put } from './request';  // 引入通用的请求方法

// 创建用户套餐
export function createUserCombo(data) {
  return post('/user/combos/create', data);
}

// 获取用户的所有套餐
export function getUserCombos(userId) {
  return get(`/user/combos/${userId}`);
}

// 更新用户套餐状态
export function updateUserComboStatus(userComboId, status) {
  return put(`/user/combos/${userComboId}/status`, { status });
}

// 获取特定活动下的所有套餐
export function getCombosByCampaignId(campaignId) {
  return get(`/user/combos/campaign/${campaignId}`);
}

// 获取用户的续订套餐
export function getRenewedCombos(userId) {
  return get(`/user/combos/renewed/${userId}`);
}

// 获取当前可购买/推荐的套餐（新接口）
export function getAvailableCombos(params = {}) {
  // params: { userId, carType='all', tags='', region='' }
  return get('/user/packages/candidates', params, true)
}

// 购买（建议在支付成功回调里调用；idempotentKey=orderNum）
export function purchasePackage({ userId, packageId, price, idempotentKey, asSubscription = false }) {
  return postForm('/user/packages/purchase',
    { userId, packageId, price, idempotentKey, asSubscription },
    true
  )
}

// 续订
export function renewUserPackage(userPackageId, { price, idempotentKey } = {}) {
  return postForm(`/user/packages/${userPackageId}/renew`, { price, idempotentKey }, true)
}

// 激活
export function activateUserPackage(userPackageId) {
  return postForm(`/user/packages/${userPackageId}/activate`, {}, true)
}

// 扣减（订单结算时调用）
export function consumeUserPackage(userPackageId, { usedHours, usedMileage } = {}) {
  return postForm(`/user/packages/${userPackageId}/consume`, { usedHours, usedMileage }, true)
}

// 赠送 / 接受赠送
export function giftUserPackage(userPackageId, toUserId) {
  return postForm(`/user/packages/${userPackageId}/gift`, { toUserId }, true)
}
export function acceptGift(userPackageId, toUserId) {
  return postForm(`/user/packages/${userPackageId}/accept-gift`, { toUserId }, true)
}


