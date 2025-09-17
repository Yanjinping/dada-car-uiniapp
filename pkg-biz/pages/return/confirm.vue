<template>
	<scroll-view scroll-y class="page">
		<TitleBar title="确认还车" background="#FFFFFF" />
		<view class="hero">
			<StepBar :current="3" />
		</view>
		<FinishChecklist />
		 <!-- 占位：给底部固定按钮让位 -->
		    <view class="footer-spacer"></view>
	</scroll-view>
	   <!-- 底部固定按钮 -->
	   <view class="footer-fixed">
	     <button class="primary" @click="doConfirm">确认还车</button>
	   </view>
	 
</template>

<script setup>
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import TitleBar from '@/components/header/TitleBar.vue'
	import StepBar from '../../components/return/StepBar.vue'
	import FinishChecklist from '../../components/return/FinishChecklist.vue'

	import {
		ensureReturnStep
	} from '../../utils/returnGuard'
	import {
		ReturnStep
	} from '../../constants/returnFlow'
	import {
		useReturnFlowStore
	} from '../../store/returnFlow'
	import {
		confirmReturn
	} from '@/api/order'


const props = defineProps({
  orderNum: { type: [String, Number], default: '' },
})

	const flow = useReturnFlowStore()
	let orderNum = ''


	async function doConfirm() {
		if (!orderNum) {
			uni.showToast({
				title: '缺少订单号',
				icon: 'none'
			})
			return
		}
		try {
			uni.showLoading({
				title: '提交中...'
			})
			await confirmReturn({
				orderNum
			})
			// 清理状态（store + 本地缓存）
			flow.reset?.()
			uni.removeStorageSync('currentOrderNum')
			uni.removeStorageSync(`order:${orderNum}:first-open-proof`)
			uni.removeStorageSync(`order:${orderNum}:return-proof`)
			uni.removeStorageSync('order:returnPoint:current')
			uni.removeStorageSync('order:currentCarId')
			uni.removeStorageSync('tempCombo')
			uni.removeStorageSync('tempCoupon')
			uni.removeStorageSync('tempIsPayment')
			uni.removeStorageSync('tempPackage')
			uni.removeStorageSync('tempCarId')

			uni.showToast({
				title: '已确认',
				icon: 'success'
			})
			setTimeout(() => uni.reLaunch({
				url: '/pkg-biz/pages/return/success'
			}), 600)
		} catch (e) {
			uni.showToast({
				title: e?.message || '确认失败',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}

	onLoad((opts) => {
		flow.hydrate?.()
		orderNum = String(
			opts?.orderNum ||
			flow.orderNum ||
			uni.getStorageSync('currentOrderNum') ||
			''
		)
		if (!flow.orderNum && orderNum) {
			flow.orderNum = orderNum;
			flow.persist?.()
		}
	})

	// 必须处在第3步，否则守卫会纠正
	onShow(async () => {
		await ensureReturnStep(ReturnStep.CONFIRM)
	})
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #FFFFFF;
	}

	.hero {
		
		background: linear-gradient(180deg, #e8fff1, #f6f7f9)
	}

/* 占位高度 = 按钮高 + 上下内边距 + 安全区 */
.footer-spacer{
  height: calc(96rpx + 32rpx + env(safe-area-inset-bottom));
}

/* 占位高度 = 按钮高 + 上下内边距 + 安全区 */
.footer-spacer{
  height: calc(96rpx + 32rpx + env(safe-area-inset-bottom));
}

/* 底部固定容器 */
.footer-fixed{
  position: fixed;
  left: 0; right: 0; bottom: 0;
  box-sizing: border-box;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  background: transparent;  /* 不盖住页面 */
  z-index: 10;
}

/* 大按钮：688×96、圆角48、渐变 #82ED71→#0DB63D */
.primary{
  width: 688rpx;
  height: 96rpx;
  margin: 20rpx auto;                 /* 居中 */
  border: none !important;
  border-radius: 48rpx;
  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%);
  color: #FFFFFF;

  /* 文案样式（40rpx/500/居中） */
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 40rpx;
  line-height: 54rpx;             /* 按标注 */
  text-align: center;

  /* 垂直居中更稳妥 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.primary::after{ border: none !important; } /* 兼容小程序默认边框 */
/* 禁用态：按标注 50% 透明的渐变；不要额外整体变淡 */
.primary.disabled,
.primary[disabled]{
  background: linear-gradient(180deg, rgba(130,237,113,0.5) 0%, rgba(13,182,61,0.5) 100%) !important;
  color: rgba(255,255,255,0.8) !important;   /* 文案略淡一点，看起来像禁用 */
  opacity: 1 !important;                     /* 覆盖系统默认的 0.6 */
  box-shadow: none !important;
  filter: none !important;
  cursor: not-allowed;
  pointer-events: none;                       /* H5 保险 */
}

/* 小程序默认会用 ::after 加边框/按压层，禁用时把它关掉 */
.primary[disabled]::after,
.primary.disabled::after{
  display: none !important;
}

</style>