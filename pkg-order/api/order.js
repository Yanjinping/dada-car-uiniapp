// src/api/order.js
import { get, post } from './request';  // 引入通用的请求方法

// 创建用车订单
export function createOrder(data) {
  return post('/order/create', data, true);
}

//获得订单详情
export function getOrderDetail(orderNum) {
  return get(`/order/detail/${orderNum}`, {}, true)
}

// 取消订单
export function cancelOrder(data) {
  return post('/order/cancel', data, true);
}

// 获取订单费用详情
export function getOrderFee(params) {
  return get('/order/fee-detail', params, true);
}

// 获取用车确认页预加载数据
export function preloadCarInfo(params) {
  return get('/order/preload/car-info', params, true);
}

// 订单结算
export function settleOrder(data) {
    return post('/order/settle', data, true);
}

// 订单支付
export function payOrder(data) {
	return post('/order/pay', data, true);

}
