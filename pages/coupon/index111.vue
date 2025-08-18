	<template>
	  <view class="container">
	    <!-- 🪙 钱包区域 -->
	    <view class="wallet-section" @click="toggleWallet">
	      <view class="wallet-collapsed" v-if="!walletExpanded">
	        <view class="wallet-summary">
	          <text class="wallet-icon">💰</text>
	          <text class="wallet-title">嗒嗒钱包</text>
	          <text class="wallet-amount">¥{{formatMoney(consumableBalance)}}</text>
	        </view>
	        <text class="expand-icon">▼</text>
	      </view>
	
	      <view class="wallet-expanded" v-else>
	        <view class="wallet-header">
	          <text class="wallet-title">嗒嗒钱包</text>
	          <text class="expand-icon">▲</text>
	        </view>
	
	        <view class="balance-info">
	          <view class="balance-row" v-for="(label, key) in balanceMap" :key="key">
	            <text class="balance-label">{{ label }}</text>
				<text class="balance-amount">¥{{ Number(balanceValue(key)).toFixed(2) }}</text>
	          </view>
	        </view>
	
	        <view class="deposit-info">
	          <view class="deposit-row">
	            <text class="deposit-label">车辆押金</text>
	            <text class="deposit-amount">¥{{ formatMoney(carDeposit) }}</text>
	            <text :class="['deposit-status', { refundable: carDepositRefundable }]">
	              {{ carDepositRefundable ? '可退' : '使用中' }}
	            </text>
	          </view>
	          <view class="deposit-row">
	            <text class="deposit-label">违章押金</text>
	            <text class="deposit-amount">¥{{ formatMoney(violationDeposit)   }}</text>
	            <text :class="['deposit-status', { refundable: violationDepositRefundable }]">
	              {{ violationDepositRefundable ? '可退' : '冻结中' }}
	            </text>
	          </view>
	        </view>
	
	        <view class="wallet-actions">
	          <button class="wallet-btn recharge" @click.stop="goRecharge">充值</button>
	          <button class="wallet-btn withdraw" @click.stop="goWithdraw">提现</button>
	        </view>
	      </view>
	    </view>
	
	    <!-- 🎫 优惠券 & 套餐卡 tab 区域 -->
	    <view class="coupon-section">
	      <view class="tabs">
	        <view class="tab" :class="{ active: activeTab === 'coupon' }" @click="switchTab('coupon')">
	          <text class="tab-icon">🎟️</text> 优惠券({{ coupons.length }})
	        </view>
	        <view class="tab" :class="{ active: activeTab === 'combo' }" @click="switchTab('combo')">
	          <text class="tab-icon">🛒</text> 套餐卡({{ combos.length }})
	        </view>
	      </view>
	
	      <view class="content">
	        <!-- 🎟️ 优惠券列表 -->
	        <view v-show="activeTab === 'coupon'" class="coupon-list">
	          <view
	            v-for="(coupon, index) in coupons"
	            :key="index"
	            class="coupon-item"
	            :style="{ 'background-image': 'linear-gradient(135deg, #aaff7f, #FF4500)' }"
	          >
	            <view v-if="coupon.tag" class="coupon-tag">{{ coupon.tag }}</view>
	            <view class="coupon-content">
	              <view class="coupon-value">¥{{ coupon.discountAmount }}</view>
	              <view class="coupon-detail">
	                <view class="coupon-title">
	                  {{ coupon?.name || '无标题' }}
	                  <span class="coupon-type">({{ getCouponTypeName(coupon.type) }})</span>
	                </view>
	                <view class="coupon-condition">使用条件：满 {{ coupon.useCondition }} 元可用</view>
	                <view class="coupon-validity">失效时间：{{ formatDate(coupon.invalidTime) || '长期有效' }}</view>
	              </view>
	            </view>
	            <image class="coupon-image" :src="coupon.image || ''" mode="aspectFit"></image>
	            <view class="coupon-actions">
	              <button class="btn-share" @click.stop="shareCoupon(coupon)">送给好友</button>
	              <button class="btn-use" @click.stop="useCoupon(coupon)">立即使用</button>
	            </view>
	          </view>
	        </view>
	
	        <!-- 🛒 套餐卡列表 -->
	        <view v-show="activeTab === 'combo'" class="coupon-list">
	          <!-- 已拥有套餐 -->
	          <view
	            v-for="(combo, index) in formattedCombos"
	            :key="combo.id"
	            class="coupon-item"
	            :style="{ 'background-image': 'linear-gradient(135deg, #aaff7f, #FF4500)' }"
	          >
	            <view v-if="combo.tag" class="coupon-tag">{{ combo.tag }}</view>
	            <view class="coupon-content">
	              <view class="coupon-value">¥{{ combo.comboPrice }}</view>
	              <view class="coupon-detail">
	                <view class="coupon-title">{{ combo.remarks }}</view>
	                <view class="coupon-condition">剩余使用时长：{{ combo.remainingHours }} 小时</view>
	                <view class="coupon-validity">失效时间：{{ formatDate(combo.expiryTime) || '长期有效' }}</view>
	              </view>
	            </view>
	            <image class="coupon-image" :src="combo.image || ''" mode="aspectFit"></image>
	            <view class="coupon-actions">
	              <button class="btn-share" @click.stop="shareCoupon(combo)">分享套餐</button>
	              <button class="btn-use" @click.stop="useCombo(combo)">去使用</button>
	            </view>
	          </view>
	
	          <!-- 可购买套餐 -->
	          <view
	            v-for="(combo, index) in availableCombos"
	            :key="index"
	            class="coupon-item"
	            :style="{ 'background-image': 'linear-gradient(135deg, #aaff7f, #FF4500)' }"
	          >
	            <view class="coupon-tag">套餐说明</view>
	            <view class="coupon-content">
	              <view class="coupon-value">¥{{ combo.price }}</view>
	              <view class="coupon-detail">
	                <view class="coupon-title">{{ combo.packageName }}</view>
	                <view class="coupon-condition">套餐免费时长：{{ combo.free_hours }} 小时</view>
	                <view class="coupon-validity">适用车型：{{ combo.carType || '不限' }}</view>
	              </view>
	            </view>
	            <image class="coupon-image" :src="combo.image || ''" mode="aspectFit"></image>
	            <view class="coupon-actions">
	              <button class="btn-share" @click.stop="buyCoupon(combo)">一键购买</button>
	            </view>
	          </view>
	        </view>
	      </view>
	    </view>
	  </view>
	</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

import { recharge, applyWithdraw } from '@/api/index.js'
import {getUserCombos,getAvailableCombos} from '@/api/combo.js'
import { createOrder } from '@/api/order.js'
import { getAllBalances} from '@/api/wallet.js'
import {getUserAvailableCoupons} from '@/api/coupon.js'
// state 定义
const walletExpanded = ref(false)
const consumableBalance = ref('0.00')
const withdrawableBalance = ref('0.00')
const carDeposit = ref('0.00')
const violationDeposit = ref('0.00')
const carDepositRefundable = ref(false)
const violationDepositRefundable = ref(false)
const combos = ref([])
const availableCombos = ref([])
const coupons = ref([])

const leaseType = ref('hour')
const activeTab = ref('coupon')
const needRefreshCombo = ref(false)
const loading = ref(false)

const userId = ref(uni.getStorageSync('userId') || -1)

// 🚗 onLoad
onLoad((options) => {
  activeTab.value = options.defaultTab || 'coupon'
  console.debug("onLoad->options.defaultTab:"+options.defaultTab )
  const flag = uni.getStorageSync('needRefreshCombo')
  if (flag) {
    needRefreshCombo.value = true
    uni.removeStorageSync('needRefreshCombo')
  }
})

// 🚗 onShow
onShow(() => {
  if (needRefreshCombo.value) {
    getUserCombosData()
    needRefreshCombo.value = false
  }
})

// 🚗 onMounted
onMounted(async () => {
  await fetchWalletInfo()
  await getUserCombosData()
  await getAvailableCoupons()
  await getAvailableCombosData()
})


// 展示字段映射（可自由扩展）
const balanceMap = {
  consumableBalance: '可消费余额',
  withdrawableBalance: '可提现余额'
}
// balanceValue 方法：根据 key 返回对应 ref 的值
function balanceValue(key) {
  const valMap = {
    consumableBalance: consumableBalance.value,
    withdrawableBalance: withdrawableBalance.value
  }

  const rawVal = valMap[key]
  const num = parseFloat(rawVal)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

// 💰 computed：格式化套餐数据
const formattedCombos = computed(() => {
  return combos.value.map(combo => ({
    ...combo,
    tag: combo.status === 'active' ? '可用' : '过期',
    image: 'path-to-image'
  }))
})

// 🔄 折叠钱包
function toggleWallet() {
  walletExpanded.value = !walletExpanded.value
}

// 🎨 优惠券背景色
function getCouponBackground(coupon) {
  return {
    background: coupon.bgColor || 'linear-gradient(135deg, #aaff7f, #00FF7F)'
  }
}

// 🧭 tab切换
function switchTab(tab) {
  activeTab.value = tab
}

// 💰 获取钱包余额信息
async function fetchWalletInfo() {
  try {
    const res = await getAllBalances({ userId: userId.value })
    consumableBalance.value = res.data.accountBalance
    withdrawableBalance.value = res.data.withdrawableBalance
    carDeposit.value = res.data.deposit
    violationDeposit.value = res.data.longRentDeposit
    carDepositRefundable.value = res.data.carDepositRefundable
    violationDepositRefundable.value = res.data.violationDepositRefundable
  } catch (e) {
    console.error('获取钱包信息失败', e)
  }
}

// 🔋 充值
function goRecharge() {
  uni.navigateTo({ url: '/pages/pay/recharge-center' })
}

// ⬇️ 提现
function goWithdraw() {
  uni.navigateTo({ url: '/pages/withdraw/withdraw' })
}

// 🛒 使用优惠券
function useCoupon(coupon) {
  const carId = uni.getStorageSync('carId')
  const uid = uni.getStorageSync('userId') || 0

  if (!coupon?.couponId) {
    return uni.showToast({ title: '优惠券数据异常', icon: 'none' })
  }

  if (!carId) {
    return uni.showModal({
      title: '提示',
      content: '请先选择要用车的车辆',
      confirmText: '去选车',
      success: res => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/map/index' })
        }
      }
    })
  }

  if (coupon.senderId && coupon.senderId !== uid) {
    return uni.showToast({ title: '该优惠券为助力获得，请先领取', icon: 'none' })
  }

  uni.setStorageSync('tempCoupon', coupon)
  uni.redirectTo({
    url: `/pages/confirm-order/index?couponId=${coupon.couponId}&name=${encodeURIComponent(coupon.name)}&carId=${carId}&comboAmount=${coupon.discountAmount || 0}`
  })

  uni.showToast({ title: `使用优惠券: ${coupon?.name || "未使用优惠券"}`, icon: 'none' })
}

// 📦 使用套餐
function useCombo(combo) {
  const carId = uni.getStorageSync('carId')
  const uid = uni.getStorageSync('userId') || 0

  if (!combo?.id) {
    return uni.showToast({ title: '套餐数据异常', icon: 'none' })
  }

  if (!carId) {
    return uni.showModal({
      title: '提示',
      content: '请先选择要用车的车辆',
      confirmText: '去选车',
      success: res => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/map/index' })
        }
      }
    })
  }

  uni.setStorageSync('tempCombo', combo)
  uni.redirectTo({ url: `/pages/confirm-order/index?` })
  uni.showToast({ title: `使用套餐: ${combo?.remarks || "未使用套餐"}`, icon: 'none' })
}

// 📥 购买套餐
async function buyCoupon(combo) {
  if (!combo.id) {
    return uni.showToast({ title: '套餐ID无效', icon: 'error' })
  }

  try {
    uni.showLoading({ title: '正在购买...', mask: true })

    const now = new Date()
    const takeTime = now.toISOString()
    const returnTime = new Date(now.getTime() + 3 * 3600 * 1000).toISOString()

    const orderDetails = [{
      name: combo.comboName || '套餐费用',
      price: combo.price || 0,
      quantity: 1,
      unit: '套',
      businessType: combo.comboType === 'normalCombo' ? 'normalCombo' : 'couponCombo',
      voucher: combo.couponId || null,
      remark: combo.description || '购买特惠套餐',
      type: 'combo',
      comboId: combo.id
    }]

    const payload = {
      userId: userId.value,
      comboId: combo.id,
      orderType: 'comboRent',
      totalAmount: combo.price || 0,
      orderDetails
    }

    const res = await createOrder(payload)

    if (!res?.success) throw new Error(res?.message || '订单创建失败')

    uni.setStorageSync('currentComboRentOrderNum', res.data.orderNum)
    uni.setStorageSync('needRefreshCombo', true)
    uni.hideLoading()
	
	const redirect = '/pages/coupon/index'
	const defaultTab = 'combo'
	const orderNum = res.data.orderNum
	const redirectUrl = `${redirect}?defaultTab=${defaultTab}&orderNum=${orderNum}`
    uni.navigateTo({
	url: `/pages/pay/pay?orderNum=${orderNum}&userId=${payload.userId}&redirectUrl=${encodeURIComponent(redirectUrl)}`
      // url: `/pages/pay/pay?orderNum=${res.data.orderNum}&userId=${payload.userId}`
    })
  } catch (error) {
    console.error('buyCoupon error', error)
    uni.hideLoading()
    uni.showToast({ title: error.message || '购买套餐失败', icon: 'none' })
  }
}

// 获取用户套餐
async function getUserCombosData() {
  try {
    const res = await getUserCombos(userId.value)
    if (res?.data && Array.isArray(res.data)) {
      combos.value = res.data
    } else {
      uni.showToast({ title: '加载套餐失败', icon: 'none' })
    }
  } catch (e) {
    console.error('获取用户套餐失败:', e)
    uni.showToast({ title: '加载套餐失败', icon: 'none' })
  }
}

// 获取可购买套餐
async function getAvailableCombosData() {
  try {
    loading.value = true
    const userId = uni.getStorageSync('userId') || null
    const carType = ''     // 2/3/5/all，看你的业务
    const tags = ''           // 'student,high_freq'
    const region = ''         // 'quanzhou'

    const res = await getAvailableCombos({ userId, carType, tags, region })
    if (Array.isArray(res?.data)) {
      availableCombos.value = res.data.map(x => ({
        ...x,
        displayPrice: Number(x.price ?? 0).toFixed(2)
      }))
    } else {
      uni.showToast({ title: '加载套餐失败', icon: 'none' })
    }
  } catch (e) {
    console.error('获取套餐失败:', e)
    uni.showToast({ title: e.message || '加载套餐失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
// 获取可领取优惠券
async function getAvailableCoupons() {
  try {
    const res = await getUserAvailableCoupons({ userId: userId.value })
    if (res?.data && Array.isArray(res.data)) {
      coupons.value = res.data
    } else {
      uni.showToast({ title: '加载优惠券失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '加载优惠券失败', icon: 'none' })
  }
}

// 🎫 优惠券类型
function getCouponTypeName(type) {
  switch (type) {
    case 'cash':
      return '满减券'
    case 'discount':
      return '折扣券'
    default:
      return '助力券'
  }
}

// 📆 日期格式化
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const Y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const D = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

function formatMoney(val) {
  const num = parseFloat(val)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}
</script>


<style>
	.container {
		display: flex;
		flex-direction: column;
		background-color: #f8f8f8;
		min-height: 100vh;
		font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
	}

	/* 钱包区域 */
	.wallet-section {
		background-color: #FFD700;
		padding: 15px;
		color: #333;
		border-radius: 0 0 20px 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	/* 折叠状态 */
	.wallet-collapsed {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.wallet-summary {
		display: flex;
		align-items: center;
	}

	.wallet-icon {
		font-size: 20px;
		margin-right: 8px;
	}

	.wallet-title {
		font-size: 16px;
		font-weight: bold;
		margin-right: 10px;
	}

	.wallet-amount {
		font-size: 18px;
		font-weight: bold;
	}

	.expand-icon {
		font-size: 14px;
		color: #666;
	}

	/* 展开状态 */
	.wallet-expanded {
		display: flex;
		flex-direction: column;
	}

	.wallet-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	.balance-info,
	.deposit-info {
		margin-bottom: 15px;
	}

	.balance-row,
	.deposit-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.balance-label,
	.deposit-label {
		font-size: 14px;
	}

	.balance-amount,
	.deposit-amount {
		font-size: 16px;
		font-weight: bold;
	}

	.deposit-status {
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 10px;
		color: white;
		background-color: #888;
	}

	.deposit-status.refundable {
		background-color: #3CB371;
	}

	.wallet-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
	}

	.wallet-btn {
		flex: 1;
		margin: 0 8px;
		border-radius: 20px;
		font-size: 14px;
		padding: 10px 0;
		background-color: white;
		color: #333;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.wallet-btn.recharge {
		background-color: #FFA500;
		color: white;
	}

	.wallet-btn.withdraw {
		background-color: #1E90FF;
		color: white;
	}

	/* 优惠券区域 */
	.coupon-section {
		padding: 15px;
	}

	.tabs {
		display: flex;
		background-color: white;
		border-radius: 20px;
		padding: 5px;
		margin-bottom: 15px;
	}

	.tab {
		flex: 1;
		text-align: center;
		padding: 8px 0;
		font-size: 14px;
		color: #666;
		border-radius: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tab.active {
		background-color: #FFF8E6;
		color: #FFA500;
		font-weight: bold;
	}

	.tab-icon {
		margin-right: 5px;
		font-size: 16px;
	}

	.coupon-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.coupon-item {
		height: 140px;
		border-radius: 12px;
		padding: 15px;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.coupon-tag {
		position: absolute;
		top: 10px;
		right: 10px;
		background-color: #FF4500;
		color: white;
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 10px;
	}

	.coupon-content {
		display: flex;
		align-items: center;
	}

	.coupon-value {
		font-size: 28px;
		font-weight: bold;
		color: white;
		margin-right: 15px;
	}

	.coupon-detail {
		flex: 1;
		color: white;
	}

	.coupon-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.coupon-validity {
		font-size: 12px;
		color: #ffffff;
		opacity: 0.9;
		margin-top: 4px;
	}

	.coupon-image {
		position: absolute;
		right: 15px;
		bottom: 60px;
		width: 80px;
		height: 80px;
		opacity: 0.8;
	}

	.coupon-actions {
		display: flex;
		justify-content: space-between;
	}

	.coupon-actions button {
		flex: 1;
		margin: 0 5px;
		border-radius: 15px;
		font-size: 14px;
		padding: 6px 0;
	}

	.btn-share {
		background-color: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid white;
	}

	.btn-use {
		background-color: white;
		color: #FFD700;
		border: 1px solid white;
	}

	/* 样式：优惠券类型 */
	.coupon-type {
		font-size: 14px;
		color: #FFD700;
		/* 设置优惠券类型的颜色，可以自定义 */
		margin-left: 5px;
	}

	/* 使用条件 */
	.coupon-condition {
		font-size: 12px;
		color: #ff0000;
		margin-top: 4px;
	}

	.tab.active {
		border-bottom: 2px solid #FF5A1F;
		color: #FF5A1F;
	}
</style>