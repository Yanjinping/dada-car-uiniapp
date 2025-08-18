import request from './request'

// 登录接口（传入 wx.login 的 code）
export const loginByWeixin = (code) => {
  return request.post('/api/user/login-by-weixin', { code })
}
