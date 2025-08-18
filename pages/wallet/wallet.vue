<!-- pages/wallet/recharge.vue -->
<template>
  <scroll-view scroll-y class="page">
	  <!-- 顶部导航（自定义） -->
	  <TitleBar title="嗒嗒钱包" background="transparent">
	      <!-- 右侧可放占位或图标 -->
	      <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
	    </TitleBar>
    <!-- 顶部 HERO（背景 + 自定义导航 + 卡片） -->
    <view class="hero">
      <view class="hero-bg"></view>
      <!-- 余额卡 -->
      <view class="wallet-card">
        <view class="wallet-hd">
          <view class="hd-left">
            <text class="hd-caption">账户余额</text>
            <view class="hd-amt">
              <text class="hd-cny">￥</text>
              <text class="hd-num">{{ fmt(balance) }}</text>
            </view>
          </view>
          <view class="hd-detail" @click="goDetail">
            <text class="detail-txt">明细</text>
            <text class="detail-arrow">›</text>
          </view>
        </view>

        <view class="wallet-info">
          <view class="info-col">
            <view class="info-num">￥{{ fmt(withdrawable) }}</view>
            <view class="info-label">可提现</view>
            <view class="info-sub">&nbsp;</view>
          </view>
          <view class="info-col">
            <view class="info-num">￥{{ fmt(carDeposit) }}</view>
            <view class="info-label">车辆押金</view>
            <view class="info-sub">（使用中）</view>
          </view>
          <view class="info-col">
            <view class="info-num">￥{{ fmt(violationDeposit) }}</view>
            <view class="info-label">违章押金</view>
            <view class="info-sub">（冻结中）</view>
          </view>
        </view>
      </view>
    </view>

    <view class="container">
      <view class="section-title">充值金额</view>

      <!-- 三列金额宫格 -->
      <view class="amount-grid">
        <view
          v-for="(opt, idx) in presetAmounts"
          :key="idx"
          class="amount-item"
          :class="{ active: isSelectedPreset(opt) }"
          @click="selectPreset(opt)"
        >
          <view class="a-line">
            <text class="a-cny">￥</text>
            <text class="a-num">{{ opt.amount }}</text>
          </view>
          <view v-if="opt.bonus" class="a-bonus">送{{ opt.bonus }}</view>
        </view>
      </view>

      <!-- 自定义金额：一行 -->
      <view class="custom-row">
        <text class="custom-label">自定义金额</text>
        <view class="custom-input">
          <input
            type="digit"
            v-model="customAmount"
            placeholder="请输入金额"
            @focus="clearPreset"
            @input="onCustomInput"
          />
        </view>
      </view>

      <!-- 协议（对勾对称居中） -->
      <view class="agreement" @click="toggleAgree">
        <view class="check">
          <view class="check-bg"></view>
          <view v-if="agreed" class="check-tick"></view>
        </view>
        <view class="agree-text">
          充值后金额不可提现和退款，确认充值即代表您同意
          <text class="agree-link" @click.stop="openTopUpTerms">《充值协议》</text>
        </view>
      </view>

      <!-- 主按钮（加粗一点） -->
      <button
        class="primary-btn"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        @click="onRecharge"
      >
        确认充值
      </button>

      <!-- 充值记录（可选） -->
      <view class="history-card" v-if="rechargeHistory.length">
        <view class="h-title">最近充值记录</view>
        <view class="h-list">
          <view class="h-item" v-for="(r, i) in rechargeHistory" :key="i">
            <view class="h-amt">+￥{{ r.amount }}</view>
            <view class="h-meta">
              <text class="h-date">{{ r.date }}</text>
              <text class="h-method">{{ r.method }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllBalances,recharge } from '@/api/wallet.js'
import TitleBar from '@/components/header/TitleBar.vue'

const userId = uni.getStorageSync('userId') || 1
const balance = ref(0)
const withdrawable = ref(0)
const carDeposit = ref(0)
const violationDeposit = ref(0)

const presetAmounts = ref([
  { amount: 50, bonus: 0 },
  { amount: 100, bonus: 30 },
  { amount: 200, bonus: 70 },
  { amount: 300, bonus: 120 },
  { amount: 500, bonus: 180 },
  { amount: 1000, bonus: 200 }
])
const selectedAmount = ref(50)
const customAmount = ref('')
const agreed = ref(true)
const rechargeHistory = ref([])

const fmt = (n) => Number(n || 0).toFixed(2)
const isSelectedPreset = (opt) => selectedAmount.value === opt.amount && !customAmount.value
const effectiveAmount = computed(() => customAmount.value ? Number(customAmount.value) || 0 : Number(selectedAmount.value || 0))
const canSubmit = computed(() => agreed.value && effectiveAmount.value > 0)

function selectPreset(opt){ selectedAmount.value = opt.amount; customAmount.value = '' }
function clearPreset(){ selectedAmount.value = 0 }
function onCustomInput(e){
  const v = (e?.detail?.value ?? customAmount.value).replace(/[^\d.]/g, '')
  const parts = v.split('.'); customAmount.value = parts.length>1 ? `${parts[0]}.${(parts[1]||'').slice(0,2)}` : parts[0]
}
function toggleAgree(){ agreed.value = !agreed.value }
function openTopUpTerms(){ uni.navigateTo({ url: '/pages/webview/index?url=https%3A%2F%2Fexample.com%2Ftopup-terms' }) }
function goDetail(){ uni.navigateTo({ url: '/pages/wallet/detail' }) }
function goBack(){ uni.navigateBack({ delta: 1 }) }

async function fetchWalletInfo(){
  try{
    const resp = await getAllBalances({ userId })
    const data = resp?.data || {}
    balance.value          = Number(data.accountBalance || 0)
    withdrawable.value     = Number(data.withdrawable || 0)
    carDeposit.value       = Number(data.deposit || data.carDeposit || 0)
    violationDeposit.value = Number(data.violationDeposit || 0)
  }catch(e){
    uni.showToast({ title: '余额加载失败', icon: 'none' })
  }
}

async function onRecharge(){
  if(!canSubmit.value) return
  const params = { userId, moneyType: 'accountBalance', amount: effectiveAmount.value }
  try{
    uni.showLoading({ title: '充值中...' })
    await recharge(params)
    await fetchWalletInfo()
    const now = new Date()
    rechargeHistory.value.unshift({
      amount: effectiveAmount.value,
      date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      method: '在线支付'
    })
    uni.showToast({ title: `充值成功 ¥${effectiveAmount.value}`, icon: 'success' })
  }catch(e){
    uni.showToast({ title: '充值失败', icon: 'error' })
  }finally{
    uni.hideLoading()
  }
}

onMounted(fetchWalletInfo)
</script>

<style lang="scss" scoped>
/* 页面背景 */
.page{ background: linear-gradient(180deg,#E9FFF6 0%,#F6F9FF 100%); min-height:100vh; }

/* HERO：背景 + 导航 + 卡片 */
.hero{ position:relative; height: 400rpx; }
.hero-bg{ position:absolute; inset:0; background: linear-gradient(180deg,#DFF7EE 0%, #EAF7FF 100%); }

/* 自定义导航（只保留一个返回） */
.nav{ position:absolute; left:0; right:0; top:0; height:88rpx; display:flex; align-items:center; z-index:2; }
.nav-back{ width:100rpx; font-size:44rpx; text-align:left; padding-left:20rpx; }
.nav-title{ flex:1; text-align:center; font-size:36rpx; font-weight:600; color:#333; }
.nav-right{ width:100rpx; }

/* 余额卡 */
.wallet-card{
  position:absolute; left:30rpx; right:30rpx; bottom: 24rpx;
  border-radius:24rpx; overflow:hidden; z-index:1;
  box-shadow: 0 16rpx 40rpx rgba(0,0,0,.08);
}
.wallet-hd{
  background: linear-gradient(180deg,#1DC46E 0%,#3ACD99 100%);
  padding: 20rpx 24rpx; color:#FFF4DC; display:flex; align-items:center;
}
.hd-left{ display:flex; flex-direction:column; gap:6rpx; }
.hd-caption{ font-size:28rpx; color:#FFF4DC; }
.hd-amt{ display:flex; align-items:flex-end; gap:8rpx; }
.hd-cny{ font-size:32rpx; font-weight:700; }
.hd-num{ font-size:48rpx; font-weight:700; }
.hd-detail{ margin-left:auto; display:flex; align-items:center; gap:8rpx; color:#fff; }
.detail-txt{ font-size:30rpx; }
.detail-arrow{ font-size:32rpx; }

/* 白色信息区：第二行状态居中 */
.wallet-info{
  background:#fff; padding: 14rpx 10rpx 18rpx;
  display:flex; justify-content:space-between; text-align:center;
}
.info-col{ width:33.33%; }
.info-num{ font-size:32rpx; line-height:48rpx; color:rgba(27,189,67,0.5); font-weight:700; }
.info-label{ font-size:28rpx; color:#666; line-height:36rpx; }
.info-sub{ font-size:24rpx; color:#888; line-height:36rpx; }

/* 主内容 */
.container{ padding: 0 30rpx 40rpx; }
.section-title{ margin: 26rpx 0 18rpx; font-size:32rpx; color:#444; }

/* 三列金额宫格 */
.amount-grid{ display:grid; grid-template-columns: repeat(3, 1fr); column-gap: 18rpx; row-gap: 18rpx; }
.amount-item{
  height: 152rpx; border-radius:24rpx; background:#fff; color:#FF7009; border:2rpx solid #FFD9C2;
  display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
}
.amount-item.active{
  background: linear-gradient(180deg,#FF8A3D 0%,#FF7300 100%); color:#fff; border-color: transparent;
  box-shadow: 0 8rpx 24rpx rgba(255,115,0,.25);
}
.a-line{ display:flex; align-items:flex-end; gap:6rpx; }
.a-cny{ font-size:28rpx; font-weight:700; }
.a-num{ font-size:48rpx; font-weight:700; line-height:60rpx; }
.a-bonus{ margin-top:4rpx; font-size:26rpx; line-height:36rpx; color:#FF8F63; }
.amount-item.active .a-bonus{ color:#FFEBDD; }

/* 自定义金额：一行 */
.custom-row{ margin-top: 26rpx; display:flex; align-items:center; gap:16rpx; }
.custom-label{ white-space:nowrap; font-size:30rpx; color:#666; }
.custom-input{ flex:1; height:84rpx; border-radius:16rpx; background:#fff; border:2rpx solid #F6D4C7; padding:0 20rpx; display:flex; align-items:center; }
.custom-input input{ width:100%; font-size:30rpx; }

/* 协议（对勾对称居中） */
.agreement{ margin-top:24rpx; display:flex; align-items:center; gap:16rpx; }
.check{ width:36rpx; height:36rpx; position:relative; }
.check-bg{ width:36rpx; height:36rpx; background:#1BBD43; border-radius:50%; }
.check-tick{
  position:absolute; top:50%; left:50%;
  width:20rpx; height:12rpx; border-left:4rpx solid #fff; border-bottom:4rpx solid #fff;
  transform: translate(-50%,-50%) rotate(-45deg);   /* ——关键：绝对居中 + 旋转 */
}
.agree-text{ flex:1; color:#444; font-size:28rpx; line-height:40rpx; }
.agree-link{ color:#1BBD43; }

/* 主按钮（加粗一点） */
.primary-btn{
  margin: 28rpx 0 8rpx; width: 688rpx; height: 96rpx; border-radius: 48rpx;
  background: linear-gradient(360deg,#F66600 0%,#FD9A3D 100%);
  color:#fff; font-size:40rpx; font-weight:700;         /* 从 500 提到 700 */
  display:flex; align-items:center; justify-content:center;
}
.primary-btn.disabled{ opacity:.7; }

/* 充值记录 */
.history-card{ margin-top: 24rpx; background:#fff; border-radius:16rpx; padding:16rpx 20rpx; }
.h-title{ font-size:28rpx; color:#333; margin-bottom:8rpx; }
.h-list .h-item{ display:flex; justify-content:space-between; padding:12rpx 0; border-bottom:1rpx solid #f0f0f0; }
.h-list .h-item:last-child{ border-bottom:0; }
.h-amt{ color:#FF4500; font-weight:600; }
.h-meta{ text-align:right; color:#666; font-size:24rpx; }
.h-method{ margin-left:8rpx; color:#888; }
</style>
