	// /api/benefit.js
	import { get, post } from '@/api/request' // 你自己的通用封装

	/** 购买初始化：返回 orderNo、拉起参数；wallet/0元可能直接完成 */
	export function benefitPurchaseInit({ packageId, price, idempotentKey, asSubscription = false, payMethod }) {
	  return post('/user/packages/purchase/init', {
		packageId, price, idempotentKey, asSubscription, payMethod
	  }, true) // 第三个参数 true = 需要 token
	}

	/** （可选）直接购买：一般适合 0 元或纯钱包直扣 */
	export function benefitPurchase({ packageId, price, idempotentKey, asSubscription = false }) {
	  return post('/user/packages/purchase', {
		packageId, price, idempotentKey, asSubscription
	  }, true)
	}
	
	// 获取推荐的可购买套餐（默认排除已持有）
	export function getBenefitCandidates(params = {}) {
	  // params: { carType:'all', tags:'', region:'', excludeOwned:true }
	  return get('/user/packages/candidates', params, true)
	}
	
	// 我的套餐（可用/已购买）
	export function getMyPackages(params = {}) {
	  // params: { effectiveOnly: true, includeExpired: false, carType: '' }
	  return get('/user/packages/mine', params, true)
	}

	// 获取当前可购买/推荐的套餐（新接口）
	export function getAvailableBenefits(params = {}) {
	  // params: { userId, carType='all', tags='', region='' }
	  return get('/user/packages/candidates', params, true)
	}


	/** 续订/赠送等你已有的接口也可以顺手封一下 */
	export function benefitRenew({ userPackageId, price, idempotentKey }) {
	  return post(`/api/user/packages/${userPackageId}/renew`, { price, idempotentKey }, true)
	}
	export function benefitGift({ userPackageId, toUserId }) {
	  return post(`/api/user/packages/${userPackageId}/gift`, { toUserId }, true)
	}

	// 赠送 / 接受赠送
	export function giftUserPackage(userPackageId, toUserId) {
	  return postForm(`/user/packages/${userPackageId}/gift`, { toUserId }, true)
	}
	export function acceptGift(userPackageId, toUserId) {
	  return postForm(`/user/packages/${userPackageId}/accept-gift`, { toUserId }, true)
	}

