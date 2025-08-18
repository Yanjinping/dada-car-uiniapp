const BASE = 'http://localhost:8081/api';

/**
 * 通用请求函数
 * @param {string} url
 * @param {string} method
 * @param {Object} data
 * @param {boolean} needAuth
 */
function request({ url, method = 'GET', data, needAuth = false }) {
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
      success: res => {
        console.log(`✅ [${method} ${url}] status=`, res.statusCode, 'data=', res.data);

        // 处理业务逻辑错误
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.success) {
            resolve(res.data);
          } else {
            // 业务逻辑失败，reject 错误
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



// ====== 用车相关 API ======

// 订单支付
export function payOrder(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return request({
    url: `/order/pay?${query}`,
    method: 'GET',
    needAuth: true
  });
}

// 获取用车确认页预加载数据
export function preloadCarInfo(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return request({
    url: `/order/preload/car-info?${query}`,
    method: 'GET',
    needAuth: true
  });
}

// ====== 主页与车辆查询相关 API ======

// 获取主页数据
export function getHomePage(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return request({
    url: `/home/homepage?${query}`,
    method: 'GET',
  });
}

// 推荐车辆查询
export function getRecommendedCars(params) {
  return request({
    url: `/home/recommended-net-cars`,
    method: 'GET',
    data: params,
  });
}

// 查询附近网点
export function getNearbyNets(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return request({
    url: `/home/nearby-nets?${query}`,
    method: 'GET',
  });
}

// ====== 订单相关 API ======

// 创建用车订单
export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'POST',
    data,
    needAuth: true, // 需要鉴权
  });
}

// 取消订单
export function cancelOrder(data) {
  return request({
    url: '/order/cancel',
    method: 'POST',
    data,
    needAuth: true,
  });
}

// 获取订单费用详情
export function getOrderFee(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return request({
    url: `/order/fee-detail?${query}`,
    method: 'GET',
    needAuth: true,
  });
}

// ====== 车辆控制相关 API ======

// 远程开门
export function openCar(data) {
  return request({
    url: '/operation/unlock',
    method: 'POST',
    data,
    needAuth: true,
  });
}

// 远程关门
export function closeCar(data) {
  return request({
    url: '/operation/lock',
    method: 'POST',
    data,
    needAuth: true,
  });
}

// 鸣笛
export function hornCar(data) {
  return request({
    url: '/operation/whistle',
    method: 'POST',
    data,
    needAuth: true,
  });
}

// 找车灯光/鸣笛
export function findCar(data) {
  const query = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('&');
  return request({
    url: `/operation/find?${query}`,
    method: 'GET',
    needAuth: true,
  });
}

// 还车
export function returnCar(data) {
  return request({
    url: '/order/return',
    method: 'POST',
    data,
    needAuth: true,
  });
}


// ====== 登录相关 API ======

// 普通登录（用户名、密码）
export function login(data) {
  return request({
    url: '/user/login',
    method: 'POST',
    data,
  });
}

// 微信登录
export function wxLogin(code) {
  return request({
    url: `/user/login/wechat/callback?code=${code}`,
    method: 'GET',
  });
}

// 支付宝登录
export function aliLogin(authCode) {
  return request({
    url: `/user/login/alipay/callback?authCode=${authCode}`,
    method: 'GET',
  });
}

// 短信登录
export function smsLogin(data) {
  return request({
    url: '/user/sms/login',
    method: 'POST',
    data,
  });
}

// 获取验证码
export function sendSmsCode(phone) {
  return request({
    url: `/user/sms/send?phone=${phone}`,
    method: 'POST',
  });
}

// 用户认证状态
export function getAuthStatus() {
  return request({
    url: '/user/auth/status',
    method: 'GET',
    needAuth: true, // 需要授权
  });
}

// 提交用户认证
export function submitAuth(data) {
  return request({
    url: '/user/auth/submit',
    method: 'POST',
    data,
    needAuth: true, // 需要授权
  });
}

// 获取实时费用
export function getFee(params) {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return request({
    url: `/order/fee?${query}`,
    method: 'GET',
    needAuth: true,
  });
}
