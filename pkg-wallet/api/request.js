import { getBaseUrl } from '@/utils/baseUrl'
const BASE = getBaseUrl()

function getPlatform() {
  const info = uni.getSystemInfoSync?.() || {}
  const up = (info.uniPlatform || '').toLowerCase()
  const rp = (info.platform || '').toLowerCase()
  if (up === 'mp-weixin') return 'mp-weixin'
  if (up === 'mp-alipay') return 'mp-alipay'
  if (up === 'app' || up === 'app-plus') return (rp === 'ios' ? 'app-ios' : rp === 'android' ? 'app-android' : 'app')
  return 'h5'
}
/**
 * 通用请求函数
 */
function request({ url, method = 'GET', data, needAuth = false, timeout = 10000 }) {
  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' };

    if (needAuth) {
      const token = uni.getStorageSync('token');
      if (token) header.Authorization = `Bearer ${token}`;
    }

    uni.request({
      url: `${BASE}${url}`,
      method,
      header,
      data,
      timeout,
      success: res => {
        console.log(`✅ [${method} ${url}]`, res.statusCode, res.data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.success) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '业务逻辑错误'));
          }
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: err => {
        console.error(`❌ [${method} ${url}] 请求失败`, err);
        reject(new Error(err.message || '网络请求失败'));
      }
    });
  });
}

// GET 请求
function get(url, params = {}, needAuth = false) {
   const fullUrl = `${url}${buildQuery(params)}`
   return request({ url: fullUrl, method: 'GET', needAuth })
}

// POST 请求
function post(url, data = {}, needAuth = false) {
  return request({ url, method: 'POST', data, needAuth });
}

// PUT 请求
function put(url, data = {}, needAuth = false) {
  return request({ url, method: 'PUT', data, needAuth });
}

// DELETE 请求
function del(url, data = {}, needAuth = false) {
  return request({ url, method: 'DELETE', data, needAuth });
}

// -------- 新增：表单POST（给 @RequestParam 的接口用） --------
function postForm(url, data = {}, needAuth = false, timeout = 10000) {
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

    uni.request({
      url: `${BASE}${url}`,
      method: 'POST',
      header,
      data: body,
      timeout,
      success: res => {
        console.log(`✅ [POST-FORM ${url}]`, res.statusCode, res.data)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.success) resolve(res.data)
          else reject(new Error(res.data.message || '业务逻辑错误'))
        } else {
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail: err => {
        console.error(`❌ [POST-FORM ${url}] 请求失败`, err)
        reject(new Error(err.message || '网络请求失败'))
      }
    })
  })
}

//构建 query，自动过滤空值/数组转 a,b --------
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

// 文件上传（适配 OCR / 人脸识别）
function upload(url, { filePath, name = 'file', formData = {}, needAuth = true }) {
  return new Promise((resolve, reject) => {
    const header = {};
    if (needAuth) {
      const token = uni.getStorageSync('token');
      if (token) header.Authorization = `Bearer ${token}`;
    }

    uni.uploadFile({
      url: `${BASE}${url}`,
      filePath,
      name,
      formData,
      header,
      success: res => {
        try {
          const result = JSON.parse(res.data);
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.message || '上传业务失败'));
          }
        } catch (e) {
          reject(new Error('返回数据解析失败'));
        }
      },
      fail: err => {
        console.error(`❌ [UPLOAD ${url}]`, err);
        reject(new Error(err.message || '上传失败'));
      }
    });
  });
}

// 通用 smartUpload：兼容 Web + 小程序 + App
function smartUpload(url, { filePath = '', name = 'file', formData = {}, needAuth = true }) {
  const platform = getPlatform()

  if (platform === 'web') {
    return new Promise((resolve, reject) => {
      console.log('📷 Web端触发上传 input')

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async e => {
        const file = e.target.files?.[0]
        if (!file) {
          console.error('❌ 没选文件')
          return reject(new Error('未选择文件'))
        }

        const token = uni.getStorageSync('token') || ''
		console.log('📦 当前 token:', token)
        const body = new FormData()

        // 核心：file 字段必须叫 "file"，和 Controller 对应
        body.append(name, file)

        // 附加参数
        for (const key in formData) {
          console.log(`🧾 附加字段: ${key} = ${formData[key]}`)
          body.append(key, formData[key])
        }
        body.append('platform', platform)

        try {
          const res = await fetch(`${BASE}${url}`, {
            method: 'POST',
            headers: needAuth
              ? {
                  Authorization: `Bearer ${token}`
                  // ✅ 千万不要加 Content-Type，会破坏 multipart boundary！
                }
              : undefined,
            body
          })
          const result = await res.json()
          console.log('📦 上传响应:', result)

          if (result.success) resolve(result)
          else reject(new Error(result.message || '上传失败'))
        } catch (err) {
          console.error('❌ 上传异常:', err)
          reject(err)
        }
      }

      input.click()
    })
  }

  // ✅ 小程序 & App 走 uni.uploadFile
  return upload(url, {
    filePath,
    name,
    formData: {
      ...formData,
      platform
    },
    needAuth
  })

  
  // // 获取平台（兼容多端）
  // function getPlatform() {
  //   const info = uni.getSystemInfoSync()
  //   if (info.platform === 'android' || info.platform === 'ios') return 'app'
  //   if (info.uniPlatform === 'mp-weixin') return 'mp-weixin'
  //   if (info.uniPlatform === 'mp-alipay') return 'mp-alipay'
  //   return 'web'
  // }
  
}

export { get, post, put, del, upload, smartUpload, postForm }
