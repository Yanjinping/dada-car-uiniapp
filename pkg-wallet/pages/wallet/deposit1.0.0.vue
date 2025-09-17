<!-- pages/wallet/deposit.vue -->
<template>
  <view class="page">
    <TitleBar title="押金管理" background="#FFFFFF" />

    <scroll-view scroll-y class="body">

      <!-- 分时押金 -->
      <view class="card card-green" @click="goPayDeposit">
        <view class="card-left">
          <text class="c-title">分时押金</text>
          <text class="c-sub">
            {{
              depositInfo.paid
                ? `已缴纳：¥${Number(depositInfo.amount || 0).toFixed(2)}`
                : `查询违章倒数天数： ${timeDepositDays} 工作日`
            }}
          </text>
        </view>
        <view class="card-right">
          <text class="cta">{{ depositInfo.paid ? '去退款' : '去缴纳' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 芝麻免押 -->
      <view class="card card-blue" @click="handleSesameAction">
        <view class="card-left">
          <text class="c-title">芝麻免押</text>
          <text class="c-sub">
            {{
              sesame.auth
                ? `已授权（自动结算倒数：${sesameDays} 工作日）`
                : `未授权，授权后可免缴押金`
            }}
          </text>
        </view>
        <view class="card-right">
          <text class="cta">{{ sesame.auth ? '解除授权' : '去授权' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="tips">
        <view class="tips-hd">
          <view class="line"></view>
          <text class="tips-title">温馨提示</text>
          <view class="line"></view>
        </view>
        <text class="tips-txt">分时押金和芝麻免押，只需满足一项均可用车</text>
      </view>

    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import {
  apiGetDepositInfo,
  apiRefundDeposit,
  apiGetSesameStatus,
  apiStartSesameAuth,
  apiCancelSesameAuth
} from '../../api/deposit'

const timeDepositDays = ref(30)
const sesameDays = ref(45)

const depositInfo = ref({ paid: false, amount: 0, bizOrderNum: '' })
const sesame = ref({ auth: false })

async function refreshAll() {
  try {
    const d = await apiGetDepositInfo()
    depositInfo.value = {
      paid: !!d?.paid,
      amount: d?.amount ?? 0,
      bizOrderNum: d?.bizOrderNum ?? ''
    }
  } catch { /* ignore */ }

  try {
    const z = await apiGetSesameStatus()
    sesame.value = { auth: !!z?.authorized }
  } catch { /* ignore */ }
}

function goPayDeposit() {
  if (depositInfo.value.paid) {
    // 已缴纳：引导退款
    uni.showModal({
      title: '申请退款',
      content: `已缴纳押金 ¥${Number(depositInfo.value.amount || 0).toFixed(2)}，确定要申请退款吗？`,
      success: async (r) => {
        if (!r.confirm) return
        try {
          uni.showLoading({ title: '提交中...' })
          await apiRefundDeposit()
          uni.hideLoading()
          uni.showToast({ title: '已提交退款申请', icon: 'success' })
          setTimeout(refreshAll, 500)
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: e?.message || '退款失败', icon: 'none' })
        }
      }
    })
    return
  }
  // 未缴纳：去缴纳页
  uni.navigateTo({ url: '/pages/wallet/deposit-pay' })
}

async function handleSesameAction() {
  if (sesame.value.auth) {
    // 解除授权
    uni.showModal({
      title: '解除授权',
      content: '解除后将不再享受免押，请确认是否继续？',
      success: async (r) => {
        if (!r.confirm) return
        try {
          uni.showLoading({ title: '处理中...' })
          await apiCancelSesameAuth()
          uni.hideLoading()
          uni.showToast({ title: '已解除授权', icon: 'success' })
          setTimeout(refreshAll, 300)
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
        }
      }
    })
  } else {
    // 发起授权（H5/小程序：后端返回跳转链接 / scheme）
    try {
      uni.showLoading({ title: '跳转中...' })
      const r = await apiStartSesameAuth()
      uni.hideLoading()
      const url = r?.url
      if (url) {
        // 交由系统打开
        // 小程序/H5/App 各端已经在你 Cashier 里有类似处理；这里简单处理
        // H5
        if (typeof window !== 'undefined') {
          window.location.href = url
        } else {
          uni.navigateTo({ url: `/pages/common/web?url=${encodeURIComponent(url)}` })
        }
      } else {
        uni.showToast({ title: '未拿到跳转链接', icon: 'none' })
      }
    } catch (e) {
      uni.hideLoading()
      uni.showToast({ title: e?.message || '授权失败', icon: 'none' })
    }
  }
}

onMounted(refreshAll)
</script>

<style scoped>
.page{ background:#FFFFFF; min-height:100vh; }
.body{ height: calc(100vh - 100rpx); padding: 28rpx; box-sizing: border-box; }

.card{
  min-height:176rpx; padding:32rpx 34rpx; border-radius:24rpx;
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:28rpx; color:#fff; box-shadow:0 8rpx 24rpx rgba(0,0,0,0.08);
}
.card-green{ background:#22B46E; }
.card-blue{  background:#0A94F5; }

.card-left{ max-width:72%; }
.c-title{ display:block; font-size:40rpx; font-weight:800; letter-spacing:1rpx; }
.c-sub{ margin-top:10rpx; font-size:28rpx; opacity:.95; }

.card-right{ display:flex; align-items:center; gap:10rpx; }
.cta{ font-size:30rpx; font-weight:700; }
.arrow{ font-size:44rpx; margin-left:2rpx; }

.tips{ padding:24rpx 8rpx; margin-top:20rpx; text-align:center; }
.tips-hd{ display:flex; align-items:center; gap:24rpx; justify-content:center; margin-bottom:16rpx; }
.line{ width:180rpx; height:2rpx; background:#DBDBDB; border-radius:2rpx; }
.tips-title{ font-size:30rpx; color:#444; font-weight:700; }
.tips-txt{ display:block; margin-top:16rpx; font-size:26rpx; color:#666; }
</style>
