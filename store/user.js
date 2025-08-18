import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || {}
  }),
  actions: {
    setToken(token) {
      this.token = token
      uni.setStorageSync('token', token)
    },
    setUserInfo(user) {
      this.userInfo = user
      uni.setStorageSync('userInfo', user)
    },
    login(token, user) {
      this.setToken(token)
      this.setUserInfo(user)
    },
    logout() {
      this.token = ''
      this.userInfo = {}
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    }
  }
})
