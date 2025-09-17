<!-- /pages/benefit/index.vue（骨架，保留你现有逻辑名） -->
<template>
  <scroll-view scroll-y class="page">
    <TopBar title="卡券套餐" />
    <TabsPrimary v-model="tab" :items="[{key:'coupon',text:'优惠券'},{key:'pack',text:'套餐'}]"/>

    <!-- 钱包触发条（独立，不占列表） -->
    <WalletTriggerBar :amount-text="`￥${wallet.consumable.toFixed(2)}`" @click="walletSheetVisible=true" />

    <view class="content">
      <view v-if="tab==='coupon'" class="list">
        <CouponCard v-for="it in coupons" :key="it.id" v-bind="mapCoupon(it)"
                    @rule="onShowRule(it)" @cta="onUse(it)" @gift="onGift(it)"/>
      </view>

      <view v-else class="list">
        <SectionHeader text="可用套餐" />
        <PackageCard v-for="it in packs.available" :key="it.id" v-bind="mapPack(it)"
                     @use="onUsePack(it)" @gift="onGiftPack(it)" @desc="onShowDesc(it)"/>
        <DashDivider />
        <SectionHeader text="购买套餐" />
        <PackageCard v-for="it in packs.purchasable" :key="it.id" v-bind="mapPack(it)"
                     @buy="onBuyPack(it)" @gift="onGiftPack(it)" @desc="onShowDesc(it)"/>
      </view>
    </view>

    <!-- 钱包弹窗 -->
    <WalletSheet v-model:visible="walletSheetVisible" :wallet="wallet"
                 @withdraw="onWithdraw" @recharge="onRecharge" />

    <!-- 规则弹层 -->
    <RuleSheet v-model:visible="ruleVisible" title="使用规则" :content="currentRule"/>
  </scroll-view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import CouponCard from '@/components/CouponCard.vue'
import PackageCard from '@/components/PackageCard.vue'
import WalletTriggerBar from '@/components/WalletTriggerBar.vue'
import WalletSheet from '@/components/WalletSheet.vue'
import RuleSheet from '@/components/RuleSheet.vue'
// Mock 直接内嵌；后续替换为接口
import MOCK from '@/mock/benefit.mock.json'

const tab = ref('coupon')
const walletSheetVisible = ref(false)
const ruleVisible = ref(false)
const currentRule = ref('')

const wallet = reactive({consumable:0, withdrawable:0, carDeposit:0, violationDeposit:0})
const coupons = ref([])
const packs = reactive({available:[], purchasable:[]})

onMounted(()=>{
  Object.assign(wallet, MOCK.wallet)
  coupons.value = MOCK.coupons
  Object.assign(packs, MOCK.packs)
})

// 映射函数（以后只改这里对接真实字段）
const mapCoupon = (it)=>({
  amount: it.amount, thresholdText: it.thresholdText, title: it.title,
  subTitle: it.subTitle, expireText: it.expireText, ctaText: it.ctaText,
  status: it.status, showGift: it.showGift
})
const mapPack = (it)=>({
  title: it.title, subTitle: it.subTitle, expireText: it.expireText,
  desc: it.desc, price: it.price, buyable: it.buyable
})

// 交互占位
function onShowRule(it){ currentRule.value = `${it.title}：\n1）仅限指定车型；2）不可叠加；3）到期失效。`; ruleVisible.value=true }
function onUse(){ uni.showToast({title:'使用', icon:'none'}) }
function onGift(){ uni.showToast({title:'已赠送', icon:'none'}) }
function onUsePack(){ uni.showToast({title:'使用套餐', icon:'none'}) }
function onGiftPack(){ uni.showToast({title:'套餐已赠送', icon:'none'}) }
function onBuyPack(){ uni.showToast({title:'已下单购买', icon:'none'}) }
function onShowDesc(){ uni.showToast({title:'套餐说明', icon:'none'}) }
function onWithdraw(){ uni.showToast({title:'提现', icon:'none'}) }
function onRecharge(){ uni.showToast({title:'充值', icon:'none'}) }
</script>

<style scoped>
.page{ background:#F5F6F9; min-height:100vh; }
.content{ padding:24rpx; }
.list{ display:flex; flex-direction:column; gap:24rpx; }
</style>