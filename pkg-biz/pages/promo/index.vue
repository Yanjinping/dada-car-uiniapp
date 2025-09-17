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

// ------- 响应式数据（可接后端）-------
const summary = ref({
  amount: 0,               // 可提现金额
  inviteCount: 0,          // 已成功邀请人数（完成首单）
  inviteLink: '#小程序://嗒嗒用车/c9zVw8jaaBOQU8f',
  progressText: '满5人再+10元，满10人再+30元'
})

const records = ref([])     // 邀请记录
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
  qrcode: '',                                      // 后端返回或本地生成二维码链接
  title: '我在嗒嗒赚现金',
  subtitle: '快来扫码跟我一起赚~！'
})

// ------- 生命周期：拉取数据 -------
onMounted(async () => {
  await fetchSummary()
  await fetchRecords()
  await fetchPoster()
})

async function fetchSummary() {
  // TODO: 替换为真实接口
  // const res = await uni.request({ url: BASE + '/invite/reward', method: 'GET' })
  summary.value = {
    amount: 10,
    inviteCount: 2,
    inviteLink: '#小程序://嗒嗒用车/c9zVw8jaaBOQU8f',
    progressText: '满5人再+10元，满10人再+30元'
  }
}

async function fetchRecords() {
  // TODO: 替换为真实接口
  records.value = [
    { avatar: '/static/avatar/1.png', name: '哈哈', time: '8.16 23:59', status: '未实名认证', reward: '0元' },
    { avatar: '/static/avatar/2.png', name: '陈涵…', time: '8.16 13:59', status: '已实名认证', reward: '5元优惠券' },
    { avatar: '/static/avatar/3.png', name: '兔子', time: '8.16 13:59', status: '已完成首单', reward: '5元' },
    { avatar: '/static/avatar/4.png', name: 'AAA…', time: '8.16 10:01', status: '已完成首单', reward: '5元' }
  ]
}

async function fetchPoster() {
  // TODO: 替换为真实接口
  // const { data } = await uni.request({ url: BASE + '/invite/poster', method:'GET' })
  poster.value.qrcode = '/static/qrcode-demo.png'
}

// ------- 事件处理 -------
function copyLink(link) {
  uni.setClipboardData({ data: link, success: () => uni.showToast({ title: '邀请链接已复制' }) })
}

function shareToFriend() {
  // 小程序端建议用 open-type="share" 的按钮，这里兜底
  uni.showShareImageMenu ? uni.showShareImageMenu({ path: poster.value.qrcode }) : uni.showToast({ title: '请使用右上角分享', icon: 'none' })
}

function goWithdraw() {
  uni.showToast({ title: '去提现', icon: 'none' })
  // uni.navigateTo({ url:'/pages/wallet/withdraw' })
}

async function savePoster() {
  // PosterPopup 内部已做下载保存，这里可做额外打点
}
</script>

<style scoped>
.page{ min-height:100vh; background:linear-gradient(180deg,#FFE2BF 0%, #FF9E53 100%); padding-bottom: 40rpx;}
</style>
