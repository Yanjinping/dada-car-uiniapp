<template>
	<view class="payment-container">
		<!-- 顶部标题 -->
		<view class="payment-header">收银台</view>

		<!-- 金额显示 -->
		<view class="payment-amount">
			<view class="amount-label">需支付</view>
			<view class="amount-value">¥{{ Number(orderAmount || 0).toFixed(2) }}</view>
		</view>

		<!-- 支付方式选择 -->
		<view class="payment-methods">
			<view class="methods-title">选择支付方式</view>

			<!-- 余额支付开关 -->
			<view class="balance-toggle" @click="toggleBalancePayment">
				<view class="toggle-left">
					<image class="toggle-icon" src="/static/icons/wallet.png" />
					<view>使用余额合并支付 (当前余额: ¥{{ Number(userBalance || 0).toFixed(2)  }})</view>
				</view>
				<view :class="['toggle-switch', useBalance ? 'active' : '']">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<!-- ✅ 余额提示 -->
			<view style="font-size: 24rpx; color: #999; margin-bottom: 20rpx;">
				<view v-if="isBalanceSufficient">您可使用余额全额支付!</view>
				<view v-else>余额不足，将合并微信/支付宝支付</view>
			</view>

			<!-- 支付方式列表 -->
			<radio-group class="method-list" @change="handlePaymentChange">
				<label class="method-item" v-for="method in availablePaymentMethods" :key="method.value" :class="{ 
            selected: selectedPayment === method.value,
            disabled: useBalance && method.value === 'BALANCE'
          }">
					<view class="method-left">
						<image class="method-icon" :src="method.icon" />
						<view class="method-info">
							<view class="method-name">{{ method.name }}</view>
							<view v-if="useBalance && method.value !== 'BALANCE'" class="method-remain">
								还需支付: ¥{{ (orderAmount - Math.min(userBalance, orderAmount)).toFixed(2)}}
							</view>
						</view>
					</view>
					<radio :value="method.value" :checked="selectedPayment === method.value"
						:disabled="useBalance && method.value === 'BALANCE'" />
				</label>
			</radio-group>

			<!-- 合并支付明细 -->
			<view class="merge-detail" v-if="useBalance">
				<view class="detail-row">
					<view>余额支付</view>
					<view>-¥{{ Math.min(userBalance, orderAmount).toFixed(2) }}</view>
				</view>
				<view class="detail-row" v-if="orderAmount > userBalance">
					<view>{{ selectedPayment === 'WECHAT' ? '微信' : '支付宝' }}支付</view>
					<view>¥{{ (orderAmount - userBalance).toFixed(2) }}</view>
				</view>
			</view>
		</view>

		<!-- 支付按钮 -->
		<button class="payment-button" @click="handlePayment">
			{{ paymentButtonText }}
		</button>
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		getOrderDetail,
		payOrder
	} from '@/api/order'
	import {
		getWalletBalance
	} from '@/api/wallet'

	const orderNum = ref('')
	const userId = ref(0)
	const userBalance = ref(0)
	const selectedPayment = ref('WECHAT')
	const useBalance = ref(true)
	const orderAmount = ref(0) // 动态订单金额
	const redirectUrl = ref('/pages/order/success')  // 默认跳转页

	// 支付方式数据
	const paymentMethods = ref([{
			name: '微信支付',
			value: 'WECHAT',
			icon: '/static/payment/wechat.png'
		},
		{
			name: '支付宝',
			value: 'ALIPAY',
			icon: '/static/payment/alipay.png'
		},
		{
			name: '余额支付',
			value: 'BALANCE',
			icon: '/static/payment/wallet.png'
		}
	])


	// 页面 onLoad 时获取参数
	onLoad(async (options) => {
		orderNum.value = options.orderNum
		userId.value = parseInt(options.userId)
		 if (options.redirectUrl) {
		    redirectUrl.value = decodeURIComponent(options.redirectUrl)
		  }
		console.log("收银台 onLoad-> orderNum.value ", orderNum.value)
		console.log("收银台 onLoad-> userId.value ", userId.value)

		// ✅ 请求订单详情接口
		const res = await getOrderDetail(orderNum.value)
		orderAmount.value = res?.data?.totalAmount ?? 0
		console.log("收银台 onLoad->  orderAmount.value  ", orderAmount.value)

		// ✅ 获取余额
		const balanceRes = await getWalletBalance('accountBalance')
		userBalance.value = balanceRes?.data ?? 0 // ✅ 用 ?? 更严谨
		console.log("收银台 onLoad-> userBalance.value ", userBalance.value)
		//如果余额足够，默认使用余额支付
		if (userBalance.value >= orderAmount.value) {
			selectedPayment.value = 'BALANCE'
			useBalance.value = false // 不用合并支付，直接纯余额
		} else {
			selectedPayment.value = 'WECHAT' // 或 'ALIPAY' 看你业务默认
			useBalance.value = true // 开启合并支付
		}

	})

	//判断余额是否充值
	const isBalanceSufficient = computed(() => {
		return userBalance.value >= orderAmount.value
	})

	// 计算可用的支付方式
	const availablePaymentMethods = computed(() => {
		return paymentMethods.value.filter(method =>
			!(useBalance.value && method.value === 'BALANCE')
		)
	})

	// 切换余额支付状态
	const toggleBalancePayment = () => {
		useBalance.value = !useBalance.value
		if (useBalance.value && selectedPayment.value === 'BALANCE') {
			selectedPayment.value = 'WECHAT'
		}
	}

	// 处理支付方式变更
	const handlePaymentChange = (e) => {
		selectedPayment.value = e.detail.value
	}

	// 计算支付按钮文字
	const paymentButtonText = computed(() => {
		if (useBalance.value) {
			const balancePay = Math.min(userBalance.value, orderAmount.value)
			const remainPay = orderAmount.value - balancePay
			return `合并支付(余额¥${balancePay.toFixed(2)} + ${selectedPayment.value === 'WECHAT' ? '微信' : '支付宝'}¥${remainPay.toFixed(2)})`
		}
		if (selectedPayment.value === 'BALANCE') {
			return `使用余额支付`
		}

		return `使用${selectedPayment.value === 'WECHAT' ? '微信' : '支付宝'}支付`
	})

	// 处理支付
	// 修改 handlePayment 函数为调用后端接口：
	const handlePayment = async () => {
		uni.showLoading({
			title: '支付中...',
			mask: true
		})

		try {
			let paymentTypeToSend = selectedPayment.value
			// 如果启用了合并支付，则统一发 MIXED 给后端
			if (useBalance.value && selectedPayment.value !== 'BALANCE') {
				paymentTypeToSend = 'MIXED'
			}
			const res = await payOrder({
				orderNum: orderNum.value,
				userId: userId.value,
				paymentType: paymentTypeToSend // 'WECHAT' or 'ALIPAY' or 'BALANCE' or 'MIXED'
			})

			if (res.success) {
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				})
				// TODO: 可跳转支付完成页
				setTimeout(() => {
					uni.redirectTo({
					url: `${redirectUrl.value}?orderNum=${orderNum.value}`
					})
				}, 1000)
			} else {
				uni.showToast({
					title: res.message || '支付失败',
					icon: 'none'
				})
			}
		} catch (e) {
			console.error('支付异常：', e)
			uni.showToast({
				title: '支付异常',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}
</script>

<style scoped>
	.payment-container {
		padding: 40rpx;
		background-color: #FFFFFF;
		min-height: 100vh;
	}

	.payment-header {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		margin: 40rpx 0 60rpx;
	}

	.payment-amount {
		text-align: center;
		margin-bottom: 60rpx;
	}

	.amount-label {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 16rpx;
	}

	.amount-value {
		font-size: 48rpx;
		font-weight: bold;
	}

	.methods-title {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 30rpx;
	}

	/* 余额开关样式 */
	.balance-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		margin-bottom: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.toggle-left {
		display: flex;
		align-items: center;
		font-size: 28rpx;
	}

	.toggle-icon {
		width: 36rpx;
		height: 36rpx;
		margin-right: 16rpx;
	}

	.toggle-switch {
		width: 80rpx;
		height: 40rpx;
		background-color: #e0e0e0;
		border-radius: 20rpx;
		position: relative;
		transition: all 0.3s;
	}

	.toggle-switch.active {
		background-color: #FFCC00;
	}

	.toggle-knob {
		width: 36rpx;
		height: 36rpx;
		background-color: white;
		border-radius: 50%;
		position: absolute;
		top: 2rpx;
		left: 2rpx;
		transition: all 0.3s;
	}

	.toggle-switch.active .toggle-knob {
		left: 42rpx;
	}

	/* 支付方式列表 */
	.method-list {
		margin-bottom: 40rpx;
	}

	.method-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border: 2rpx solid #EEEEEE;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
	}

	.method-item.selected {
		border-color: #FFCC00;
	}

	.method-item.disabled {
		opacity: 0.6;
	}

	.method-left {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.method-info {
		flex: 1;
	}

	.method-icon {
		width: 48rpx;
		height: 48rpx;
		margin-right: 24rpx;
	}

	.method-name {
		font-size: 32rpx;
	}

	.method-remain {
		font-size: 24rpx;
		color: #999999;
		margin-top: 8rpx;
	}

	/* 合并支付明细 */
	.merge-detail {
		background-color: #F8F8F8;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 40rpx;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		font-size: 28rpx;
		margin-bottom: 16rpx;
	}

	/* 支付按钮 */
	.payment-button {
		position: fixed;
		bottom: 60rpx;
		left: 40rpx;
		right: 40rpx;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #FFCC00;
		color: #333333;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		text-align: center;
		border: none;
	}
</style>