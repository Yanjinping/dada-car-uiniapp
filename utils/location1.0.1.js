// utils/location.js
// 安全定位（H5/小程序/App-Plus 通用），失败时返回 null，不阻塞业务
export async function safeGetLocation() {
  const askOpenSetting = () =>
    new Promise((resolve) => {
      uni.showModal({
        title: '需要定位权限',
        content: '开启定位后可按距离排序和导航到网点',
        confirmText: '去开启',
        cancelText: '暂不',
        success(res) {
          if (res.confirm) {
            // #ifdef MP-WEIXIN
            uni.openSetting({
              success: () => resolve(true),
              fail: () => resolve(false)
            })
            // #endif

            // #ifdef APP-PLUS
            try { plus.runtime.openSystemSettings(); } catch (e) {}
            resolve(true)
            // #endif

            // #ifdef H5
            uni.showToast({ icon: 'none', title: '请在浏览器地址栏权限里允许定位' })
            resolve(false)
            // #endif
          } else {
            resolve(false)
          }
        }
      })
    })

  try {
    // #ifdef MP-WEIXIN
    const setting = await new Promise((resolve) => {
      uni.getSetting({ success: resolve, fail: resolve })
    })
    const scopeLoc = setting && setting.authSetting && setting.authSetting['scope.userLocation']
    if (scopeLoc === false) {
      const go = await askOpenSetting()
      if (!go) return null
    } else if (scopeLoc !== true) {
      const ok = await new Promise((resolve) => {
        uni.authorize({
          scope: 'scope.userLocation',
          success: () => resolve(true),
          fail: () => resolve(false)
        })
      })
      if (!ok) {
        const go = await askOpenSetting()
        if (!go) return null
      }
    }
    // #endif

    // #ifdef APP-PLUS
    try {
      const info = uni.getSystemInfoSync() || {}
      if (info.platform === 'android' && typeof plus !== 'undefined' && plus.android) {
        await new Promise((resolve) => {
          plus.android.requestPermissions(
            ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_COARSE_LOCATION'],
            () => resolve(),
            () => resolve()
          )
        })
      }
    } catch (e) {}
    // #endif

    // 真正取定位
    const pos = await new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success(res) { resolve({ lng: res.longitude, lat: res.latitude }) },
        fail(err) { reject(err) }
      })
    })
    return pos
  } catch (err) {
    const msg = String((err && err.errMsg) || err || '')
    if (
      msg.includes('deny') || msg.includes('denied') ||
      msg.includes('permission') || msg.includes('auth')
    ) {
      const go = await askOpenSetting()
      if (go) {
        try {
          const pos = await new Promise((resolve, reject) => {
            uni.getLocation({
              type: 'gcj02',
              success(res) { resolve({ lng: res.longitude, lat: res.latitude }) },
              fail(e) { reject(e) }
            })
          })
          return pos
        } catch (e2) {}
      }
      return null
    }
    if (msg.includes('secure origin') || msg.includes('Only secure origins')) {
      uni.showToast({ icon: 'none', title: '请使用 HTTPS 访问以获取定位' })
      return null
    }
    uni.showToast({ icon: 'none', title: '定位失败，已使用无定位模式' })
    return null
  }
}

export function formatDistance(m) {
  if (typeof m !== 'number' || isNaN(m)) return ''
  return m < 1000 ? Math.round(m) + 'm' : (m / 1000).toFixed(1) + 'km'
}
