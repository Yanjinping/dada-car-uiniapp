// utils/platform.js

// 平台常量
export const Platform = {
  H5: 'h5',
  MP_WEIXIN: 'mp-weixin',
  MP_ALIPAY: 'mp-alipay',
  APP: 'app',
  APP_IOS: 'app-ios',
  APP_ANDROID: 'app-android',
};

/**
 * 安全获取系统信息（优先新 API，失败回退）
 */
function safeGetSysInfo() {
  // mp-weixin 优先用新版 API
  if (typeof wx !== 'undefined') {
    try {
      const base = wx.getAppBaseInfo?.() || {};
      const device = wx.getDeviceInfo?.() || {};
      return {
        uniPlatform: 'mp-weixin',
        platform: (device.platform || base.platform || '').toLowerCase(),
      };
    } catch (_) {}
  }

  // 其他端：优先 uni.getSystemInfoSync
  try {
    if (typeof uni !== 'undefined' && typeof uni.getSystemInfoSync === 'function') {
      return uni.getSystemInfoSync() || {};
    }
  } catch (_) {}

  return {};
}

/**
 * 获取当前运行平台（统一返回上面的常量之一）
 * 兼容：H5、微信小程序、支付宝小程序、iOS/Android（App）
 */
export function getPlatform() {
  const info = safeGetSysInfo();
  const uniPlatform = (info.uniPlatform || process?.env?.UNI_PLATFORM || '').toLowerCase();
  const rawPlatform = (info.platform || '').toLowerCase(); // ios / android / devtools / ...

  // 优先判断官方平台标识
  if (uniPlatform === 'h5') return Platform.H5;
  if (uniPlatform === 'mp-weixin') return Platform.MP_WEIXIN;
  if (uniPlatform === 'mp-alipay') return Platform.MP_ALIPAY;

  if (uniPlatform === 'app' || uniPlatform === 'app-plus') {
    if (rawPlatform === 'ios') return Platform.APP_IOS;
    if (rawPlatform === 'android') return Platform.APP_ANDROID;
    return Platform.APP;
  }

  // 兜底：仅有 rawPlatform 时
  if (rawPlatform === 'ios') return Platform.APP_IOS;
  if (rawPlatform === 'android') return Platform.APP_ANDROID;

  // 默认当 H5
  return Platform.H5;
}

// —— 常用便捷函数 ——
// ⚠️ 内部调用 getPlatform()，如果在性能敏感场景，可提前 const p = getPlatform() 缓存
export const isH5 = () => getPlatform() === Platform.H5;
export const isWeixin = () => getPlatform() === Platform.MP_WEIXIN;
export const isAlipay = () => getPlatform() === Platform.MP_ALIPAY;
export const isApp = () => {
  const p = getPlatform();
  return p === Platform.APP || p === Platform.APP_IOS || p === Platform.APP_ANDROID;
};
export const isIOS = () => getPlatform() === Platform.APP_IOS;
export const isAndroid = () => getPlatform() === Platform.APP_ANDROID;
export const isMiniProgram = () => {
  const p = getPlatform();
  return p === Platform.MP_WEIXIN || p === Platform.MP_ALIPAY;
};
