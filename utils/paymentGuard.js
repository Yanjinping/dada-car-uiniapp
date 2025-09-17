// // src/utils/paymentGuard.js
// import { getReturnStatus } from '@/api/order'
// import { ensureExistOrNormalize } from '@/utils/orderGuard'

// const HOME = '/pages/home/index'

// // 放行名单（永远不拦）
// const ALLOW_LIST = [
//   /^\/pkg-biz\/pages\/return\/pay(?:\?|$)/,
//   /^\/pkg-biz\/pages\/return\/photos(?:\?|$)/,
//   /^\/pages\/home\/index(?:\?|$)/,
//   /^\/pages\/login\/index(?:\?|$)/,     // ★ 登录页放行
// ]

// /** 只有这些路由才“需要已支付” */
// const NEED_PAID = [
//   /^\/pkg-biz\/pages\/return\/confirm(?:\?|$)/,
// ]

// const pure = (url='') => url.split('?')[0]
// const hit  = (list, url) => list.some(re => re.test(pure(url)))

// // 旁路一次（登录后跳首页用）
// let _bypassOnce = false
// export function bypassPaymentGuardOnce(){ _bypassOnce = true }

// // 防自递归标记
// let _resumeOnce = false
// const addSkipFlag = (url='') => url + (url.includes('?') ? '&' : '?') + '_pg=1'
// const hasSkipFlag = (url='') => /(?:\?|&)_[pP]g=1(?:$|&)/.test(url)

// function installOne(fnName){
//   uni.addInterceptor(fnName, {
//     invoke(args){
//       const url = args?.url || ''
//       if (!url) return true
//       if (_bypassOnce) { _bypassOnce = false; return true }
//       if (_resumeOnce || hasSkipFlag(url)) return true
//       if (hit(ALLOW_LIST, url)) return true
//       if (!hit(NEED_PAID, url)) return true   // 仅对“需已支付”的目标做校验

//       // 进入这里说明目标页“需要已支付”
//       const orderNum = uni.getStorageSync('currentOrderNum') || ''
//       if (!orderNum) return true

//       // 同步取消这次原跳转，异步决策后手动导航
//       Promise.resolve().then(async () => {
//         // 幽灵订单：静默归一化
//         try {
//           const ex = await ensureExistOrNormalize(orderNum)
//           if (ex && ex.normalized && ex.ok === false) {
//             _resumeOnce = true
//             uni.reLaunch({ url: HOME })
//             _resumeOnce = false
//             return
//           }
//         } catch (e) {
//           console.warn('[paymentGuard] normalize error:', e)
//           // 出错时不拦，继续恢复原意图
//         }

//         // 未支付 → 拉到 pay.vue；已支付 → 恢复原意图
//         try {
//           const s = await getReturnStatus(orderNum)
//           const paid = !!(s?.data?.paid ?? s?.paid)
//           if (paid) {
//             _resumeOnce = true
//             uni[fnName]({ ...args, url: addSkipFlag(url) })
//             _resumeOnce = false
//           } else {
//             uni.redirectTo({ url: `/pkg-biz/pages/return/pay?orderNum=${encodeURIComponent(orderNum)}` })
//           }
//         } catch (e) {
//           console.warn('[paymentGuard] getReturnStatus error:', e)
//           _resumeOnce = true
//           uni[fnName]({ ...args, url: addSkipFlag(url) })
//           _resumeOnce = false
//         }
//       })

//       return false
//     },
//     fail(){},
//   })
// }

// export function installPaymentInterceptor(){
//   ;['navigateTo','redirectTo','reLaunch','switchTab'].forEach(installOne)
// }
