<template>
  <view class="login-wrap">
    <!-- 背景 -->
    <image class="bg" src="/static/login/bg-denglu.png" mode="aspectFill" />

    <!-- 顶部标题 -->
    <TitleBar title="嗒嗒用车" background="transparent" :show-left="false" />

    <!-- 吉祥物 -->
    <view class="hero">
      <image class="mascot" :src="imgs.dada" mode="widthFix" />
    </view>

    <!-- 品牌标题区 -->
    <view class="brand">
      <image
        v-show="!wenziErr"
        class="brand-wenzi"
        :src="imgs.wenzi"
        mode="widthFix"
        @error="wenziErr = true"
      />
      <text v-if="wenziErr" class="brand-title-fallback">嗒嗒用车</text>
    </view>

    <!-- CTA 按钮 -->
    <view class="cta">
      <button
        class="btn-wx"
        :class="{ 'btn-disabled': !agreed || loading }"
        :disabled="loading || !agreed"
        open-type="getPhoneNumber"
        @getphonenumber="handleWeixinPhoneLogin"
      >微信一键登录</button>
    </view>

    <!-- 协议（同一行） -->
    <AgreeLine
      class="agree-line"
      v-model:checked="agreed"
      @service="goService"
      @privacy="goPrivacy"
    />

    <!-- 其它入口（可按需显示） -->
    <view class="more">
      <button v-if="platform === 'mp-weixin'" class="ghost" @click="handleWeixinAuthLogin">微信授权登录</button>
      <button v-if="platform === 'mp-weixin'" class="ghost" open-type="getPhoneNumber" @getphonenumber="handleWeixinPhoneLogin">微信手机号快捷登录</button>
      <button class="ghost" @click="handlePhoneLogin">手机号登录</button>
      <button v-if="platform === 'mp-alipay'" class="ghost" @click="handleAlipayLogin">支付宝一键登录</button>
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { getPlatform } from '@/utils/platform.js'

import TitleBar from '@/components/header/TitleBar.vue'
import AgreeLine from '@/components/login/AgreeLine.vue'
// 静态资源
import dadaPng from '@/static/icons/dada.png'
import wenziPng from '@/static/login/wenzi.png'

import {
  login, smsLogin, wxLogin, aliLogin, sendSmsCode,
  wxLoginWithInfo, wxPhoneLogin
} from '@/api/user.js'

const loading = ref(false)
const wenziErr = ref(false)
const imgs = { dada: dadaPng, wenzi: wenziPng }
const agreed = ref(false)

const store = useUserStore()
const user = computed(() => store.user || {})
const phone = ref('18659591731')
const code = ref('')
const password = ref('123456')
const countdown = ref(0)
const platform = ref('h5')

// 页面跳转
const goService = () => uni.navigateTo({ url: '/pages/agreement/service' })
const goPrivacy = () => uni.navigateTo({ url: '/pages/agreement/privacy' })

// 平台判断
onMounted(() => {
  platform.value = getPlatform()
  console.log('当前平台:', platform.value)
})

// 短信验证码处理
async function handleSendCode() {
  if (!/^1\d{10}$/.test(phone.value)) return uni.showToast({ title: '请输入正确手机号', icon: 'none' })
  if (loading.value) return
  loading.value = true
  try {
    await sendSmsCode(phone.value, { showLoading: true, loadingText: '发送中...' })
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    uni.showToast({ title: e?.error || e?.message || '验证码发送失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 手机号登录处理
async function handlePhoneLogin() {
  if (!/^1\d{10}$/.test(phone.value)) return uni.showToast({ title: '请输入正确手机号', icon: 'none' })
  if (!code.value && !password.value) return uni.showToast({ title: '请输入验证码或密码', icon: 'none' })
  if (loading.value) return
  loading.value = true
  try {
    let res
    if (code.value) {
      res = await smsLogin({ phone: phone.value, code: code.value }, { showLoading: true, loadingText: '登录中...' })
    } else {
      res = await login({ phone: phone.value, password: password.value }, { showLoading: true, loadingText: '登录中...' })
    }
    const token = res?.data?.token
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
	console.log('handlePhoneLogin')

    uni.redirectTo({
      url: '/pages/home/index',
      success: () => console.log('跳转成功'),
      fail: (err) => console.error('跳转失败:', err),
      complete: () => console.log('跳转完成')
    });
  } catch (e) {
    uni.showToast({ title: e?.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 微信静默登录处理
async function handleWeixinLogin() {
  if (loading.value) return
  const pf = getPlatform()
  if (!(pf === 'mp-weixin' || pf.startsWith('app'))) {
    return uni.showToast({ title: '请在微信小程序或APP内使用微信登录', icon: 'none' })
  }
  loading.value = true
  try {
    const { code } = await uni.login({ provider: 'weixin' })
    const res = await wxLogin(code, { showLoading: true, loadingText: '微信登录中...' })
    const token = res?.data?.accessToken
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('微信登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uni.showToast({ title: '微信登录成功', icon: 'success' })
    uni.redirectTo({ url: '/pages/home/index' })
  } catch (e) {
    uni.showToast({ title: e?.error || e?.message || '微信登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 微信授权登录处理
async function handleWeixinAuthLogin() {
  if (loading.value) return
  const pf = getPlatform()
  if (pf !== 'mp-weixin') {
    return uni.showToast({ title: '请在微信小程序内使用授权登录', icon: 'none' })
  }
  loading.value = true
  try {
    const { code } = await uni.login({ provider: 'weixin' })
    const userRes = await uni.getUserInfo({ provider: 'weixin', withCredentials: true })
    const { encryptedData, iv } = userRes
    const res = await wxLoginWithInfo({ code, encryptedData, iv }, { showLoading: true, loadingText: '微信登录中...' })
    const token = res?.data?.accessToken
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('微信登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uni.showToast({ title: '微信登录成功', icon: 'success' })
    uni.redirectTo({ url: '/pages/home/index' })
  } catch (e) {
    uni.showToast({ title: e?.error || e?.message || '微信登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 微信手机号快捷登录
async function handleWeixinPhoneLogin(e) {
  if (!agreed.value) return uni.showToast({ title: '请先阅读并同意服务与隐私协议', icon: 'none' })
  const pf = getPlatform()
  if (pf !== 'mp-weixin') {
    return uni.showToast({ title: '请在微信小程序内使用手机号快捷登录', icon: 'none' })
  }
  if (e?.detail?.errMsg !== 'getPhoneNumber:ok') {
    return uni.showToast({ title: '已取消手机号授权', icon: 'none' })
  }
  if (loading.value) return
  loading.value = true
  try {
    const { code } = await uni.login({ provider: 'weixin' })
    const { encryptedData, iv } = e.detail
    const res = await wxPhoneLogin({ code, encryptedData, iv }, { showLoading: true, loadingText: '登录中...' })
    const token = res?.data?.accessToken
    const u = res?.data?.user
    if (!token || !u?.id) throw new Error('微信登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.redirectTo({ url: '/pages/home/index' })
  } catch (err) {
    uni.showToast({ title: err?.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 支付宝一键登录
async function handleAlipayLogin() {
  const pf = getPlatform()
  if (pf !== 'mp-alipay' || typeof my === 'undefined') {
    return uni.showToast({ title: '请在支付宝小程序内使用支付宝登录', icon: 'none' })
  }
  if (loading.value) return
  loading.value = true
  try {
    const authRes = await new Promise((resolve, reject) => {
      my.getAuthCode({ scopes: 'auth_base', success: resolve, fail: reject })
    })
    const res = await aliLogin(authRes.authCode, { showLoading: true, loadingText: '支付宝登录中...' })
    const token = res?.data?.accessToken || res?.token
    const u = res?.data?.user || res?.user
    if (!token || !u?.id) throw new Error('支付宝登录数据不完整')
    store.login(token, u)
    uni.setStorageSync('token', token)
    uni.setStorageSync('userId', u.id)
    uni.showToast({ title: '支付宝登录成功', icon: 'success' })
    uni.redirectTo({ url: '/pages/home/index' })
  } catch (e) {
    uni.showToast({ title: e?.error || e?.message || '支付宝登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
/* 容器 */
.login-wrap{ position:relative; width:100vw; min-height:100vh; overflow:hidden; background:#F6FFF6; }
.bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }

/* 吉祥物 */
.hero{ margin-top:160rpx; display:flex; justify-content:center; position:relative; z-index:2; }
.mascot{ width:596rpx; display:block; }
/* #ifndef MP */ .mascot{ filter:drop-shadow(0 22rpx 48rpx rgba(0,214,120,.12)); } /* #endif */

/* 品牌标题 */
.brand{ margin-top:12rpx; display:flex; flex-direction:column; align-items:center; position:relative; z-index:3; }
.brand-wenzi{ width:306rpx; display:block; }
.brand-title-fallback{ font-size:64rpx; font-weight:800; color:#222; letter-spacing:2rpx; }


/* CTA */
.cta{ margin-top:270rpx; display:flex; justify-content:center; }
.btn-wx{
  width:620rpx; height:108rpx; line-height:108rpx;
  border-radius:54rpx; padding:0; border:0; text-align:center;
  font-size:36rpx; font-weight:500; color:#fff;
  background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  box-shadow:0 16rpx 40rpx rgba(13,182,61,.24), inset 0 -6rpx 0 rgba(0,0,0,.06);
}
.btn-wx[disabled]{ opacity:.7; }
/* 视觉置灰，但仍可点击以便弹出提示 */
.btn-disabled { opacity: .55; }
/* 协议（宿主块级、与按钮同宽，同一行显示） */
.agree-line{ 
  display:block; width:620rpx; margin:28rpx auto 0;
  position:relative; z-index:4;
   }

/* 备用入口 */
.more{ width:620rpx; margin:18rpx auto 0; display:flex; flex-direction:column; gap:12rpx; }
.ghost{ height:88rpx; line-height:88rpx; border-radius:44rpx; color:#07BF4A; background:rgba(13,182,61,.08); border:2rpx solid rgba(13,182,61,.25); }

/* 安全区 */
.safe-bottom{ height:calc(env(safe-area-inset-bottom) + 32rpx); }
</style>
