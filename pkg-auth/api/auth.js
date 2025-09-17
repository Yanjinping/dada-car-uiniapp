// src/api/auth.js
import { get, post,upload ,smartUpload} from './request';  // 引入通用的请求方法

export function getPlatform() {
  const info = uni.getSystemInfoSync?.() || {}
  const up = (info.uniPlatform || '').toLowerCase()
  const rp = (info.platform || '').toLowerCase()
  if (up === 'mp-weixin') return 'mp-weixin'
  if (up === 'mp-alipay') return 'mp-alipay'
  if (up === 'app' || up === 'app-plus') return (rp === 'ios' ? 'app-ios' : rp === 'android' ? 'app-android' : 'app')
  return 'h5'
}

// 提交用户认证
export function submitAuth(data) {
  return post('/user/auth/submit', data, true); // 需要鉴权
}

// 身份证 OCR 上传识别（正反面） type = 'front' | 'back'
export function ocrIdCard(filePath, type) {
  return smartUpload('/user/auth/ocr/idcard', {
    filePath,
    formData: {
      type,
      platform: getPlatform()
    },
    name: 'file'
  })
}

// 驾驶证 OCR 上传识别
export function ocrDriving(filePath) {
  return smartUpload('/user/auth/ocr/driving', {
    filePath,
    formData: {
      platform: getPlatform()
    },
    name: 'file'
  })
}


// 人脸识别比对
export function verifyFace(filePath, idCard, name) {
  return upload('/user/auth/face/verify', {
    filePath,
    formData: {
      idCard,
      name,
      platform: getPlatform()
    },
    name: 'file'
  })
}

// 获取百度人脸认证 verify_token
export function getVerifyToken(data) {
  return post('/user/auth/getVerifyToken', data)
}

// 获取用户实名认证状态
export function getAuthStatus(userId) {
  return get(`/user/auth/status/${userId}`)

}


// 获取用户实名认证状态
export function verifyThreeElements() {
}

