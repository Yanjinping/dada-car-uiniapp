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
 * 获取当前运行平台（统一返回上面的常量之一）
 * 兼容：H5、微信小程序、支付宝小程序、iOS/Android（App）
 */
export function getPlatform() {
  const info = uni.getSystemInfoSync?.() || {};
  const uniPlatform = (info.uniPlatform || process?.env?.UNI_PLATFORM || '').toLowerCase();
  const rawPlatform = (info.platform || '').toLowerCase(); // ios / android / devtools / ...

  // 先判断各端
  if (uniPlatform === 'h5') return Platform.H5;
  if (uniPlatform === 'mp-weixin') return Platform.MP_WEIXIN;
  if (uniPlatform === 'mp-alipay') return Platform.MP_ALIPAY;
  if (uniPlatform === 'app' || uniPlatform === 'app-plus') {
    if (rawPlatform === 'ios') return Platform.APP_IOS;
    if (rawPlatform === 'android') return Platform.APP_ANDROID;
    return Platform.APP;
  }

  // 兜底：部分环境只暴露 rawPlatform
  if (rawPlatform === 'ios') return Platform.APP_IOS;
  if (rawPlatform === 'android') return Platform.APP_ANDROID;

  // 仍不明确时，按 H5 兜底
  return Platform.H5;
}

// 便捷判断函数
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
