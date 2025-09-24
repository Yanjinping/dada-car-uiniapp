// src/api/invite.js
import { get } from './request'   // 用你贴的通用 request（下文示例名为 utils/request）

/** 汇总：金额/人数/进度/邀请链接 */
export function apiInviteSummary() {
  return get('/invite/reward/summary', {}, /* needAuth */ true)
}

/** 记录列表 */
export function apiInviteRecords() {
  return get('/invite/reward/records', {}, true)
}

/** 海报二维码（返回落地链接或二维码图片 URL） */
export function apiInviteQrcode(landingBase = 'https://h5.dada.com/invite') {
  return get('/invite/qrcode', { landingBase }, true)
}
