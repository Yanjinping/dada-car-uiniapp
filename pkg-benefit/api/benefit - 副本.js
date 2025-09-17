// /api/benefit.js
const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : ''

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseURL + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: { 'Content-Type': 'application/json', ...(options.header || {}) },
      success: (res) => (res.statusCode === 200 ? resolve(res.data) : reject(res)),
      fail: reject
    })
  })
}

// —— 占位数据（先跑通 UI）
export function fetchWallet() {
  return Promise.resolve({ consumable: 50.0, withdrawable: 0.0, carDeposit: 800, violationDeposit: 700 })
}
export function fetchCoupons() {
  return Promise.resolve([
    { id: 1, name: '新用户注册10元券', amount: 10, threshold: 39.99, carLimitText: '限四座车可用', expireText: '2025.08.11 23:59:59到期', ruleText: '使用规则' },
    { id: 2, name: '大学生暑价（四座一日游大学生）', amount: 20, threshold: 79.99, carLimitText: '限四座车可用', expireText: '2025.08.11 23:59:59到期', ruleText: '使用规则' },
    { id: 3, name: '长途优惠券（所有车型通用）', amount: 99, threshold: 1500, carLimitText: '限四座车可用', expireText: '2025.08.11 23:59:59到期', ruleText: '使用规则' },
    { id: 4, name: '七夕优惠券（所有车型通用）', amount: 10, threshold: 39.99, carLimitText: '所有车型通用', expireText: '2025.08.29 - 2025.09.05' }
  ])
}
export function fetchPacks() {
  return Promise.resolve({
    available: [
      { id: 11, name: '三小时免里程套餐', price: 19.99, carLimitText: '限四座车可用', expireText: '2025.08.11 23:59:59到期', desc: '套餐说明' },
      { id: 12, name: '五小时免里程套餐', price: 29.99, carLimitText: '限四座车可用', expireText: '2025.08.11 23:59:59到期', desc: '套餐说明' }
    ],
    purchasable: [
      { id: 21, name: '十二小时内免里程套餐', price: 49.99, carLimitText: '限五座车可用', expireText: '2025.08.11 23:59:59到期', buyable: true },
      { id: 22, name: '一日游免里程套餐', price: 79.99, carLimitText: '所有车型通用', expireText: '2025-08-11 23:59:59到期', buyable: true }
    ]
  })
}

// 动作（先 toast）
export function useCoupon(id)  { uni.showToast({ title: `使用优惠券#${id}`, icon: 'none' }); return Promise.resolve(true) }
export function giftCoupon(id) { uni.showToast({ title: `送好友#${id}`, icon: 'none' });   return Promise.resolve(true) }
export function buyPack(id)    { uni.showToast({ title: `购买套餐#${id}`, icon: 'none' });   return Promise.resolve(true) }
export function usePack(id)    { uni.showToast({ title: `使用套餐#${id}`, icon: 'none' });   return Promise.resolve(true) }
