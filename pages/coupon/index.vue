<!-- pages/coupon/index.vue — 优惠券 & 套餐选择（可回传并自动定位） -->
<template>
  <!-- 头部渐变 -->
  <view class="header">
    <TitleBar title="卡券套餐" background="transparent" />
    <view class="tabs-on-header">
      <Segment
        :items="[
          { key: 'coupon',  text: `优惠券(${couponCount})` },
          { key: 'package', text: `套餐(${packageCount})` },
        ]"
        v-model:active="activeTab"
        @change="onTabChange"
      />
    </view>
  </view>

  <!-- 钱包 -->
  <WalletFoldCard
    v-model:expanded="walletExpanded"
    :spendable="amounts[0].value"
    :withdrawable="amounts[1].value"
    :depositCar="amounts[2].value"
    :depositIllegal="amounts[3].value"
    @withdraw="goWithdraw"
    @recharge="goRecharge"
  />

  <!-- 页面滚动内容（支持锚点定位） -->
  <scroll-view
    scroll-y
    class="page"
    :scroll-into-view="scrollInto"
    :enhanced="true"
    :show-scrollbar="false"
  >
    <!-- 优惠券 Tab -->
    <template v-if="activeTab === 'coupon'">
      <!-- 锚点：优惠券 -->
      <view :id="IDS.couponAnchor"></view>

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

    <!-- 套餐 Tab -->
    <template v-else>
      <!-- 锚点：套餐 -->
      <view :id="IDS.packageAnchor"></view>

      <!-- 可用套餐（可折叠） -->
      <view class="pkg-section-head" @tap="availOpen = !availOpen">
        <text class="pkg-section-title">可用套餐</text>
        <image class="pkg-fold" src="/static/benefit/zhedie.png" mode="widthFix" :class="{ open: availOpen }" />
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

    <RuleSheet v-model:visible="ruleVisible" :title="ruleTitle" :content="ruleContent" />
  </scroll-view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow, onReady } from '@dcloudio/uni-app'

import TitleBar from '@/components/header/TitleBar.vue'
import Segment from '@/components/tabs/Segment.vue'
import WalletFoldCard from '@/components/wallet/WalletFoldCard.vue'
import SectionTitle from '@/components/section/Title.vue'
import RuleSheet from '@/components/popup/RuleSheet.vue'
import CouponCard from '@/components/coupon/CouponCard.vue'
import PackageCard from '@/components/package/PackageCard.vue'
import Spacer from '@/components/common/Spacer.vue'  // 

/* ---------------------------------- state ---------------------------------- */
const activeTab = ref('coupon')
const walletExpanded = ref(false)
const ruleVisible = ref(false)
const ruleTitle = ref('使用规则')
const ruleContent = ref('')
const availOpen = ref(true) // 可用套餐 折叠

const IDS = {
  couponAnchor: 'coupon-anchor',
  packageAnchor: 'package-anchor',
}
const scrollInto = ref('') // 给 scroll-view 的 scroll-into-view


const props = defineProps({
  carId: [String, Number],
  isPayment: { type: [Boolean, String], default: false },
  defaultTab: { type: String, default: 'coupon' }, // 'coupon' | 'package' | 'combo'
})

// 钱包数据（示例）
const amounts = [
  { label: '可消费', value: '¥ 50.00' },
  { label: '可提现', value: '¥ 0.00' },
  { label: '车辆押金', value: '¥ 800', sub: '（使用中）' },
  { label: '违章押金', value: '¥ 700', sub: '（冻结中）' },
]

// 列表（替换为接口数据即可）
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
  { id: 'p4', price: 79.99, title: '一日游免里程套餐', subTitle: '所有车型通用',  expireText: '2025.08.11 23:59:59到期' }
])

const couponCount  = computed(() => couponList.value.length)
const packageCount = computed(() => availablePackages.value.length + buyablePackages.value.length)

/* --------------------------- navigation & anchors -------------------------- */
function applyDefaultTab(tab){
  // 兼容传值：coupon | package | combo
  if (tab === 'coupon' || tab === 'package' || tab === 'combo') {
    activeTab.value = (tab === 'combo') ? 'package' : tab
  }
  // 切到对应锚点
  nextTickScroll()
}
function nextTickScroll(){
  // 延后一帧让节点挂载完成
  setTimeout(()=>{
    scrollInto.value = activeTab.value === 'coupon' ? IDS.couponAnchor : IDS.packageAnchor
    // 连续设置两次可以更稳（小程序偶发第一次不滚）
    setTimeout(()=>{ scrollInto.value = activeTab.value === 'coupon' ? IDS.couponAnchor : IDS.packageAnchor }, 10)
  }, 10)
}
function onTabChange(){
  nextTickScroll()
}

/* --------------------------------- events --------------------------------- */
function onShowRule(item){
  ruleTitle.value = '使用规则'
  ruleContent.value = item.rule || '1）限指定车型；2）到期自动失效；3）部分活动不可叠加；4）以下单页为准。'
  ruleVisible.value = true
}
function onShowPkgRule(item){
  ruleTitle.value = '套餐说明'
  ruleContent.value = item.rule || '• 套餐内免里程；• 有效期以页面为准；• 不可与部分活动叠加'
  ruleVisible.value = true
}

/** 回传到上页（订单页）：同时用 eventChannel & 全局事件两种方式，保证接收 */
function emitBack(eventName, payload){
  // 1) 全局事件（你的订单页有 uni.$on('selectCoupon'/'selectCombo')）
  uni.$emit(eventName, payload)
  // 2) eventChannel
  try{
    const ec = uni.getOpenerEventChannel && uni.getOpenerEventChannel()
    ec && ec.emit(eventName, payload)
  }catch(e){}
  // 返回上一页
  uni.navigateBack({ delta: 1 })
}

/* 使用优惠券：带回 id/name/discountAmount */
function onUseCoupon(c){
  emitBack('selectCoupon', {
    couponId: c.id,
    name: c.title,
    discountAmount: c.amount
  })
}
function onShare(){ /* 分享 */ }

/* 使用套餐（可用区） */
function onUsePackage(p){
  emitBack('selectCombo', {
    comboId: p.id,
    comboRent: p.price,
    remarks: p.title
  })
}
/* 购买套餐（购买区）：按照你的需求，直接作为“选中并返回”处理
   若要跳到详情页购买，再由详情页 emitBack('selectCombo', ...) 即可 */
function onBuyPackage(p){
  emitBack('selectCombo', {
    comboId: p.id,
    comboRent: p.price,
    remarks: p.title
  })
}

function goWithdraw(){ /* TODO 提现 */ }
function goRecharge(){ /* TODO 充值 */ }

/* ----------------------------------- init ---------------------------------- */
onLoad((options)=>{
  // 打开页面时，支持 ?defaultTab=coupon|package|combo
  applyDefaultTab(options?.defaultTab || 'coupon')
})
onShow(()=>{
  // 从其他页回来后再次对齐锚点（避免偶发回到顶部）
  nextTickScroll()
})
</script>

<style scoped>
/* 头部渐变：750×290，#F66600 -> #FD9A3D */
.header{
  height: 290rpx; width: 750rpx;
  background: linear-gradient(180deg, #F66600 0%, #FD9A3D 100%);
  color: #fff; padding-top: env(safe-area-inset-top);
  position: relative;
}
.tabs-on-header{ position:absolute; left:0; right:0; bottom:8rpx; }

/* 页面主体 */
.page{
  min-height: 100vh;
  background: #F5F6F9;
  padding: 0 20rpx 16rpx;
  box-sizing: border-box;
}

/* 可用套餐 折叠头 */
.pkg-section-head{
  display:flex; align-items:center; justify-content:space-between;
  padding: 14rpx 4rpx 2rpx;
}
.pkg-section-title{
  font-weight:600; font-size:28rpx; color:#444; line-height:44rpx;
}
.pkg-fold{
  width:40rpx;
  transition: transform .18s ease;
}
.pkg-fold.open{ transform: rotate(180deg); }
</style>
