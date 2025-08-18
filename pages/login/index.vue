<template>
  <view class="login-page">
    <!-- 背景 -->
    <image class="bg" src="/static/login/bg-denglu.png" mode="aspectFill" />

    <!-- 顶部标题（已隐藏系统导航栏时生效） -->
    <view class="header safe-top">
      <text class="app-title">嗒嗒用车</text>
      <!-- 右上装饰有需要再打开
      <view class="icons">
        <view class="dots"><view></view><view></view><view></view></view>
        <view class="vline"></view>
        <view class="round"></view>
      </view>
      -->
    </view>

    <!-- 悬浮形象（建议使用无文字 PNG） -->
    <view class="hero">
      <image class="mascot" src="/static/login/mascot-hero.png" mode="widthFix" />
    </view>

    <!-- 品牌文案（如果上图已带文字，这块注释掉即可） -->
<!--    <view class="brand">
      <text class="brand-title">嗒嗒用车</text>
      <text class="brand-sub">泉州共享汽车领跑者</text>
    </view -->>

    <!-- 底部操作区 -->
    <view class="bottom safe-bottom">
      <!-- 主操作：微信一键登录 -->
      <button class="btn-primary" :disabled="loading" open-type="getPhoneNumber" @getphonenumber="handleWeixinPhoneLogin">
        <block v-if="loading">登录中…</block>
        <block v-else>微信一键登录</block>
      </button>

      <!-- 协议区（像素级还原蓝湖） -->
     <!-- 协议区（两行：第一行 勾选+灰字；第二行 占位+两个绿色链接） -->
     <view class="agreement">
       <view class="agr-row">
         <view class="check"></view>
         <text class="agr">未注册手机号登录后自动生成账号，且代表您已阅读并同意</text>
       </view>
       <view class="agr-row links">
         <view class="spacer"></view>
         <text class="link" @click="goService">《服务协议》</text>
         <text class="link" @click="goPrivacy">《隐私协议》</text>
       </view>
     </view>

      <!-- 其它入口保留但默认隐藏：把 v-if 改为 true 即可显示 -->
      <view class="more" v-if="true">
        <button class="ghost" @click="handleWeixinAuthLogin">微信授权登录</button>
        <button class="ghost" open-type="getPhoneNumber" @getphonenumber="handleWeixinPhoneLogin">微信手机号快捷登录</button>
        <button class="ghost" @click="handlePhoneLogin">手机号登录</button>
        <button class="ghost" @click="handleAlipayLogin">支付宝一键登录</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import uniToast from '@/utils/uniToast.js'
import { useUserStore } from '@/store/user.js'
import {
  login, smsLogin, wxLogin, aliLogin, sendSmsCode,
  wxLoginWithInfo, wxPhoneLogin
} from '@/api/user.js'

/** ====== 状态 ====== */
const store = useUserStore()
const user = computed(() => store.user || {})
const phone = ref('18659591731')
const code = ref('')
const password = ref('123456')
const countdown = ref(0)
const loading = ref(false)

/** ====== 协议跳转 ====== */
function goService() { uni.navigateTo({ url: '/pages/agreement/service' }) }
function goPrivacy() { uni.navigateTo({ url: '/pages/agreement/privacy' }) }

/** ====== 短信验证码 ====== */
async function handleSendCode() {
  if (!/^1\d{10}$/.test(phone.value)) return uniToast('请输入正确手机号')
  try {
    uni.showLoading({ title: '发送中...' })
    await sendSmsCode(phone.value)
    uni.hideLoading()
    uniToast('验证码已发送', 'success')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    uni.hideLoading()
    uniToast(e?.error || '验证码发送失败')
  }
}

/** ====== 手机号登录（短信/密码二选一） ====== */
async function handlePhoneLogin() {
  if (!/^1\d{10}$/.test(phone.value)) return uniToast('请输入正确手机号')
  if (!code.value && !password.value) return uniToast('请输入验证码或密码')

  try {
    loading.value = true
    uni.showLoading({ title: '登录中...' })
    let res
    if (code.value) {
      res = await smsLogin({ phone: phone.value, code: code.value })
    } else {
      res = await login({ phone: phone.value, password: password.value })
    }
    // 期望结构 { code:0, data: { token, user:{id,...} } }
    const token = res?.data?.token
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uniToast('登录成功', 'success')
    uni.navigateTo({ url: '/pages/home/home' })
  } catch (e) {
    console.error('登录失败：', e)
    uniToast(e?.message || '登录失败')
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

/** ====== 微信静默登录（code -> 后端） ====== */
async function handleWeixinLogin() {
  try {
    loading.value = true
    uni.showLoading({ title: '微信登录中...' })
    const { code } = await uni.login({ provider: 'weixin' })
    const res = await wxLogin(code)
    const token = res?.data?.accessToken
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('微信登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uniToast('微信登录成功', 'success')
    uni.switchTab({ url: '/pages/home/home' })
  } catch (e) {
    console.error('handleWeixinLogin err:', e)
    uniToast(e?.error || e?.message || '微信登录失败')
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

/** ====== 微信授权登录（获取用户信息） ====== */
async function handleWeixinAuthLogin() {
  try {
    loading.value = true
    uni.showLoading({ title: '微信登录中...' })
    const { code } = await uni.login({ provider: 'weixin' })
    const userRes = await uni.getUserInfo({ provider: 'weixin', withCredentials: true })
    const { encryptedData, iv } = userRes
    const res = await wxLoginWithInfo({ code, encryptedData, iv })
    const token = res?.data?.accessToken
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('微信登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uniToast('微信登录成功', 'success')
    uni.navigateTo({ url: '/pages/home/home' })
  } catch (e) {
    uniToast(e?.error || e?.message || '微信登录失败')
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

/** ====== 微信手机号快捷登录（getPhoneNumber） ====== */
async function handleWeixinPhoneLogin(e) {
  if (e?.detail?.errMsg !== 'getPhoneNumber:ok') {
    return uniToast('已取消手机号授权')
  }
  try {
    loading.value = true
    uni.showLoading({ title: '登录中...' })
    const { code } = await uni.login({ provider: 'weixin' })
    const { encryptedData, iv } = e.detail
    const res = await wxPhoneLogin({ code, encryptedData, iv })
    const token = res?.data?.accessToken
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('微信登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uniToast('登录成功', 'success')
    uni.navigateTo({ url: '/pages/home/home' })
  } catch (err) {
    uniToast(err?.message || '登录失败')
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

/** ====== 支付宝一键登录（仅在支付宝小程序/APP） ====== */
async function handleAlipayLogin() {
  try {
    if (typeof my === 'undefined') return uniToast('当前环境不支持支付宝登录')
    loading.value = true
    uni.showLoading({ title: '支付宝登录中...' })
    const authRes = await new Promise((resolve, reject) => {
      my.getAuthCode({ scopes: 'auth_base', success: resolve, fail: reject })
    })
    const res = await aliLogin(authRes.authCode)
    const token = res?.data?.accessToken || res?.token
    const u = res?.data?.user || res?.user
    if (!token || !u?.id) throw new Error('支付宝登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uniToast('支付宝登录成功', 'success')
    uni.navigateTo({ url: '/pages/home/home' })
  } catch (e) {
    uniToast(e?.error || e?.message || '支付宝登录失败')
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

// 可选：去注册
function navigateToRegister() { uni.navigateTo({ url: '/pages/register/index' }) }
</script>

<style scoped>
/* —— 安全区 —— */
.safe-top { padding-top: constant(safe-area-inset-top); padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 32rpx); }

/* —— 页面背景 —— */
.login-page{
  position:relative; width:100vw; height:100vh; overflow:hidden;
  display:flex; flex-direction:column; align-items:center;
  background:#F6FFF6;
}
.bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }

/* —— 顶部标题 —— */
.header{
  position:relative; z-index:2; width:100%;
  display:flex; justify-content:center; align-items:center;
  padding: 56rpx 32rpx 0;             /* 下移更贴近设计 */
  min-height: 88rpx;
}
.app-title{ font-size:36rpx; font-weight:800; color:#1A1A1A; letter-spacing:2rpx; }

/* —— 悬浮形象 & 品牌 —— */
.hero{ z-index:2; width:100%; display:flex; justify-content:center; margin-top:20rpx; }
.mascot{ width:580rpx; filter:drop-shadow(0 22rpx 48rpx rgba(0,214,120,.18)); }

.brand{ z-index:2; margin-top:0rpx; text-align:center; }
.brand-title{ font-size:76rpx; font-weight:900; color:#222; letter-spacing:2rpx; text-shadow:0 6rpx 14rpx rgba(0,0,0,.08); }
.brand-sub{ margin-top:6rpx; font-size:28rpx; color:#8F9AA3; }

/* —— 底部操作区 —— */
/* —— 底部操作区 —— */
.bottom {
  z-index: 2;
  width: 100%;
  margin-top: auto;
  padding: 0 48rpx calc(56rpx + constant(safe-area-inset-bottom));
  padding: 0 48rpx calc(56rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 针对刘海屏额外抬高（大概等于你想要的 200rpx 效果） */
@supports (padding: max(0px)) {
  .bottom {
    padding-bottom: max(200rpx, calc(56rpx + env(safe-area-inset-bottom)));
  }
}

/* 主按钮：620×108rpx，r=54rpx（渐变更贴近设计） */
.btn-primary{
  width:620rpx; height:108rpx; line-height:108rpx;
  margin:0 auto 40rpx;                 /* 与协议距离更大 */
  text-align:center; color:#fff; font-size:32rpx; font-weight:600; letter-spacing:2rpx;
  border-radius:54rpx;
  background:linear-gradient(180deg,#35D07F 0%, #07BF4A 100%);
  box-shadow:0 26rpx 52rpx rgba(7,191,74,.30), inset 0 -6rpx 0 rgba(0,0,0,.06);
  transition:all .15s ease;
}
.btn-primary:active{ transform:translateY(2rpx); filter:brightness(.96); }
.btn-primary[disabled]{ opacity:.6; box-shadow:none; }

/* —— 协议区（两行：占位对齐） —— */
.agreement{
  width:568rpx; margin:0 auto;
  display:flex; flex-direction:column;
}
.agr-row{ display:flex; align-items:center; }

/* 勾选：36rpx 方块、圆角 8rpx、#07BF4A */
.check{
  width:36rpx; height:36rpx; border-radius:8rpx; background:#07BF4A;
  margin-right:12rpx; margin-top:2rpx; position:relative; flex:none;
}
.check:after{
  content:''; position:absolute; left:8rpx; top:10rpx; width:20rpx; height:12rpx;
  border-left:4rpx solid #fff; border-bottom:4rpx solid #fff; transform:rotate(-45deg);
}

/* 第一行说明：24/36 */
.agr{ font-size:24rpx; line-height:36rpx; color:#A6A6A6; }

/* 第二行用占位把链接与上行文字起点对齐：36+12=48rpx */
.links{ margin-top:6rpx; }
.spacer{ width:48rpx; flex:none; }
.link{ font-size:26rpx; line-height:40rpx; color:#07BF4A; margin-right:8rpx; }

/* 备用入口（可选） */
.more{ margin-top:16rpx; display:flex; flex-direction:column; gap:12rpx; }
.ghost{
  height:88rpx; line-height:88rpx; border-radius:44rpx;
  color:#0DB63D; background:rgba(13,182,61,.08); border:2rpx solid rgba(13,182,61,.25);
}
</style>
