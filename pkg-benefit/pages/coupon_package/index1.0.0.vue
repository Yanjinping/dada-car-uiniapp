<template>
  <!-- 顶部渐变区（蓝湖：750×290，#F66600 -> #FD9A3D） -->
  <view class="header">
    <TopBar title="卡券套餐" :showBack="true" @back="onBack" />
    <!-- Tabs 放在渐变里，白色文字 -->
    <view class="tabs-on-header">
      <Segment
        :items="[ { key: 'coupon', text: `优惠券(${couponCount})` }, { key: 'package', text: `套餐(${packageCount})` } ]"
        v-model:active="activeTab"
      />
    </view>
  </view>

  <!-- 一体式钱包：支持 v-model:expanded -->
  <WalletFoldCard
    v-model:expanded="walletExpanded"
    :spendable="amounts[0].value"
    :withdrawable="amounts[1].value"
    :depositCar="amounts[2].value"
    :depositIllegal="amounts[3].value"
    @withdraw="goWithdraw"
    @recharge="goRecharge"
  />

  <!-- 页面滚动内容 -->
  <scroll-view scroll-y class="page">
    <!-- 优惠券 -->
    <template v-if="activeTab === 'coupon'">
      <CouponCard
        v-for="c in couponList"
        :key="c.id"
        v-bind="c"
        currency="¥"
        ruleBtnText="使用规则"
        suffixIcon="/static/benefit/car-fade.png"
        :showDashedDivider="true"
        :secondaryBtn="{ visible: !!c.shareable, text: '送给好友' }"
        @rule="onShowRule(c)"
        @cta="onUseCoupon(c)"
        @tap-secondaryBtn="onShare(c)"
      />
    </template>

    <!-- 套餐 -->
    <template v-else>
      <view class="pkg-section-head" @tap="availOpen = !availOpen">
        <text class="pkg-section-title">可用套餐</text>
        <image
          class="pkg-fold"
          src="/static/benefit/zhedie.png"    
          mode="widthFix"
          :class="{ open: availOpen }"
        />
      </view>

      <view v-show="availOpen">
        <PackageCard
          v-for="p in availablePackages"
          :key="p.id"
          v-bind="p"
          currency="¥"
          ruleBtnText="套餐说明"
          bgWatermark="/static/benefit/car-fade.png"
          :primaryBtn="{ text: '立即使用' }"
          :secondaryBtn="{ text: '送给好友' }"
          @rule="onShowPkgRule(p)"
          @tap-primaryBtn="onUsePackage(p)"
          @tap-secondaryBtn="onSharePackage(p)"
        />
      </view>

      <SectionTitle text="购买套餐" />
      <PackageCard
        v-for="p in buyablePackages"
        :key="p.id"
        v-bind="p"
        currency="¥"
        ruleBtnText="套餐说明"
        bgWatermark="/static/benefit/car-fade.png"
        :footerDashed="true"
        :primaryBtn="{ text: '一键购买', theme: 'dark' }"
        @rule="onShowPkgRule(p)"
        @tap-primaryBtn="onBuyPackage(p)"
      />
    </template>

    <Spacer :size="24" />

    <RuleSheet
      v-model:visible="ruleVisible"
      :title="ruleTitle"
      :content="ruleContent"
    />
  </scroll-view>
</template>
	
<script setup>
import { ref, onMounted, computed } from 'vue'
import { getMyCoupons } from '@/api/coupon'
import { getAvailableCombos, purchasePackage, useCoupon, giftUserPackage } from '@/api/userCombo'
import TopBar from '@/components/header/TopBar.vue'
import Segment from '@/components/tabs/Segment.vue'
import WalletFoldCard from '@/components/wallet/WalletFoldCard.vue'
import SectionTitle from '@/components/section/Title.vue'
import RuleSheet from '@/components/popup/RuleSheet.vue'
import CouponCard from '@/components/coupon/CouponCard.vue'
import PackageCard from '@/components/package/PackageCard.vue'

const activeTab = ref('coupon')
const walletExpanded = ref(true)
const ruleVisible = ref(false)
const ruleTitle = ref('使用规则')
const ruleContent = ref('')
const availOpen = ref(false)   // 可用套餐：展开/收起

// 钱包数据
const amounts = [
  { label: '可消费', value: '¥ 50.00' },
  { label: '可提现', value: '¥ 0.00' },
  { label: '车辆押金', value: '¥ 800', sub: '（使用中）' },
  { label: '违章押金', value: '¥ 700', sub: '（冻结中）' }
]

// Mock 列表（替换为你的接口数据即可）
const couponList = ref([])
const availablePackages = ref([])
const buyablePackages = ref([])

// API 调用：获取优惠券和套餐数据
onMounted(() => {
  getMyCoupons().then(response => {
    couponList.value = response.data; // 假设 API 返回的是优惠券列表
  })

  getAvailableCombos({ userId: 'currentUserId' }).then(response => {
    availablePackages.value = response.data.availablePackages;
    buyablePackages.value = response.data.buyablePackages;
  })
})

// 计算优惠券和套餐数量
const couponCount = computed(() => couponList.value.length)
const packageCount = computed(() => availablePackages.value.length + buyablePackages.value.length)

// 事件处理函数
function onBack() { uni.navigateBack({ delta: 1 }) }
function goWithdraw() { /* 处理提现 */ }
function goRecharge() { /* 处理充值 */ }
function onShowRule(item) { ruleTitle.value = '使用规则'; ruleContent.value = item.rule || '规则内容'; ruleVisible.value = true }
function onUseCoupon(item) {
  useCoupon(item.id).then(response => {
    if (response.success) {
      // 优惠券使用成功
    }
  })
}
function onShare(item) { /* 分享优惠券 */ }
function onShowPkgRule(item) { ruleTitle.value = '套餐说明'; ruleContent.value = item.rule || '套餐说明内容'; ruleVisible.value = true }
function onUsePackage(item) { /* 使用套餐 */ }
function onSharePackage(item) { giftUserPackage(item.id, 'friendUserId') }  // 送给好友
function onBuyPackage(item) {
  purchasePackage({
    userId: 'currentUserId',
    packageId: item.id,
    price: item.price,
    idempotentKey: 'uniqueOrderNumber'
  }).then(response => {
    if (response.success) {
      // 套餐购买成功
    }
  })
}
</script>

<style scoped>
/* 蓝湖头部：750×290 渐变 */
.header {
  height: 290rpx;
  width: 750rpx;
  background: linear-gradient(180deg, #F66600 0%, #FD9A3D 100%);
  color: #fff;
  padding-top: env(safe-area-inset-top);
  position: relative;
}

/* Tabs 放在渐变底部，配合“微笑线” */
.tabs-on-header { position: absolute; left: 0; right: 0; bottom: 8rpx; }

.page {
  min-height: 100vh;
  background: #F5F6F9;
  padding: 0rpx 20rpx 16rpx;
  box-sizing: border-box;
}

.pkg-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 4rpx 2rpx;
}

.pkg-section-title {
  width: 130rpx;
  font-size: 28rpx;
  color: #444444;
}

.pkg-fold {
  width: 40rpx;
  transition: transform .18s ease;
}

.pkg-fold.open {
  transform: rotate(180deg);
}
</style>
