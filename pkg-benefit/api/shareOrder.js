import { get, post } from './request'

/** 提交晒单 */
export function apiShareSubmit(data) {
  // data: { userId, orderNum, content, ridePhotos, shareProof }
  return post('/user/share/submit', data, true)
}

/** 我的晒单记录 */
export function apiShareRecords(params) {
  // params: { userId, status?, page?, size? }
  return get('/user/share/records', params, true)
}

/** 晒单详情 */
export function apiShareDetail(id) {
  return get(`/user/share/${id}`, {}, true)
}

// 统计（已发放/待发放、各状态数量）
export function apiShareStats() {
  return get('/user/share/stats', {}, true)
}
