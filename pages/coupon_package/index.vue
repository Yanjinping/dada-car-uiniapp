<template>
  <!-- 顶部渐变区（蓝湖：750×290，#F66600 -> #FD9A3D） -->
  <view class="header">
    <TopBar title="卡券套餐" :showBack="true" @back="onBack" />
    <!-- <Actions :more="true" :scan="true" @more="onMore" @scan="onScan" /> -->

    <!-- Tabs 放在渐变里，白色文字 -->
    <view class="tabs-on-header">
      <Segment
        :items="[
          { key: 'coupon', text: `优惠券(${couponCount})` },
          { key: 'package', text: `套餐(${packageCount})` },
        ]"
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
    <!-- 钱包卡片：用负 margin 贴到渐变底部 -->

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
		<!-- 标题行：可用套餐 + 折叠图标 -->
		<view class="pkg-section-head" @tap="availOpen = !availOpen">
		  <text class="pkg-section-title">可用套餐</text>
		  <image
		    class="pkg-fold"
		    src="/static/benefit/zhedie.png"    
		    mode="widthFix"
		    :class="{ open: availOpen }"        
		  />
		</view>

      <!-- <SectionTitle text="可用套餐" /> -->
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
import { ref, computed } from 'vue'
import TopBar from '@/components/header/TopBar.vue'
import Actions from '@/components/header/Actions.vue'
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
const couponList = ref([
  { id: 1, amount: 10, thresholdText: '满39.99元可用', title: '新用户注册10元券', subTitle: '限四座车可用', expireText: '2025.08.11 23:59:59到期', ctaText: '立即使用', status: 'available' },
  { id: 2, amount: 20, thresholdText: '满79.99元可用', title: '大学生暑价（四座一日游大学生）', subTitle: '限四座车可用', expireText: '2025.08.11 23:59:59到期', ctaText: '立即使用', status: 'available', shareable: true },
  { id: 3, amount: 99, thresholdText: '满1500元可用', title: '长途优惠券（所有车型通用）', subTitle: '限四座车可用', expireText: '2025.08.11 23:59:59到期', ctaText: '立即使用', status: 'available', shareable: true },
  { id: 4, amount: 10, thresholdText: '满39.99元可用', title: '七夕优惠券（所有车型通用）', subTitle: '所有车型通用', expireText: '2025.08.29 - 2025.09.05', ctaText: '订阅提醒', status: 'disabled', disabledReason: '活动未开始' }
])

const availablePackages = ref([
  { id: 'p1', price: 19.99, title: '三小时免里程套餐', subTitle: '限四座车可用', expireText: '2025.08.11 23:59:59到期' },
  { id: 'p2', price: 29.99, title: '五小时免里程套餐', subTitle: '限四座车可用', expireText: '2025.08.11 23:59:59到期' }
])
const buyablePackages = ref([
  { id: 'p3', price: 49.99, title: '十二小时内免里程套餐', subTitle: '限五座车可用', expireText: '2025.08.11 23:59:59到期' },
  { id: 'p4', price: 79.99, title: '一日游免里程套餐', subTitle: '所有车型通用', expireText: '2025-08-11 23:59:59到期' }
])

const couponCount = computed(() => couponList.value.length)
const packageCount = computed(() => availablePackages.value.length + buyablePackages.value.length)

// 事件（保留你原有逻辑即可）
function onBack(){ uni.navigateBack({delta:1}) }
function onMore(){ /* ... */ }
function onScan(){ /* ... */ }
function goWithdraw(){ /* 提现 */ }
function goRecharge(){ /* 充值 */ }
function onShowRule(item){ ruleTitle.value='使用规则'; ruleContent.value=item.rule||'1）限指定车型；2）到期自动失效；3）部分活动不可叠加；4）以下单页为准。'; ruleVisible.value=true }
function onUseCoupon(item){ uni.navigateTo({ url: `/pages/confirm-order/index?couponId=${item.id}` }) }
function onShare(item){ /* 分享 */ }
function onShowPkgRule(item){ ruleTitle.value='套餐说明'; ruleContent.value=item.rule||'• 套餐内免里程；• 有效期以页面为准；• 不可与部分活动叠加'; ruleVisible.value=true }
function onUsePackage(item){ /* 使用套餐 */ }
function onSharePackage(item){ /* 送好友 */ }
function onBuyPackage(item){ /* 购买套餐 */ }
</script>

<style scoped>
/* 蓝湖头部：750×290 渐变 */
.header{
  height: 290rpx;
  width: 750rpx;
  background: linear-gradient(180deg, #F66600 0%, #FD9A3D 100%);
  color: #fff;
  padding-top: env(safe-area-inset-top);
  position: relative;
}

/* Tabs 放在渐变底部，配合“微笑线” */
.tabs-on-header{ position:absolute; left:0; right:0; bottom:8rpx; }

/* 页面主体更紧凑 */
.page{
  min-height: 100vh;
  background: #F5F6F9;
  padding: 0rpx 20rpx 16rpx;  /* 更近似蓝湖的密度 */
  box-sizing: border-box;
}

.pkg-section-head{
  display:flex; align-items:center; justify-content:space-between;
  padding: 14rpx 4rpx 2rpx;
}
.pkg-section-title{
   width: 130rpx;
   height: 28rpx;
   font-family: 'AlibabaPuHuiTi-Regular', 'AlibabaPuHuiTi', sans-serif;
   font-weight: 600;
   font-size: 28rpx;
   color:#444444;
   line-height: 44rpx;
}


.pkg-fold{
  width: 40rpx;   /* 蓝湖 zhedie 切图尺寸 */
  transition: transform .18s ease;
}
/* 展开时箭头朝上（或你喜欢的方向） */
.pkg-fold.open{
  transform: rotate(180deg);
}

</style>
