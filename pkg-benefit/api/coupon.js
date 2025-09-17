// src/api/coupon.js
import { get, post } from './request';

// ====== 优惠券相关 API ======

/**
 * 1. 获取可使用的优惠券（下单预加载场景）
 * 示例参数：{ userId, carId, totalAmount }
 */
export function getUserAvailableCoupons(params = {}) {
  return get('/user/coupon/getAvailableCoupons', params); 
}

// 2. 查询我的卡券（我的卡包）
export function getMyCoupons() {
  return get('/user/coupon/my-list', {}, true); // 需要登录
}

// 3. 领取优惠券（通过 couponId）
export function receiveCouponById(couponId) {
  return post('/coupon/receive', { couponId }, true);
}

// 4. 兑换优惠券（输入兑换码）
export function redeemCoupon(code) {
  return post('/coupon/redeem', { code }, true);
}

// 5. 使用优惠券（通过 couponUserId）
export function useCoupon(couponUserId) {
  return post('/coupon/use', { couponUserId }, true);
}
// 5. 使用优惠券（通过 couponUserId）
export function getCouponById(couponUserId) {
  return post('/coupon/use', { couponUserId }, true);
}
// 5. 使用优惠券（通过 couponUserId）
export function receiveHelpCoupon(couponUserId) {
  return post('/coupon/use', { couponUserId }, true);
}
