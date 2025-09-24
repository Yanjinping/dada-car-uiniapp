<template>
  <!-- 顶部导航 -->
  <TitleBar title="推广奖励" background="transparent" />
  <scroll-view scroll-y class="page">

    <!-- 顶部 Banner -->
    <PromoBanner @open-rules="rulesVisible = true" />

    <InviteLinkBox link="#小程序://嗒嗒用车/c9zVw8jaaBOQU8f" />

    <!-- 奖励金额 + 按钮 -->
    <RewardCard
      :amount="summary.amount"
      :invite-count="summary.inviteCount"
      :link="summary.inviteLink"
      :progress-text="summary.progressText"
      @copy-link="copyLink"
      @save-poster="showPoster = true"   
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
      v-model:visible="showPoster"                         
      :inviterId="user.id"
      landingBase="https://h5.dada.com/invite"
      qrApi="https://api.dada.com/api/invite/qrcode"
    />
  </scroll-view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import PromoBanner from '../../components/promo/PromoBanner.vue'
import InviteLinkBox from '../../components/promo/InviteLinkBox.vue'
import RewardCard from '../../components/promo/RewardCard.vue'
import InviteList from '../../components/promo/InviteList.vue'
import RulesPopup from '../../components/promo/RulesPopup.vue'
import PosterPopup from '../../components/promo/PosterPopup.vue'
import { apiInviteSummary, apiInviteRecords } from '../../api/invite'

/** 控制弹窗显示：统一用 showPoster */
const showPoster = ref(false)

/** 用户信息（示例：实际请接入 store 或接口） */
const user = ref({ id: '12345', name: 'James' })

/** 数据区 */
const summary = ref({
  amount: 10,
  inviteCount: 2,
  inviteLink: '#小程序://嗒嗒用车/c9zVw8jaaBOQU8f',
  progressText: '满5人再+10元，满10人再+30元'
})
const records = ref([])
const rulesVisible = ref(false)
const rules = ref([
  '每邀请1名好友完成实名认证，立得5元优惠券，封顶10人。',
  '好友完成首单后立得5元现金红包。',
  '阶梯奖励：满5人完成首单后额外得10元现金红包，满10人完成首单后额外得30元现金红包。',
  '校园排行榜前三的额外获得现金50元。',
  '每人仅可参与一次。'
])

onMounted(async () => {
  await fetchSummary()
  await fetchRecords()
})

// async function fetchSummary(){ /* TODO 接口 */ }
// async function fetchRecords(){
//   // TODO 接口，这里省略长列表
//   records.value = [
//     { avatar:'/static/avatar/3.png', name:'兔子', time:'8.16 13:59', status:'已完成首单', reward:'5元' },
//     { avatar:'/static/avatar/4.png', name:'AAA…', time:'8.16 10:01', status:'已完成首单', reward:'5元' }
//   ]
// }
async function fetchSummary() {
  try {
    const res = await apiInviteSummary()
    if (res?.success) {
      // 后端返回：{ amount, inviteCount, inviteLink, progressText }
      summary.value = res.data || summary.value
    }
  } catch (e) {
    uni.showToast({ title: '加载汇总失败', icon: 'none' })
  }
}

async function fetchRecords() {
  try {
    const res = await apiInviteRecords()
    if (res?.success) {
      records.value = res.data || []
    }
  } catch (e) {
    uni.showToast({ title: '加载记录失败', icon: 'none' })
  }
}

/** 事件 */
function copyLink(link) {
  if (!link) return uni.showToast({ title: '暂无邀请链接', icon: 'none' })
  uni.setClipboardData({ data: link, success: () => uni.showToast({ title: '邀请链接已复制' }) })
}
function shareToFriend() {
  // WeChat 小程序用 open-type="share"；H5/App 给出指引
  if (!uni.showShareImageMenu) uni.showToast({ title: '请使用右上角分享', icon: 'none' })
}
function goWithdraw() {
  // 根据你钱包页实际路由调整
  uni.navigateTo({ url: '/pkg-wallet/pages/wallet/wallet' })
}
</script>

<style scoped>
.page{
  min-height:100vh;
  background:linear-gradient(180deg,#ff9c5a 0%, #ff893a 100%);
  padding-bottom:40rpx;
}
</style>
