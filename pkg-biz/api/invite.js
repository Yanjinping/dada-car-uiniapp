// 📁 /src/api/invite.js
// 说明：本模块只返回后端 Result.data，已在此处解包；失败已由 request 统一处理 toast。
import { get, postForm } from './request'   // 注意：bind 接口是 @RequestParam，用 postForm

/** 奖励汇总（可提现金额、有效邀请人数、进度提示、邀请链接） */
export function getInviteSummary() {
  // GET /api/invite/reward/summary   @CurrentUser 注入，无需传 userId
  return get('/api/invite/reward/summary', {}, true).then(r => r.data)
}

/** 邀请记录列表 */
export function getInviteRecords() {
  // GET /api/invite/reward/records
  return get('/api/invite/reward/records', {}, true).then(r => r.data)
}

/** 海报二维码（图片地址或 base64） */
export function getInvitePoster() {
  // GET /api/invite/reward/poster
  return get('/api/invite/reward/poster', {}, true).then(r => r.data)
}

/** 获取当前用户的邀请链接 */
export function getInviteLink() {
  // GET /api/invite/link
  return get('/api/invite/link', {}, true).then(r => r.data)
}

/** 绑定邀请码（注册后或“我的-绑定邀请人”） */
export function bindInvite(inviteCode) {
  // POST /api/user/invite/bind （后端是 @RequestParam String inviteCode）
  // 用表单方式提交；如果你后端改成 @RequestBody，再切换成 post('/api/user/invite/bind', { inviteCode }, true)
  return postForm('/api/user/invite/bind', { inviteCode }, true).then(r => r.data)
}

/** 我的邀请好友列表（后端返回 InviteFriendDTO[]） */
export function getMyInviteList() {
  // GET /api/user/invite/list
  return get('/api/user/invite/list', {}, true).then(r => r.data)
}
