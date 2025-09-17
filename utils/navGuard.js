// /utils/navGuard.js
let __navBusy = false
let __navTimer = null

export function safeNavigateTo(url, opts = {}) {
  if (__navBusy) return Promise.resolve(false)
  __navBusy = true

  return new Promise((resolve) => {
    uni.navigateTo({
      url,
      ...opts,
      complete() {
        // 给系统动画留时间，避免紧接着的再次跳转被判定为并发
        clearTimeout(__navTimer)
        __navTimer = setTimeout(() => { __navBusy = false }, 350)
        resolve(true)
      }
    })
  })
}

export function safeRedirectTo(url, opts = {}) {
  if (__navBusy) return Promise.resolve(false)
  __navBusy = true
  return new Promise((resolve) => {
    uni.redirectTo({
      url,
      ...opts,
      complete() {
        clearTimeout(__navTimer)
        __navTimer = setTimeout(() => { __navBusy = false }, 350)
        resolve(true)
      }
    })
  })
}

export function isNavBusy() { return __navBusy }
