// ========= 基础工具 =========
import { getBaseUrl } from '@/utils/baseUrl'
import { getPlatform } from '@/utils/platform.js'

// 懒获取 BASE：每次请求时再取，避免 App.onLaunch 先后顺序导致拿不到
function getBASE() {
  const b = (getBaseUrl() || '').replace(/\/$/, '')
  console.log('🌐 当前 BASE =', b)
  return b
}

// ========= 全局 Loading（并发安全）=========
let __loadingCount = 0
function startLoading(title = '加载中...') {
  if (__loadingCount === 0) {
    try { uni.showLoading({ title, mask: true }) } catch (_) {}
  }
  __loadingCount++
}
function endLoading() {
  __loadingCount = Math.max(0, __loadingCount - 1)
  if (__loadingCount === 0) {
    try { uni.hideLoading({}) } catch (_) {}
  }
}

// ========= 通用方法 =========
function buildQuery(params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(',') : v
      return `${encodeURIComponent(k)}=${encodeURIComponent(val)}`
    })
    .join('&')
  return qs ? `?${qs}` : ''
}

function normErrorMessage(err, fallback = '网络请求失败') {
  if (!err) return fallback
  if (typeof err === 'string') return err
  if (err?.errMsg) return err.errMsg
  if (err?.message) return err.message
  return fallback
}

/**
 * 通用请求函数
 * @param {Object} opt
 * @param {string} opt.url
 * @param {'GET'|'POST'|'PUT'|'DELETE'} [opt.method='GET']
 * @param {Object} [opt.data]
 * @param {boolean} [opt.needAuth=false]
 * @param {number} [opt.timeout=10000]
 * @param {boolean} [opt.showLoading=true]  是否展示 Loading
 * @param {boolean} [opt.toastOnError=true] 请求失败是否 toast
 * @param {string}  [opt.loadingText='加载中...']
 */
function request({
  url,
  method = 'GET',
  data,
  needAuth = false,
  timeout = 10000,
  showLoading: showLoadingOpt = true,
  toastOnError = true,
  loadingText = '加载中...'
}) {
  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' }
    if (needAuth) {
      const token = uni.getStorageSync('token')
      if (token) header.Authorization = `Bearer ${token}`
    }

    const BASE = getBASE()
    const finalUrl = `${BASE}${url}`
    const upperMethod = (method || 'GET').toUpperCase()

    if (showLoadingOpt) startLoading(loadingText)

    uni.request({
      url: finalUrl,
      method: upperMethod,
      header,
      data,
      timeout,
      success: res => {
        console.log(`✅ [${upperMethod} ${finalUrl}]`, res.statusCode, res.data)
        const ok = res.statusCode >= 200 && res.statusCode < 300
        if (!ok) {
          const msg = res?.data?.message || res?.data?.msg || `HTTP ${res.statusCode}`
          toastOnError && uni.showToast({ title: msg, icon: 'none' })
          return reject(new Error(msg))
        }
        if (res?.data?.success === true || Number(res?.data?.code) === 0) {
          resolve(res.data)
        } else {
          const msg = res?.data?.message || res?.data?.msg || '业务逻辑错误'
          toastOnError && uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: err => {
        console.error(`❌ [${upperMethod} ${finalUrl}]`, err)
        const msg = normErrorMessage(err, '网络请求失败')
        toastOnError && uni.showToast({ title: msg, icon: 'none' })
        reject(new Error(msg))
      },
      complete: () => {
        if (showLoadingOpt) endLoading()
      }
    })
  })
}

// ========= 语义化方法 =========
function get(url, params = {}, needAuth = false, opt = {}) {
  const fullUrl = `${url}${buildQuery(params)}`
  return request({ url: fullUrl, method: 'GET', needAuth, ...opt })
}
function post(url, data = {}, needAuth = false, opt = {}) {
  return request({ url, method: 'POST', data, needAuth, ...opt })
}
function put(url, data = {}, needAuth = false, opt = {}) {
  return request({ url, method: 'PUT', data, needAuth, ...opt })
}
function del(url, data = {}, needAuth = false, opt = {}) {
  return request({ url, method: 'DELETE', data, needAuth, ...opt })
}

// -------- 表单 POST（给 @RequestParam 的接口用） --------
function postForm(url, data = {}, needAuth = false, timeout = 10000, {
  showLoading: showLoadingOpt = true,
  toastOnError = true,
  loadingText = '提交中...'
} = {}) {
  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/x-www-form-urlencoded' }
    if (needAuth) {
      const token = uni.getStorageSync('token')
      if (token) header.Authorization = `Bearer ${token}`
    }
    const body = Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => {
        const val = Array.isArray(v) ? v.join(',') : v
        return `${encodeURIComponent(k)}=${encodeURIComponent(val)}`
      })
      .join('&')

    const BASE = getBASE()
    const finalUrl = `${BASE}${url}`

    if (showLoadingOpt) startLoading(loadingText)

    uni.request({
      url: finalUrl,
      method: 'POST',
      header,
      data: body,
      timeout,
      success: res => {
        console.log(`✅ [POST-FORM ${finalUrl}]`, res.statusCode, res.data)
        const ok = res.statusCode >= 200 && res.statusCode < 300
        if (!ok) {
          const msg = res?.data?.message || res?.data?.msg || `HTTP ${res.statusCode}`
          toastOnError && uni.showToast({ title: msg, icon: 'none' })
          return reject(new Error(msg))
        }
        if (res?.data?.success === true || Number(res?.data?.code) === 0) resolve(res.data)
        else {
          const msg = res?.data?.message || res?.data?.msg || '业务逻辑错误'
          toastOnError && uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: err => {
        console.error(`❌ [POST-FORM ${finalUrl}]`, err)
        const msg = normErrorMessage(err, '网络请求失败')
        toastOnError && uni.showToast({ title: msg, icon: 'none' })
        reject(new Error(msg))
      },
      complete: () => {
        if (showLoadingOpt) endLoading()
      }
    })
  })
}

// ========= 文件上传 =========
function upload(url, { filePath, name = 'file', formData = {}, needAuth = true }, {
  showLoading: showLoadingOpt = true,
  toastOnError = true,
  loadingText = '上传中...'
} = {}) {
  return new Promise((resolve, reject) => {
    const header = {}
    if (needAuth) {
      const token = uni.getStorageSync('token')
      if (token) header.Authorization = `Bearer ${token}`
    }

    const BASE = getBASE()
    const finalUrl = `${BASE}${url}`

    if (showLoadingOpt) startLoading(loadingText)

    uni.uploadFile({
      url: finalUrl,
      filePath,
      name,
      formData,
      header,
      success: res => {
        try {
          const result = JSON.parse(res.data || '{}')
          if (result?.success === true || Number(result?.code) === 0) {
            resolve(result)
          } else {
            const msg = result?.message || result?.msg || '上传业务失败'
            toastOnError && uni.showToast({ title: msg, icon: 'none' })
            reject(new Error(msg))
          }
        } catch (e) {
          const msg = '返回数据解析失败'
          toastOnError && uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: err => {
        console.error(`❌ [UPLOAD ${finalUrl}]`, err)
        const msg = normErrorMessage(err, '上传失败')
        toastOnError && uni.showToast({ title: msg, icon: 'none' })
        reject(new Error(msg))
      },
      complete: () => {
        if (showLoadingOpt) endLoading()
      }
    })
  })
}

// ========= 通用 smartUpload：兼容 Web + 小程序 + App =========
function smartUpload(url, { filePath = '', name = 'file', formData = {}, needAuth = true }, {
  showLoading: showLoadingOpt = true,
  toastOnError = true,
  loadingText = '上传中...'
} = {}) {
  const platform = getPlatform()

  // 修正：H5 平台标识为 'h5'，不是 'web'
  if (platform === 'h5') {
    return new Promise((resolve, reject) => {
      console.log('📷 H5端触发上传 input')
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async e => {
        const file = e.target.files?.[0]
        if (!file) {
          const msg = '未选择文件'
          toastOnError && uni.showToast({ title: msg, icon: 'none' })
          return reject(new Error(msg))
        }

        const token = uni.getStorageSync('token') || ''
        const body = new FormData()
        body.append(name, file)
        for (const key in formData) body.append(key, formData[key])
        body.append('platform', platform)

        try {
          if (showLoadingOpt) startLoading(loadingText)
          const BASE = getBASE()
          const finalUrl = `${BASE}${url}`

          const res = await fetch(finalUrl, {
            method: 'POST',
            headers: needAuth ? { Authorization: `Bearer ${token}` } : undefined,
            body
          })
          const result = await res.json()
          console.log('📦 上传响应:', result)

          if (result?.success === true || Number(result?.code) === 0) resolve(result)
          else {
            const msg = result?.message || result?.msg || '上传失败'
            toastOnError && uni.showToast({ title: msg, icon: 'none' })
            reject(new Error(msg))
          }
        } catch (err) {
          console.error('❌ 上传异常:', err)
          const msg = normErrorMessage(err, '上传失败')
          toastOnError && uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        } finally {
          if (showLoadingOpt) endLoading()
        }
      }

      input.click()
    })
  }

  // 小程序 & App
  return upload(
    url,
    {
      filePath,
      name,
      formData: { ...formData, platform },
      needAuth
    },
    { showLoading: showLoadingOpt, toastOnError, loadingText }
  )
}

export { get, post, put, del, upload, smartUpload, postForm, getPlatform }
