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
        :disabled="loading"
        hover-class="none"
        open-type="getPhoneNumber"
        @getphonenumber="handleWeixinPhoneLogin"
      >微信一键登录</button>
    </view>

    <!-- 协议：与按钮同宽，自动换行，链接独立可点 -->
    <view class="agree-wrap">
      <image class="ok" src="/static/icons/ok-green.png" mode="widthFix" />
      <text class="agree-text">
        未注册手机号登录后自动生成账号，且代表您已阅读并同意
      </text>
      <text class="agree-link" @tap="goService">《服务协议》</text>
      <text class="agree-link" @tap="goPrivacy">《隐私协议》</text>
    </view>

    <view class="safe-bottom" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'

// 用 import 引入，避免分包路径差异
import dadaPng from '@/static/icons/dada.png'
import wenziPng from '@/static/login/wenzi.png'

const loading = ref(false)
const wenziErr = ref(false)
const imgs = { dada: dadaPng, wenzi: wenziPng }

const goService = () => uni.navigateTo({ url: '/pages/agreement/service' })
const goPrivacy = () => uni.navigateTo({ url: '/pages/agreement/privacy' })

const handleWeixinPhoneLogin = async (e) => {
  if (e?.detail?.errMsg !== 'getPhoneNumber:ok') {
    return uni.showToast({ title: '已取消手机号授权', icon: 'none' })
  }
  loading.value = true
  try {
    // TODO: 与后端对接手机授权登录
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.switchTab({ url: '/pages/home/index' })
  } catch (err) {
    uni.showToast({ title: err?.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 整体容器 */
.login-wrap{
  position:relative; width:100vw; min-height:100vh; overflow:hidden; background:#F6FFF6;
  display:flex; flex-direction:column; align-items:center;
}
.bg{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }

/* 吉祥物 */
.hero{ margin-top:160rpx; z-index:2; }
.mascot{ width:596rpx; display:block; }
/* #ifndef MP */ .mascot{ filter:drop-shadow(0 22rpx 48rpx rgba(0,214,120,.12)); } /* #endif */

/* 品牌标题 */
.brand{ margin-top:12rpx; display:flex; flex-direction:column; align-items:center; position:relative; z-index:3; }
.brand-wenzi{ width:306rpx; display:block; }
.brand-title-fallback{ font-size:64rpx; font-weight:800; color:#222; letter-spacing:2rpx; }
.brand-sub{ margin-top:8rpx; font-size:28rpx; color:#666; }

/* CTA 按钮 */
.cta{ margin-top:270rpx; z-index:3; }
.btn-wx{
  display:flex; align-items:center; justify-content:center;
  width:620rpx; height:108rpx; line-height:108rpx;
  border-radius:54rpx; padding:0; border:0; text-align:center;
  font-size:36rpx; font-weight:600; color:#fff; letter-spacing:1rpx;
  background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  box-shadow:0 16rpx 40rpx rgba(13,182,61,.24), inset 0 -6rpx 0 rgba(0,0,0,.06);
}
.btn-wx[disabled]{ opacity:.7; }
button::after { border:none; }

/* 协议行（关键）：与按钮同宽，自适应换行，点击区独立 */
.agree-wrap{
  width:620rpx; margin-top:18rpx; display:flex; flex-wrap:wrap; align-items:flex-start; z-index:3;
  font-size:26rpx; line-height:40rpx; color:#A6A6A6;
}
.ok{ width:32rpx; height:32rpx; margin-top:4rpx; margin-right:12rpx; flex:0 0 32rpx; }
.agree-text{
  flex:1 1 auto; min-width:0;
  white-space:normal; word-break:keep-all;    /* ✅中文优先不拆词 */
}
.agree-link{
  display:inline-block; margin-left:6rpx; color:#07BF4A;
}

/* 底部安全区 */
.safe-bottom{ height:calc(env(safe-area-inset-bottom) + 32rpx); }
</style>
