// /src/theme/tokens.js
// 定义多个主题；把能影响视觉的值都做成 CSS 变量
const THEMES = {
  orange: {
    // 颜色
    '--brand-500': '#FF7009',               // 金额主色
    '--brand-600': '#FFA24A',               // 强调/到期文字
    '--text-primary': '#222222',
    '--text-secondary': '#666666',
    '--text-tertiary': '#888888',
    '--bg-page': '#F5F6F9',
    '--badge-bg': '#FFF3DF',
    '--rule-bg': '#EEEEEE',
    '--btn-secondary-border': '#FFA24A',

    // 渐变（直接存渐变字符串）
    '--header-grad': 'linear-gradient(180deg, #F66600 0%, #FD9A3D 100%)',
    '--btn-primary-bg': 'linear-gradient(180deg, #F3A03A 0%, #FFC868 100%)',
    '--btn-dark-bg': '#222222',
    '--btn-dark-text': '#F6D08A',

    // 圆角/尺寸
    '--radius-md': '32rpx',   // 卡片
    '--radius-lg': '48rpx',   // 大按钮
    '--radius-xs': '8rpx',    // 小胶囊

    // 字号（按需）
    '--fs-currency': '32rpx',
    '--lh-currency': '44rpx',
    '--fs-amount': '80rpx',
    '--lh-amount': '96rpx',
    '--fs-title': '32rpx',
    '--fs-sub': '24rpx',
    '--fs-caption': '22rpx'
  },

  // 示例：蓝色主题（演示换肤）
  blue: {
    '--brand-500': '#0A84FF',
    '--brand-600': '#3AA0FF',
    '--text-primary': '#1B1B1F',
    '--text-secondary': '#5F6368',
    '--text-tertiary': '#8A8F98',
    '--bg-page': '#F3F5F8',
    '--badge-bg': '#E8F3FF',
    '--rule-bg': '#EEF1F5',
    '--btn-secondary-border': '#3AA0FF',
    '--header-grad': 'linear-gradient(180deg, #0A84FF 0%, #56B0FF 100%)',
    '--btn-primary-bg': 'linear-gradient(180deg, #2F99FF 0%, #7DC5FF 100%)',
    '--btn-dark-bg': '#101828',
    '--btn-dark-text': '#C7D2FE',
    '--radius-md': '32rpx',
    '--radius-lg': '48rpx',
    '--radius-xs': '8rpx',
    '--fs-currency': '32rpx',
    '--lh-currency': '44rpx',
    '--fs-amount': '80rpx',
    '--lh-amount': '96rpx',
    '--fs-title': '32rpx',
    '--fs-sub': '24rpx',
    '--fs-caption': '22rpx'
  }
};

/** 把 theme 对象写入 CSS 变量（全端通用：H5/小程序都支持 CSS 变量） */
export function applyTheme(nameOrTokens = 'orange') {
  const tokens =
    typeof nameOrTokens === 'string' ? THEMES[nameOrTokens] : nameOrTokens;
  if (!tokens) return;

  // H5：写到 documentElement；小程序：写到页面根 .theme-root（见下）
  const isH5 = typeof document !== 'undefined' && document.documentElement;
  if (isH5) {
    const root = document.documentElement;
    Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  } else {
    // 小程序端：把变量字符串返回，配合 page 根节点 :style 绑定
    // 用法见下文 index.vue：<view class="theme-root" :style="themeStyle">
  }
  return tokens;
}

/** 返回内联 style 字符串（用于小程序端根节点） */
export function tokensToStyle(nameOrTokens = 'orange') {
  const tokens =
    typeof nameOrTokens === 'string' ? THEMES[nameOrTokens] : nameOrTokens;
  if (!tokens) return '';
  return Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

export { THEMES };
