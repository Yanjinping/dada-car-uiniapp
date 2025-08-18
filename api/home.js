// src/api/user.js
import { get, post } from './request';  // 引入通用的请求方法


// 获取主页数据
export function getHomePage(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return get(`/home/homepage?${query}`);
}

// 推荐车辆查询（兼容小程序）
export function getRecommendedCars(params) {
  const queryParams = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  console.log('🚘 发送的请求 URL:', `/home/recommended-net-cars?${queryParams}`);
  return get(`/home/recommended-net-cars?${queryParams}`);
}

// 查询附近网点
export function getNearbyNets(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return get(`/home/nearby-nets?${query}`);
}