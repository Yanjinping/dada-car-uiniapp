<template>
	<view class="container">
		<!-- 车辆信息 -->
		<view class="card">
			<view class="car-header">
				<image class="car-image" :src="carInfo.image || '/static/car1.png'" />
				<view>
					<view class="car-name">{{ carInfo.carModel || '未知车型' }} · {{ carInfo.seatNum || 4 }}座</view>
					<view class="car-sub">
						{{ carInfo.carNum || '未知车牌' }} | 续航 {{ carInfo.remainMile || '--' }} km | 电量
						{{ carInfo.restEnergy || '--' }}%
					</view>
				</view>
			</view>
			<view class="location">📍 {{ carInfo.netPointName || '未知网点' }} <text v-if="!isPayment" class="link"
					@click="goNavigate">导航</text></view>
		</view>

		<!-- 订单信息 -->
		<view class="card" v-if="isPayment">
			<view class="order-header">
				<view class="order-title">订单支付</view>
				<view class="order-no" v-if="orderInfo.orderNum">订单号: {{ orderInfo.orderNum }}</view>
			</view>
		</view>

		<!-- 费用明细 -->
		<view class="card collapsible" v-if="isDriving|| !isPayment">
			<!-- 		  <view v-if = "!isDriving" class="section-title" @click="toggleSection('fee')">💰 费用明细 <text class="arrow">{{ showFee ? '▲' : '▼' }}</text></view> -->
			<view class="section-title">💰 费用明细</view>
			<view v-if="showFee">
				<view class="item">时租费用：¥{{ baseFee.timeRent || '--' }} /小时 + ¥{{ baseFee.mileRent || '--' }} /公里</view>
				<view class="item">不计免赔：¥{{ baseFee.notDeductibleFee || 0 }} · 整备服务费：¥{{ baseFee.serviceFee || 0 }}
				</view>
			</view>
		</view>

		<!-- 套餐信息（根据状态显示不同内容） -->
		<view class="card">

			<!-- 支付状态下显示已选套餐 -->
			<!-- 		<view v-if="!isPayment" class="selected-combo">
				<view class="section-title">🎁 套餐信息</view>
				<text class="combo-name">{{ selectedCombo?.nameremarks || '四座7天（充300送120）' }}</text>
				<text class="combo-price">¥{{ selectedCombo?.comboRent || '499' }}</text>
			</view> -->

			<!-- 支付状态下显示已选套餐 -->
			<view v-if="true" class="selected-combo">
				<view class="section-title">🎁 套餐信息</view>
				<text class="combo-name">{{ selectedCombo?.remarks || '未使用套餐' }}</text>
				<text class="combo-price"
					v-if="selectedCombo?.remarks">剩余免费时长{{ selectedCombo?.remainingHours || '0' }}</text>
				<text class="combo-price"
					v-if="selectedCombo?.remarks">剩余免费里程{{ selectedCombo?.remainingMileage || '0' }}</text>
				<!-- 优惠券跳转按钮 -->
				<view v-if="!isPayment" class="coupon-link" @click="navigateToCouponList" style="background:#f5f5f5">
					<text>查看可用优惠券</text>
					<text class="icon">→</text>
				</view>
			</view>

			<!-- 确认状态下显示套餐选择 -->
			<view class="collapsible" v-if="showPackage">
				<view class="section-title" @click="toggleSection('package')">
					🎁 套餐优惠 <text class="arrow">{{ showPackage ? '▲' : '▼' }}</text>
				</view>

				<!-- 优惠券跳转按钮 -->
				<view class="coupon-link" @click="navigateToCouponList" style="background:#f5f5f5">
					<text>查看可用优惠券</text>
					<text class="icon">→</text>
				</view>

				<view class="scroll-container" v-if="showPackage">
					<radio-group :value="selectedPackage" @change="handlePackageChange">
						<view class="scroll-item" v-for="combo in comboList" :key="combo.comboId"
							style="background:#e6f7ff; margin-bottom:8px"
							:class="{ 'selected': selectedPackage === combo.comboId }">
							<label class="item">
								<view class="content">
									<view class="left">
										<radio :value="combo.comboId" />
										<view class="text">
											<view class="name" style="font-weight:500">{{ combo.name }}</view>
											<view class="desc">{{ combo.description }}</view>
										</view>
									</view>
									<view class="price" style="color:#f56c6c">
										¥{{ combo.comboRent !== null ? combo.comboRent : '--' }}</view>
								</view>
							</label>
						</view>
					</radio-group>
				</view>
			</view>
		</view>

		<!-- 优惠券 -->
		<view class="card">
			<view class="section-title">🎟️ 优惠券</view>
			<view v-if="couponList.length < 0" class="coupon-list">
				<view v-for="coupon in couponList" :key="coupon.couponId" @click="selectCoupon(coupon)">
					<text class="coupon-status">
						{{ coupon.couponId ? '已使用' : '未使用' }}「{{ coupon.name || '未选择优惠券' }}」
					</text>
					<text class="coupon-amount">
						优惠金额: <text class="red-bold">¥{{ coupon.discountAmount }}</text>
					</text>
					<!-- <view>{{ coupon.name }} 优惠金额: ¥{{ coupon.discountAmount }}</view> -->
					<!-- <view>优惠金额: ¥{{ coupon.discountAmount }}</view> -->
					<!--          <view>使用条件: 满¥{{ coupon.useCondition }}可以使用</view>
          <view>失效时间: {{ formatDate(coupon.invalidTime) }}</view> -->
				</view>
			</view>
			<view class="item">
				<text class="coupon-status">
					{{ selectedCoupon.name ? '已使用' : '未使用' }}「{{ selectedCoupon.name || '未选择优惠券' }}」
				</text>
				<text class="coupon-amount">
					优惠金额: <text class="red-bold">-¥{{ selectedCoupon.discountAmount }}</text>
				</text>
			</view>
			<text v-if="!isPayment" class="link" @click="changeCoupon">更换</text>
		</view>

		<!-- 预估费用 -->
		<view class="card">
			<view class="section-title">📊 {{ isPayment ? '订单费用' : '预估费用' }}</view>
			<view class="fee-row">
				<view class="label">时租行程费用</view>
				<view class="value">¥{{ !isPayment ? orderInfo.comboFee : (ratePerHour+mileRent || '--') }}</view>
			</view>
			<view class="fee-row">
				<view class="label">不计免赔</view>
				<view class="value">
					<view v-if="leaseType === 'hour'">¥{{ baseFee.notDeductibleFee || 5 }} /小时（封顶¥25）</view>
					<view v-else>¥{{ isPayment ? orderInfo.notDeductibleFee : comboDeductiblePrice || '--' }}</view>
				</view>
			</view>
			<view class="fee-row">
				<view class="label">整备服务费</view>
				<view class="value">¥{{ isPayment ? orderInfo.serviceFee : baseFee.serviceFee || 0 }}</view>
			</view>
			<view class="fee-row" v-if="isPayment && orderInfo.couponDiscount > 0">
				<view class="label">优惠券减免</view>
				<view class="value">-¥{{ orderInfo.couponDiscount }}</view>
			</view>
			<view class="total-highlight">
				{{ isPayment ? '订单总费用' : '预计起步费用' }}：¥{{ isPayment ? orderInfo.totalFee : estimatedFee }}
			</view>
			<view class="tips">⚠️ {{ isPayment ? '请在15分钟内完成支付' : '最终费用以用车结束结算为准，含时租、里程、超时、优惠' }}</view>
		</view>

		<!-- 支付方式（仅在支付阶段显示） -->
		<!-- 支付方式选择（含余额合并支付） -->
		<view class="card" v-if="isPayment">
			<view class="section-title">💳 支付方式</view>

			<!-- 余额支付开关 -->
			<view class="balance-toggle" @click="toggleBalancePayment">
				<view class="toggle-left">
					<image class="toggle-icon" src="/static/icons/wallet.png" />
					<view>使用余额支付 (当前余额: ¥{{ userBalance.toFixed(2) }})</view>
				</view>
				<view :class="['toggle-switch', useBalance ? 'active' : '']">
					<view class="toggle-knob"></view>
				</view>
			</view>

			<!-- 支付方式列表 -->
			<radio-group class="payment-methods" @change="handlePaymentChange">
				<label class="payment-item" v-for="method in paymentMethods" :key="method.value"
					:class="{ disabled: useBalance && method.value === 'balance' }">
					<view class="payment-left">
						<image class="payment-icon" :src="method.icon" />
						<view class="payment-name">{{ method.name }}</view>
						<view v-if="useBalance && method.value !== 'BALANCE'" class="payment-remain">
							还需支付: ¥{{ (orderInfo.totalFee - Math.min(userBalance, orderInfo.totalFee)).toFixed(2) }}
						</view>
					</view>
					<radio :value="method.value" :checked="method.value === selectedPayment"
						:disabled="useBalance && method.value === 'BALANCE'" />
				</label>
			</radio-group>

			<!-- 合并支付明细 -->
			<view class="merge-detail" v-if="useBalance">
				<view class="detail-row">
					<view>余额支付</view>
					<view>-¥{{ Math.min(userBalance, orderInfo.totalFee).toFixed(2) }}</view>
				</view>
				<view class="detail-row" v-if="orderInfo.totalFee > userBalance">
					<view>{{ selectedPayment === 'wechat' ? '微信' : '支付宝' }}支付</view>
					<view>¥{{ (orderInfo.totalFee - userBalance).toFixed(2) }}</view>
				</view>
			</view>
		</view>


		<!-- 协议勾选 -->
		<view class="agreement" v-if="!isPayment">
			<checkbox-group @change="onAgreeChange">
				<label class="checkbox-label">
					<checkbox value="agree" :checked="agree" class="checkbox" />
					<text>我已阅读并同意 </text>
					<text class="link" @click="openAgreement">《租赁服务协议》</text>
					<text> 和 </text>
					<text class="link" @click="openDisclaimer">《不计免赔说明》</text>
				</label>
			</checkbox-group>
		</view>

		<!-- 按钮 -->
		<!-- ✅ 仅在非支付页面才禁用按钮 -->
		<button class="btn-confirm" :disabled="!isPayment && !agree" :style="{
    backgroundColor: isPayment ? '#07C160' : (agree ? '#007aff' : '#ccc'),
    color: '#fff'
  }" @click="isPayment ? handlePay() : onConfirm()">
			{{ isPayment ? '💰 还车支付中...' : '🔓 确认同意并用车' }}
		</button>

	</view>

	<!-- 确保组件标签完整闭合 -->
	<control-modal :visible="showModal" :location="carInfo.netPointName || '未知网点'" :range="carInfo.remainMile || '--' "
		:plateNumber="carInfo.carNum || '未知车牌'" :ratePerHour="15" :ratePerKilometer="2" :startTime="tripStartTime"
		@update:driving-data="handleDrivingDataUpdate" @open-door="handleOpenDoor" @honk-horn="handleHonkHorn"
		@close-door="handleCloseDoor" @find-car="handleFindCar" @close="showModal = false"
		@confirm="handleConfirmReturn" @cancel="handleCancel" />

	<!-- <button @click="openPopup">查看规则</button> -->
	<rule-popup ref="rulePopup" @confirm="ConfirmOK" />

</template>

<script setup>
	import {
		watch,
		ref,
		onMounted,
		computed
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		preloadCarInfo,
		openCar,
		closeCar,
		hornCar,
		findCar,
		getFee
	} from '@/api/index.js'
	import {
		createOrder,
		settleOrder,
		payOrder,
		getOrderDetail
	} from '@/api/order.js'
	import {
		getWalletBalance
	} from '@/api/wallet.js'
	import ControlModal from '@/components/control-modal.vue'
	// console.log("组件导入:", ControlModal)
	import RulePopup from '@/components/rule-popup/index.vue'


	const props = defineProps({
		carId: [String, Number],
		userId: [String, Number],
		ratePerHour: {
			type: Number,
			required: true,
		},
		ratePerKilometer: {
			type: Number,
			required: true,
		},
	})
	const tripStartTime = ref(0)

	// 页面状态
	const isPayment = ref(false) // 是否为支付状态

	// 车辆信息
	const carInfo = ref({})
	const baseFee = ref({})
	const comboList = ref([])
	const couponList = ref([])
	const selectedCombo = ref({})
	const selectedCoupon = ref({})

	const selectedPackage = ref('')
	const selectedCouponId = ref(null)
	const selectedCouponDiscount = ref(0)
	const agree = ref(false)
	const showFee = ref(true)
	const showPackage = ref(false)
	const userId = ref(0)
	const carId = ref(0)
	const showModal = ref(false)
	const isDriving = ref(true)
	const rulePopup = ref(null)
	//费率配置（单位元）

	const ratePerHour = ref(); // 假设每小时10元
	const ratePerKilometer = ref(0); // 假设每公里2元

	// 数据变量
	const useBalance = ref(false)
	const userBalance = ref(0.00) // 用户余额数据，实际应从接口获取
	const loadingBalance = ref(false);


	// 订单信息
	const orderInfo = ref({
		orderNo: '',
		takeTime: '',
		returnTime: '',
		comboFee: 0,

		serviceFee: 0,
		couponDiscount: 0,
		totalFee: 0
	})

	// 支付方式
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
			icon: '/static/payment/balance.png'
		}
	])
	const selectedPayment = ref('wechat')

	// 默认未选择优惠券
	const selectedCouponName = ref('未选择优惠券')
	const showCoupon = ref(false)
	const leaseType = ref('hour')
	const comboDeductiblePrice = ref(0)
	const isLoading = ref(false)

	// 方法
	const toggleBalancePayment = () => {
		console.log("toggleBalancePayment:", userBalance.value)
		console.log("toggleBalancePayment:", selectedPayment.value)
		useBalance.value = !useBalance.value
		if (useBalance.value && selectedPayment.value === 'BALANCE') {
			selectedPayment.value = 'wechat' // 避免同时选择余额支付方式
		}
	}

	// 获取余额方法
	const getUserBalance = async () => {
		loadingBalance.value = true;
		try {
			const res = await getWalletBalance('accountBalance');
			// 安全处理返回值
			const balance = res?.data; // 👈 直接取 data，不需要 .data.data
			userBalance.value = typeof balance === 'number' ? Number(balance.toFixed(2)) : 0;
			console.log("getUserBalance:", userBalance.value)

			// if (typeof balanceData === 'number') {
			//     userBalance.value = Number(balanceData.toFixed(2));
			//   } else {
			//     userBalance.value = 0;
			//     // showToast("获取余额失败");
			//   }
		} finally {
			loadingBalance.value = false;
		}
	}

	// 自动计算预估费用（不含支付阶段）
	const estimatedFee = computed(() => {
		// console.log("rderInfo.value.totalFee:", rderInfo.value.totalFee)

		if (isPayment.value) return orderInfo.value.totalFee
		// const combo = selectedCombo.value?.comboRent || 0
		console.log("selectedCombo.value?.comboRent:", combo)

		const deductible = leaseType.value === 'hour' ? 0 : (comboDeductiblePrice.value || 0)
		console.log("deductible:", deductible)

		const service = baseFee.value?.serviceFee || 0
		console.log("service:", service)

		const couponDiscount = selectedCouponId.value ? 9 : 0
		console.log("couponDiscount:", couponDiscount)

		return combo + deductible + service - couponDiscount
	})

	// 监听套餐切换
	function handlePackageChange(e) {
		console.log('selectedcomboId->handlePackageChange:', e.detail);
		// 确保 e.detail 和 comboList 都是有效的
		if (e.detail && comboList.value) {
			const selectedComboId = e.detail.value;
			console.log('选中的 comboId:', selectedComboId);
			selectedPackage.value = selectedComboId; // 将选中的套餐ID赋值给 selectedPackage
			console.log('选中的 selectedPackage.value:', selectedPackage.value);

			// 查找与选中的 comboId 匹配的套餐
			const combo = comboList.value.find(c => c.comboId === selectedComboId);

			if (combo) {
				// 如果找到了有效套餐，更新 selectedCombo
				selectedCombo.value = combo;
				console.log('选中的套餐->handlePackageChange:', selectedCombo.value?.comboRent);
			} else {
				// 如果没有找到对应的套餐，输出提示
				console.warn('没有找到匹配的套餐，选项 ID:', selectedComboId);
			}
		} else {
			// 如果 e.detail 或 comboList 为空，输出错误
			console.error('错误：无法找到有效的套餐ID或comboList数据为空');
		}
	}


	// 监听优惠券切换
	watch(selectedCouponId, () => {
		// 重新触发费用计算，如果 couponDiscount 固定 10，可在上方 computed 控制即可
		console.error('selectedCouponId->handlePackageChange:', "优惠券")

	})

	onMounted(() => {
		uni.$on('selectCoupon', ({
			couponId,
			name
		}) => {
			selectedCouponId.value = couponId
			selectedCouponName.value = name
		})
		console.log("selectedCouponId.value", selectedCouponId.value)
		console.log("selectedCouponName.value", selectedCouponName.value)
		// 清缓存（可选）
		// uni.removeStorageSync('tempPackage')
		// uni.removeStorageSync('tempCombo')
		// uni.removeStorageSync('tempCoupon')
		// uni.removeStorageSync('tempIsPayment')
		// uni.removeStorageSync('tempCarId')
		// uni.removeStorageSync('tempUserId')			
	})

	onLoad(async (options) => {
		// 1. 初始化基础数据（保持原有代码不变）
		console.error("onLoad->", options)

		userId.value = Number(uni.getStorageSync('userId') || 0);
		selectedCouponId.value = options.couponId;
		selectedCouponName.value = decodeURIComponent(options.name || '未选择优惠券');
		selectedCouponDiscount.value = options.comboAmount;
		carId.value = Number(options.carId || uni.getStorageSync('tempCarId'));
		selectedPackage.value = uni.getStorageSync('tempPackage') || '';
		selectedCombo.value = uni.getStorageSync('tempCombo') || {};
		selectedCoupon.value = uni.getStorageSync("tempCoupon")
		console.error("onLoad->", selectedCombo.value.remarks)
		console.error("onLoad->selectedCoupon.value", selectedCoupon.value.name)
		console.error("onLoad->selectedCoupon.value", selectedCoupon.value.couponId)
		console.error("onLoad->selectedCoupon.value", selectedCoupon.value.discountAmount)


		isPayment.value = options.isPayment === true || options.isPayment === 'true';
		console.error("onLoad->isPayment.value", isPayment.value)

		if (!carId.value) {
			uni.showToast({
				title: '缺少车辆ID',
				icon: 'none'
			});
			return;
		}

		try {
			// 2. 并行请求车辆信息和用户余额
			const [carRes, balanceRes] = await Promise.all([
				preloadCarInfo({
					carId: carId.value,
					leaseType: 'hour',
					userId: userId.value
				}),
				getUserBalance() // 新增的余额接口调用
			]);

			// 3. 处理车辆信息（保持原有逻辑）
			const data = carRes.data || {};
			carInfo.value = data.car || {};
			baseFee.value = data.baseFee || {};
			comboList.value = data.comboList || [];
			couponList.value = data.couponList || [];

			const ratePerHour = baseFee.value.timeRent; // 假设每小时10元
			const ratePerKilometer = baseFee.value.mileRent; // 假设每公里2元

			//     if (comboList.value.length > 0) {
			//       selectedPackage.value = comboList.value[0].comboId;
			//       selectedCombo.value = comboList.value[0];
			//     }

			// // 4. 设置用户余额（新增）
			// userBalance.value = balanceRes.data || 0;

			// 5. 支付状态处理（保持原有逻辑）
			if (isPayment.value) {
				console.error("onLoad->loadOrderInfo", isPayment.value)
				await loadOrderInfo(options.orderNum);
			}

		} catch (e) {
			console.error('初始化失败:', e);
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			});

			// 失败时设置默认余额
			userBalance.value = 0;
		}
	});

	// 加载订单信息
	async function loadOrderInfo(orderNum) {
		try {
			console.log('✅ 当前 orderNum:', orderNum)
			const res = await getOrderDetail(orderNum)
			const order = res.data
			console.log('✅ 当前 order:', res.data)

			//  订单信息映射
			orderInfo.value = {
				orderId: order.id,
				orderNum: order.orderNum,
				comboFee: order.comboFee || 0,
				notDeductibleFee: order.notDeductibleFee || 0,
				serviceFee: order.serviceFee || 0,
				couponDiscount: order.couponDiscount || 0,
				totalFee: order.totalAmount || 0,
			}
		
			//  还原套餐和优惠券
			selectedCombo.value = {
				remarks: order.comboName,
				remainingHours: order.remainingHours || 0,
				remainingMileage: order.remainingMileage || 0
			}

			selectedCoupon.value = {
				couponId: order.couponId,
				name: order.couponName,
				discountAmount: order.couponDiscount || 0
			}

		} catch (err) {
			console.error('订单加载失败', err)
			uni.showToast({
				title: '订单加载失败',
				icon: 'none'
			})
		}
	}

	function formatDate(dateStr) {
		const date = new Date(dateStr)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		const seconds = String(date.getSeconds()).padStart(2, '0')
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
	}

	function toggleSection(section) {
		if (section === 'fee') showFee.value = !showFee.value
		if (section === 'package') showPackage.value = !showPackage.value
	}

	function onAgreeChange(e) {
		agree.value = e.detail.value.includes('agree')
	}

	function goNavigate() {
		uni.openLocation({
			latitude: carInfo.value.latitude,
			longitude: carInfo.value.longitude,
			name: carInfo.value.netPointName
		})
	}

	function changeCoupon() {
		// 跳转前保存状态
		uni.setStorageSync('tempPackage', selectedPackage.value)
		uni.setStorageSync('tempCombo', selectedCombo.value)
		uni.setStorageSync('tempIsPayment', isPayment.value)
		uni.setStorageSync('tempCarId', carId.value)
		// 跳转到选择页
		uni.navigateTo({
			url: `/pages/coupon/index?carId=${carId.value}&isPayment=${isPayment.value}`
		})
	}

	// 跳转到优惠券列表
	function navigateToCouponList() {
		// 跳转前保存状态
		uni.setStorageSync('tempPackage', selectedPackage.value)
		uni.setStorageSync('tempCombo', selectedCombo.value)
		uni.setStorageSync('tempIsPayment', isPayment.value)
		uni.setStorageSync('tempCarId', carId.value)
		uni.navigateTo({
			url: `/pages/coupon/index?carId=${carId.value}&isPayment=${isPayment.value}&defaultTab=combo`
		});
	}

	function openAgreement() {
		uni.showToast({
			title: 'openAgreement',
			icon: 'none'
		})
		uni.navigateTo({
			url: '/pages/agreement/index'
		})
	}

	function openDisclaimer() {
		uni.showToast({
			title: 'openDisclaimer',
			icon: 'none'
		})

		uni.navigateTo({
			url: '/pages/disclaimer/index'
		})
	}

	function selectCoupon(coupon) {
		selectedCouponId.value = coupon.couponId
		selectedCouponName.value = coupon.name
	}

	function handlePaymentChange(e) {
		selectedPayment.value = e.detail.value
	}

	// 结算接口请求函数
	async function handleConfirmReturn() {
		isLoading.value = true;

		// 显示还车提示
		uni.showToast({
			title: '已确认还车',
			icon: 'none'
		});

		try {
			// 显示加载中的提示
			uni.showLoading({
				title: `正在结算订单...`,
				mask: true
			});
			// 获取订单号（假设之前已经保存过订单号）
			const orderNum = uni.getStorageSync('currentOrderNum');
			// 调用结算接口
			const settleResponse = await settleOrder({
				orderNum: orderNum
			});
			// 结算成功，显示结算成功的提示
			uni.showToast({
				title: '结算成功',
				icon: 'none'
			});
			isPayment.value = true
			showModal.value = false
			// 跳转到支付页面
			// uni.navigateTo({
			//     url: `/pages/pay/pay?isPayment=true&orderId=${orderNum}`
			// });

		} catch (error) {
			console.error("error", error);

			// 结算失败，隐藏加载中提示并显示错误提示
			uni.hideLoading();
			uni.showToast({
				title: error.message || `结算失败`,
				icon: 'none'
			});
		} finally {
			// 恢复加载状态
			isLoading.value = false;
		}
	}

	// 统一控制函数
	const controlCar = async (action, apiFunc, actionName) => {
		try {
			isLoading.value = true
			uni.showLoading({
				title: `正在${actionName}...`,
				mask: true
			})
			await apiFunc({
				carId: carId.value
			})
			uni.hideLoading()
			uni.showToast({
				title: `${actionName}成功`,
				icon: 'success'
			})
		} catch (error) {
			uni.hideLoading()
			uni.showToast({
				title: error.message || `${actionName}失败`,
				icon: 'none'
			})
		} finally {
			isLoading.value = false
		}
	}

	// 具体控制方法
	const handleOpenDoor = () =>
		controlCar('open', openCar, '开车门')

	const handleCloseDoor = () =>
		controlCar('close', closeCar, '关车门')

	const handleHonkHorn = () =>
		controlCar('horn', hornCar, '鸣笛')

	const handleFindCar = () =>
		controlCar('find', findCar, '找车')

	//取消订单
	function handleCancel() {
		uni.showToast({
			title: 'handleCancel',
			icon: 'none'
		})

	}

	function openPopup() {
		rulePopup.value?.open()
	}
	async function ConfirmOK() {
		isLoading.value = true
		uni.showToast({
			title: '已确认用车',
			icon: 'none'
		})
		try {
			uni.showLoading({
				title: `正在锁定车辆...`,
				mask: true
			})
			const now = new Date()
			const durationHours = 3
			const takeTime = now.toISOString()
			const returnTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString()

			// 创建订单详情（包括套餐、费用等）
			const orderDetails = [{
					name: '时租费用',
					price: 0,
					quantity: 1,
					unit: '小时',
					businessType: 'comboRent',
					remark: '套餐租金明细',
					type: 'shortRent'
				},
				{
					name: '',
					price: baseFee.value.notDeductibleFee || 5,
					quantity: 1,
					unit: '件',
					businessType: 'comboIsNoDeductibleCostRent',
					remark: '不计免赔明细',
					type: 'shortRent'
				},
				{
					name: '不计免赔',
					price: baseFee.value.notDeductibleFee || 5,
					quantity: 1,
					unit: '件',
					businessType: 'comboIsNoDeductibleCostRent',
					remark: '不计免赔明细',
					type: 'shortRent'
				},
				{
					name: '整备服务费',
					price: baseFee.value.serviceFee || 0,
					quantity: 1,
					unit: '组',
					businessType: 'serviceFee',
					remark: '整备服务费明细',
					type: 'shortRent'
				},
				{
					name: '优惠券折扣',
					price: 0,
					quantity: 1,
					unit: '个',
					businessType: 'couponDiscount',
					remark: '优惠券折扣明细',
					type: 'shortRent'
				}
			];

			const res = await createOrder({
				userId: userId.value,
				carId: carId.value,
				comboId: selectedPackage.value,
				couponId: selectedCouponId.value,
				orderType: 'shortRent',
				shouldTakeCarTime: takeTime,
				shouldReturnCarTime: returnTime,
				carInfo: carInfo.value,
				orderDetails: orderDetails // 传递订单详情

			})

			// 保存订单号到本地存储
			uni.setStorageSync('currentOrderNum', res.data.orderNum); // 使用微信小程序/uni-app的存储API
			uni.hideLoading()
			uni.showToast({
				title: `锁定车辆成功`,
				icon: 'success'
			})

			// ✅ 跳转到支付页面
			// uni.redirectTo({
			//   url: `/pages/order/index?isPayment=true&orderId=${res.orderId}&carId=${carId.value}&couponId=${selectedCouponId.value || ''}&name=${encodeURIComponent(selectedCouponName.value)}`
			// })

			isPayment.value = true
			showModal.value = true
			tripStartTime.value = new Date().toISOString() // 记录开始时间

		} catch (error) {
			console.error("error", error)
			uni.hideLoading()
			uni.showToast({
				title: error.message || `锁定车辆失败`,
				icon: 'none'
			})
		} finally {
			isLoading.value = false
		}
	}



	// 确认订单
	async function onConfirm() {
		console.log("agree.value", agree.value)
		if (!agree.value) return
		openPopup()
		try {

		} catch (e) {
			uni.showToast({
				title: '下单失败',
				icon: 'none'
			})
		}
	}

	// 处理支付
	async function handlePay() {
		if (!agree.value) return
		const orderNum = uni.getStorageSync('currentOrderNum');
		console.log("handlePay", orderNum)

		uni.showLoading({
			title: '支付中...'
		})

		try {
			const res = await payOrder({
				userId: this.userId,
				orderNum: orderNum,
				paymentType: useBalance.value ? 'MIXED' : selectedPayment.value,
				amount: orderInfo.value.totalFee
			})
			uni.hideLoading()

			if (res.success) {
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				})

				// 跳转到用车页面
				setTimeout(() => {
					uni.redirectTo({
						// url: `/pages/drive/index?orderId=${res.orderId}`
						url: `/pages/home/home`
					})
				}, 1500)
			} else {
				uni.showToast({
					title: res.message || '支付失败',
					icon: 'none'
				})
			}
		} catch (e) {
			console.error('handlePay:', e)
			uni.hideLoading()
			uni.showModal({
				title: '支付异常',
				content: '支付过程中发生错误，请稍后重试或联系客服',
				confirmText: '我知道了',
				showCancel: false
			})
		}
	}
	const tripData = ref({}) // Initialize tripData as a reactive object

	const handleDrivingDataUpdate = (newData) => {
		tripData.value = newData
	}
</script>


<style scoped>
	.container {
		padding: 24rpx;
		background-color: #f9f9f9;
		padding-bottom: 120rpx;
	}

	.card {
		background: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.order-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.order-no {
		font-size: 24rpx;
		color: #999;
	}

	.car-header {
		display: flex;
		align-items: center;
		margin-bottom: 14rpx;
	}

	.car-image {
		width: 140rpx;
		height: 88rpx;
		margin-right: 24rpx;
		border-radius: 12rpx;
	}

	.car-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 4rpx;
	}

	.car-sub {
		font-size: 26rpx;
		color: #666;
	}

	.location {
		font-size: 26rpx;
		color: #333;
		margin-top: 10rpx;
	}

	.section-title {
		font-weight: bold;
		font-size: 30rpx;
		margin-bottom: 12rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item {
		font-size: 26rpx;
		color: #555;
		margin-bottom: 8rpx;
	}

	.red {
		color: #e64e37;
	}

	.link {
		color: #007aff;
		margin-left: 4rpx;
	}

	.arrow {
		margin-left: 8rpx;
		color: #999;
		font-size: 24rpx;
	}

	.agreement {
		margin: 24rpx 0;
		font-size: 26rpx;
		line-height: 38rpx;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.checkbox {
		margin-right: 10rpx;
	}

	.btn-confirm {
		background-color: #007aff;
		color: #fff;
		padding: 24rpx;
		border-radius: 20rpx;
		font-size: 30rpx;
		text-align: center;
		transition: background-color 0.3s, transform 0.2s;
		position: fixed;
		bottom: 12rpx;
		left: 24rpx;
		right: 24rpx;
	}

	.btn-confirm:active {
		transform: scale(0.98);
	}

	.scroll-container {
		transition: all 0.3s ease;
		max-height: 400rpx;
		overflow-y: scroll;
		padding-right: 8rpx;
	}

	.scroll-item {
		padding: 20rpx 0;
		border-bottom: 1rpx solid #eee;
	}

	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.content {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding-right: 20rpx;
	}

	.left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.text {
		display: flex;
		flex-direction: column;
		margin-left: 16rpx;
	}

	.name {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 4rpx;
	}

	.desc {
		font-size: 24rpx;
		color: #888;
	}

	.price {
		font-size: 30rpx;
		color: #e64e37;
		font-weight: bold;
		white-space: nowrap;
	}

	.fee-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8rpx;
		font-size: 26rpx;
		color: #555;
	}

	.total-highlight {
		font-size: 32rpx;
		font-weight: bold;
		color: #e64e37;
		margin-top: 16rpx;
	}

	.tips {
		font-size: 24rpx;
		color: #888;
		margin-top: 8rpx;
		line-height: 34rpx;
	}

	.payment-methods {
		margin-top: 10rpx;
	}

	.payment-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.payment-left {
		display: flex;
		align-items: center;
	}

	.payment-icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 20rpx;
	}

	.payment-name {
		font-size: 28rpx;
	}

	/* 套餐标题行
.combo-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.combo-info-title,
.combo-promo-title {
  font-size: 30rpx;
  font-weight: bold;
}

.combo-promo-title .arrow {
  color: #999;
  font-size: 24rpx;
  margin-left: 10rpx;
}

/* 已选套餐项 */
	.combo-selected-item {
		display: flex;
		align-items: center;
		padding: 12rpx 0;
	}

	.combo-checked {
		color: #007AFF;
		font-size: 40rpx;
		margin-right: 20rpx;
	}

	.combo-name-price {
		flex: 1;
	}

	.combo-name-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.combo-name {
		font-size: 28rpx;
		font-weight: bold;
	}

	.combo-price {
		font-size: 28rpx;
		color: #e64e37;
		font-weight: bold;
		margin-left: auto;
		/* 新增：强制靠右 */
		padding-left: 30rpx;
		/* 新增：保持间距 */
	}

	.combo-desc {
		font-size: 24rpx;
		color: #999;
	}

	/* 优惠券项样式 */
	.coupon-item {
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.coupon-status {
		font-size: 26rpx;
		color: #333;
		margin-bottom: 8rpx;
	}

	.coupon-amount {
		font-size: 26rpx;
		color: #666;
	}

	/* 红色粗体金额 */
	.red-bold {
		color: #e64e37;
		font-weight: bold;
	}

	.scroll-item.selected {
		background-color: #f0faff;
		border-radius: 12rpx;
	}

	.coupon-link {
		transition: background-color 0.2s;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		margin: 8px 0;
		background-color: #f8f8f8;
		border-radius: 8px;
		color: #333;
		font-size: 14px;
	}

	.coupon-link .icon {
		color: #999;
		font-size: 16px;
	}

	.coupon-link:active {
		background-color: #eee;
	}

	/* 弹窗样式 */
	.dialog-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}

	.dialog-container {
		width: 80%;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.dialog-header {
		padding: 30rpx;
		font-size: 34rpx;
		font-weight: bold;
		text-align: center;
		border-bottom: 1rpx solid #eee;
	}

	.dialog-content {
		padding: 30rpx;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		color: #333;
	}

	.info-row.highlight {
		margin-top: 30rpx;
		padding-top: 20rpx;
		border-top: 1rpx dashed #eee;
	}

	.price {
		color: #f53f3f;
		font-weight: bold;
	}

	.notice {
		margin-top: 30rpx;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		font-size: 24rpx;
		color: #666;
	}

	.dialog-footer {
		display: flex;
		border-top: 1rpx solid #eee;
	}

	.btn-cancel,
	.btn-confirm {
		flex: 1;
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
		font-size: 32rpx;
		border: none;
		border-radius: 0;
		background-color: #fff;
	}

	.btn-cancel {
		color: #666;
		border-right: 1rpx solid #eee;
	}

	.btn-confirm {
		color: #07C160;
		font-weight: bold;
	}

	.balance-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
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
		background-color: #07C160;
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

	.merge-detail {
		margin-top: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx dashed #eee;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16rpx;
		font-size: 28rpx;
	}

	.payment-remain {
		font-size: 24rpx;
		color: #888;
		margin-left: 10rpx;
	}

	.disabled {
		opacity: 0.6;
	}
</style>