<template>
  <scroll-view scroll-y class="page">
    <!-- 顶部导航 -->
    <TitleBar title="推广奖励" background="transparent" />

    <!-- 顶部 Banner -->
    <PromoBanner @open-rules="rulesVisible = true" />

    <!-- 奖励金额 + 按钮 -->
    <RewardCard
      :amount="summary.amount"
      :invite-count="summary.inviteCount"
      :link="summary.inviteLink"
      :progress-text="summary.progressText"
      @copy-link="copyLink"
      @save-poster="posterVisible = true"
      @send-friend="shareToFriend"
    />

    <!-- 邀请记录 -->
    <InviteList
      :total="summary.amount"
      :records="records"
      @withdraw="goWithdraw"
    />

    <!-- 规则弹窗 -->
    <RulesPopup v-model:visible="rulesVisible" :rules="rules" />

    <!-- 海报弹窗 -->
    <PosterPopup
      v-model:visible="posterVisible"
      :qrcode="poster.qrcode"
      :title="poster.title"
      :subtitle="poster.subtitle"
      @save="savePoster"
    />

    <!-- 小程序端原生分享按钮（可选） -->
    <!-- #ifdef MP -->
    <view style="padding: 24rpx; text-align:center;">
      <button
        open-type="share"
        style="display:inline-block;padding:18rpx 28rpx;border-radius:999px;background:#fff;color:#333;"
      >
        转发给好友
      </button>
    </view>
    <!-- #endif -->
  </scroll-view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import PromoBanner from '@/components/promo/PromoBanner.vue'
import RewardCard from '@/components/promo/RewardCard.vue'
import InviteList from '@/components/promo/InviteList.vue'
import RulesPopup from '@/components/promo/RulesPopup.vue'
import PosterPopup from '@/components/promo/PosterPopup.vue'

// 接口（JS 版）：src/api/invite.js
import {
  getInviteSummary,
  getInviteRecords,
  getInvitePoster,
  getInviteLink,     // 备用：如果需要单独获取链接
  bindInvite,        // 备用：在落地页或我的-绑定
  getMyInviteList    // 备用：单独的“我的邀请列表”页
} from '../../api/invite'

// ------- 响应式数据 -------
const summary = ref({
  amount: 0,               // 可提现金额（只包含现金奖励）
  inviteCount: 0,          // 有效邀请人数（完成首单）
  inviteLink: '',
  progressText: ''
})

const records = ref([])     // 邀请记录（头像、昵称、时间、状态、奖励）
const rulesVisible = ref(false)
const posterVisible = ref(false)
const rules = ref([
  '每邀请1名好友完成实名认证，立得5元优惠券，封顶10人。',
  '好友完成首单后立得5元现金红包。',
  '阶梯奖励：满5人完成首单后额外得10元现金红包，满10人完成首单后额外得30元现金红包。',
  '校园排行榜前三的额外获得现金50元。',
  '每人仅可参与一次。'
])

const poster = ref({
  qrcode: '',                                      // 后端返回的二维码地址或base64
  title: '我在嗒嗒赚现金',
  subtitle: '快来扫码跟我一起赚~！'
})

// ------- 生命周期：拉取数据 -------
onMounted(async () => {
  await Promise.all([fetchSummary(), fetchRecords(), fetchPoster()])
})

// ------- API 对接 -------
async function fetchSummary() {
  try {
    const data = await getInviteSummary()
    summary.value = {
      amount: data?.amount ?? 0,
      inviteCount: data?.inviteCount ?? 0,
      inviteLink: data?.inviteLink ?? '',
      progressText: data?.progressText ?? ''
    }
  } catch (_) {}
}

async function fetchRecords() {
  try {
    records.value = await getInviteRecords()
  } catch (_) {}
}

async function fetchPoster() {
  try {
    poster.value.qrcode = await getInvitePoster()
  } catch (_) {}
}

// ------- 事件处理 -------
function copyLink() {
  const link = summary.value.inviteLink
  if (!link) return uni.showToast({ title: '暂无邀请链接', icon: 'none' })
  uni.setClipboardData({ data: link, success: () => uni.showToast({ title: '邀请链接已复制' }) })
}

function shareToFriend() {
  // 小程序端建议用 open-type="share"（上面已提供按钮），这里做兜底
  const path = poster.value.qrcode
  if ((uni).showShareImageMenu && path) {
    ;(uni).showShareImageMenu({ path })
  } else {
    uni.showToast({ title: '请使用右上角分享', icon: 'none' })
  }
}

function goWithdraw() {
  // 跳转到你的提现页
  uni.navigateTo({ url: '/pages/wallet/withdraw' })
}

async function savePoster() {
  // 如果 PosterPopup 内部已处理下载保存，这里可做埋点或二次提示
  uni.showToast({ title: '已保存到相册', icon: 'none' })
}

// ------- 小程序分享钩子（可选） -------
/* 仅小程序有效：把页面分享到会话或朋友圈 */
// #ifdef MP
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

onShareAppMessage(() => {
  return {
    title: '我在嗒嗒赚现金，邀请你一起～',
    // 你的落地页路径，可承接 ?code= 或在后端解析 token 生成邀请关系
    path: '/pages/invite/landing',
    imageUrl: poster.value.qrcode || ''
  }
})

onShareTimeline(() => {
  return {
    title: '我在嗒嗒赚现金，邀请你一起～',
    query: '',       // 若使用 query 传参，这里可拼接 ?code=xxx
    imageUrl: poster.value.qrcode || ''
  }
})
// #endif
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg,#FFE2BF 0%, #FF9E53 100%);
  padding-bottom: 40rpx;
}
</style>
