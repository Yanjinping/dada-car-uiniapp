import { get, post} from './request';  // 引入通用的请求方法



// 车辆列表
// params: { netId, sortBy='score'|'range'|'type', order='asc'|'desc' }
export function getCarList(params = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return get(`/car/list${query ? `?${query}` : ''}`)
}


// 还车网点：列表
export function getFindCarList(params) {
  // params: { lng, lat, kw, page=0, size=20 }
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return get(`/net/return/list?${query}`);
}
