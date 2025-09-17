import http from '@/api'

const TOKEN_KEY = 'DADA_TOKEN'

export default {
  async login(phone, password) {
    const res = await http.post('/api/user/login', { phone, password })
    const token = res.token
    uni.setStorageSync(TOKEN_KEY, token)
    return token
  },
  // 微信小程序登录
  async wxLogin() {
    // #ifdef MP-WEIXIN
    const { code } = await new Promise((resolve, reject) => {
      uni.login({ success: resolve, fail: reject })
    })
    const res = await http.post('/api/user/app-login', { token: code })
    uni.setStorageSync(TOKEN_KEY, res.token)
    return res.token
    // #endif
  },
  // 支付宝小程序登录
  async alipayLogin() {
    // #ifdef MP-ALIPAY
    const authCode = await new Promise((resolve, reject) => {
      my.getAuthCode({
        scopes: 'auth_user',
        success: res => resolve(res.authCode),
        fail: err => reject(err)
      })
    })
    const res = await http.post('/api/user/app-login', { token: authCode })
    uni.setStorageSync(TOKEN_KEY, res.token)
    return res.token
    // #endif
  },
  // App 一键登录
  async appLogin() {
    // #ifdef APP-PLUS
    // 调用原生插件获取一键登录 token，例如极光或友盟插件
    const token = await uni.getSystemInfoSync() /* 示例：此处替换为真正插件方法 */
    const res = await http.post('/api/user/app-login', { token })
    uni.setStorageSync(TOKEN_KEY, res.token)
    return res.token
    // #endif
  },
  getToken() {
    return uni.getStorageSync(TOKEN_KEY)
  },
  logout() {
    uni.removeStorageSync(TOKEN_KEY)
  }
}