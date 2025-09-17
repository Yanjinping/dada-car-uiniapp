import { get, post} from './request';  // 引入通用的请求方法


// 列表
export function getNetList(params) {
  const entries = Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  const query = entries
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&')
  return get('/net/list' + (query ? '?' + query : ''))
}

// 列表
export function getReturnNetList(params) {
  // params: { lng, lat, kw, page=0, size=20 }
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return get(`/net/list?${query}`);
}

// 还车网点：选择（可选，用于把选择结果暂存到订单）
export function chooseReturnNet(orderNum, netId) {
  return post('/net/return/choose', { orderNum, netId });
}

// 还车网点：最终校验（可选，提交前校验空位等）
export function validateReturnNet(netId) {
  return get(`/net/return/validate?netId=${encodeURIComponent(netId)}`);
}
