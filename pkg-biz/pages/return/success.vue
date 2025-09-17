<template>
  <view class="page">
    <!-- 顶部渐变背景 -->
    <view class="bg"></view>

    <!-- 全局 TitleBar：点击左箭头回首页 -->
    <TitleBar
      title="嗒嗒用车"
      background="transparent"
      left-icon="/static/icons/home.png"
      back-type="home"
    />

    <!-- 中间成功插画 + 文字 -->
    <view class="center">
      <image class="planet" src="/static/icons/success-planet.png" mode="widthFix" />
      <text class="title">还车成功</text>
    </view>

    <!-- 操作按钮区 -->
<view class="ops">
  <button class="btn-outline" @tap="goOrder">查看订单</button>

  <!-- 小程序端 -->
  <!-- #ifdef MP-WEIXIN -->
  <button class="btn-primary" open-type="share">晒单领券</button>
  <!-- #endif -->

  <!-- H5 端（含微信内H5与普通浏览器） -->
  <!-- #ifdef H5 -->
  <button class="btn-primary" @tap="shareH5Universal">晒单领券</button>
  <!-- #endif -->

  <!-- App 端 -->
  <!-- #ifdef APP-PLUS -->
  <button class="btn-primary" @tap="shareToWeixin">晒单领券</button>
  <!-- #endif -->
</view>

    <!-- 评分卡片 -->
    <view class="card">
      <image class="mascot" src="/static/icons/mascot.png" mode="widthFix" />

      <view class="card-body">
        <text class="card-title">车辆评价</text>
        <text class="card-desc">本次车辆体验如何？给小嗒打个分吧</text>

        <!-- 评分 -->
        <view class="stars">
          <StarRate
            v-model="score"
            :size="44"
            :gap="16"
            fullIcon="/static/icons/star-full.png"
            emptyIcon="/static/icons/star-empty.png"
          />
        </view>

        <!-- 确定按钮 -->
        <button class="btn-confirm" @tap="onConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import StarRate from '@/components/rate/StarRate.vue'

const score = ref(5)

// 你的业务可传入订单号、车型、网点等
const sharePayload = {
  title: '嗒嗒用车 · 校园出行更方便 🚗',
  path: '/pages/index/index?scene=share_return_success',   // 分享落地页
  imageUrl: '/static/share-banner.png',                    // 1:1 或 5:4 效果更好
  summary: '新人立减券，限时领取～'
}

onMounted(() => {
  // 小程序端展示系统分享菜单（支持群分享票据）
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
    // 可按需支持朋友圈
    // menus: ['shareAppMessage', 'shareTimeline']
  })
  // #endif
})

function goOrder() {
  uni.navigateTo({ url: '/pages/order/list' })
}
function onConfirm() {
  uni.navigateBack({ delta: 1 })
}

// App端手动拉起微信分享
function shareToWeixin() {
  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession', // 会话；'WXSceneTimeline' 为朋友圈
    type: 0,                 // 网页分享
    href: 'https://your-domain.example/h5/landing?from=app_share', // H5落地链接
    title: sharePayload.title,
    summary: sharePayload.summary,
    imageUrl: sharePayload.imageUrl,
    success: () => {
      console.log('分享成功')
    },
    fail: (err) => {
      console.error('分享失败', err)
      uni.showToast({ title: '分享失败', icon: 'none' })
    }
  })
  // #endif
}
</script>

<!-- 小程序分享配置（Vue3 + <script setup> 下可额外放一个非setup脚本） -->
<script>
// 仅在小程序端生效
// #ifdef MP-WEIXIN
export default {
  // 转发给好友 / 群 的内容
  onShareAppMessage() {
    return {
      title: '嗒嗒用车 · 校园出行更方便 🚗',
      path: '/pages/index/index?scene=share_return_success',
      imageUrl: '/static/share-banner.png'
    }
  },
  // 若需要朋友圈
  onShareTimeline() {
    return {
      title: '嗒嗒用车 · 校园出行更方便 🚗',
      query: 'scene=share_timeline',
      imageUrl: '/static/share-banner.png'
    }
  }
}
// #endif
</script>

<style scoped>
.page{
  position: relative;
  background:#F7F7F7;
  min-height:100vh;
}
/* 2) 顶部背景：加高到 ~520rpx，并且延后变白的比例 */
.bg{
  position:absolute; left:0; top:0; right:0;
  height: 520rpx;
  z-index: 0;
  background-image:
    radial-gradient(70% 55% at 0% 0%,   #CFF7DE 0%, rgba(207,247,222,0) 72%),
    radial-gradient(62% 55% at 100% 0%, #CFF7DE 0%, rgba(221,247,255,0) 70%),
    linear-gradient(180deg, #ECFFF7 0%, #F7FFFC 85%, #FFFFFF 100%);
  background-repeat: no-repeat,no-repeat,no-repeat;
  background-size: 100% 100%,100% 100%,100% 100%;
}

/* 浮层顺序 */
:deep(.titlebar){ position: relative; z-index: 1; }
.center, .ops, .card{ position: relative; z-index: 1; }

/* 中部插画 */
.center{
  margin-top: 24rpx;
  display:flex; flex-direction:column; align-items:center;
}
.planet{ width:220rpx; }
.title{ margin-top:16rpx; font-size:40rpx; font-weight:600; color:#222; }

/* 操作按钮 */
.ops{ margin-top:48rpx; padding:0 64rpx; display:flex; justify-content:space-between; }
.btn-outline{
  width:296rpx; height:84rpx; line-height:84rpx;
  border-radius:48rpx; border:2rpx solid #A9DFC0; color:#13BC45;
  font-size:32rpx;
}
.btn-primary{
  width:296rpx; height:84rpx; line-height:84rpx;
  border-radius:48rpx; background:#13BC45; color:#fff;
  font-size:32rpx; border:0;
}

/* 卡片 */
.card{
  margin:48rpx 24rpx 0; background:#fff; border-radius:24rpx;
  box-shadow:0 6rpx 24rpx rgba(0,0,0,0.05);
  display:flex; padding:32rpx;
}
.mascot{ width:100rpx; height:114rpx; margin-right:24rpx; }
.card-body{ flex:1; display:flex; flex-direction:column; }
.card-title{ font-size:32rpx; font-weight:600; color:#000; }
.card-desc{ margin-top:8rpx; font-size:28rpx; color:#666; }

/* 星级 */
.stars{ margin-top:28rpx; }

/* 确定按钮 */
.btn-confirm{
  margin-top:32rpx;
  width:100%; height:80rpx; line-height:80rpx;
  border-radius:48rpx; border:2rpx solid #F66700; color:#F66700;
  font-size:32rpx; background:#fff;
}
</style>
