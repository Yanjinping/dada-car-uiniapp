<!-- <!-- pages/wallet/deposit-pay.vue -->
<template>
  <view class="page">
    <TitleBar title="缴纳押金" background="#FFFFFF" />

    <view class="section">
      <view class="price">押金金额</view>
      <view class="amount">¥{{ amount.toFixed(2) }}</view>
      <view class="desc">说明：押金用于违章/赔付预授权，行程完结后可申请退款。</view>
    </view>

    <button
      class="primary"
      :disabled="loading || paid"
      @tap="openCashier"
    >
      {{ paid ? '已缴纳' : '立即缴纳' }}
    </button>

    <!-- 收银台 -->
    <Cashier
      v-if="cashierVisible"
      :scene="'DEPOSIT'"
      :bizOrderNum="bizOrderNum"
      :defaultAmount="amount"
      :userId="userId"
      :allowMixed="true"
      :visible="cashierVisible"
      :redirectUrl="''"          
      @success="onPaidOk"
      @fail="onPaidFail"
      @update:visible="v => cashierVisible = v"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import Cashier from '@/components/cashier/Cashier.vue'
import { apiGetDepositInfo, apiCreateDepositOrder } from '../../api/deposit'
import { getWalletBalance } from '@/api/pay-sdk'

const userId = ref(0) // 若有登录态 store，这里换成从 store 读取
const loading = ref(false)
const amount = ref(0)
const paid   = ref(false)
const bizOrderNum = ref('')

const cashierVisible = ref(false)

async function preload() {
  try {
    loading.value = true
    // 1) 拉取押金信息（已缴纳/标准金额/旧订单号）
    const info = await apiGetDepositInfo()
    paid.value = !!info?.paid
    amount.value = Number(info?.amount ?? 299)   // 后端返回为准；无则给默认 299
    bizOrderNum.value = info?.bizOrderNum || ''
    // 2) 可选：预热余额
    try { await getWalletBalance() } catch {}
  } finally {
    loading.value = false
  }
}

async function openCashier() {
  if (paid.value) {
    uni.showToast({ title: '已缴纳押金', icon: 'none' })
    return
  }
  // 若没有 bizOrderNum，先向后端要一个押金订单号
  if (!bizOrderNum.value) {
    try {
      uni.showLoading({ title: '创建订单...' })
      const r = await apiCreateDepositOrder({ amount: amount.value })
      uni.hideLoading()
      bizOrderNum.value = r?.bizOrderNum || r?.orderNum || ''
      if (!bizOrderNum.value) {
        uni.showToast({ title: '创建订单失败', icon: 'none' })
        return
      }
    } catch (e) {
      uni.hideLoading()
      uni.showToast({ title: e?.message || '创建订单失败', icon: 'none' })
      return
    }
  }
  cashierVisible.value = true
}

function onPaidOk(e) {
  // e: { scene: 'DEPOSIT', bizOrderNum, txnId, data }
  uni.showToast({ title: '押金已缴纳', icon: 'success' })
  paid.value = true
  setTimeout(() => {
    // 返回押金首页，或刷新本页
    uni.navigateBack({ delta: 1 })
  }, 500)
}

function onPaidFail(err) {
  // 仅当是真的失败才提示；外部 h5 跳转 pending 不打扰
  if (err?.code && ['PENDING_EXTERNAL','USER_CANCEL','NETWORK_OFFLINE'].includes(err.code)) return
  uni.showToast({ title: err?.message || '支付失败', icon: 'none' })
}

onMounted(preload)
</script>

<style scoped>
.page{ min-height:100vh; background:#fff; }
.section{ margin: 24rpx; padding: 30rpx; background:#F8F8F8; border-radius: 16rpx; text-align:center; }
.price{ font-size: 28rpx; color:#666; }
.amount{ font-size: 56rpx; font-weight: 800; margin: 8rpx 0 6rpx; }
.desc{ font-size: 24rpx; color:#999; }

.primary{
  margin: 24rpx; height: 88rpx; line-height: 88rpx;
  background:#FFCC00; color:#333; font-size: 32rpx; font-weight: 700;
  border-radius: 44rpx; border:none;
}
.primary[disabled]{ opacity:.6 }
</style -->>
