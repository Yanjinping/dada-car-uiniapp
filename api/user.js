import { get, post,upload ,smartUpload} from './request';  // 引入通用的请求方法

// 普通登录（用户名、密码）
export function login(data) {
  return post('/user/login', data);
}

// 微信登录
export function wxLogin(code) {
  return get(`/user/login/wechat/callback?code=${code}`);
}

//微信授权登录
export function wxLoginWithInfo(data) {
  return post('/user/login/wechat/info', data)
}
//微信手机号授权登录
export function wxPhoneLogin(data) {
  return post('/user/login/wechat/phone', data);
}

// 支付宝登录
export function aliLogin(authCode) {
  return get(`/user/login/alipay/callback?authCode=${authCode}`);
}

// 短信登录
export function smsLogin(data) {
  return post('/user/sms/login', data);
}

// 获取验证码
export function sendSmsCode(phone) {
  return post(`/user/sms/send?phone=${phone}`);
}

// // 用户认证状态
// export function getAuthStatus() {
//   return get('/user/auth/status', {}, true); // 需要鉴权
// }

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

