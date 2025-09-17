// utils/loading.js — 通用 Loading 包装（支持并发计数、延迟展示、最小停留、超时保护）
// 适用：uni-app / Vue3 <script setup>

/**
 * withLoading：为任意 Promise 或返回 Promise 的函数包装 showLoading/hideLoading
 * - 并发安全：多个调用时只在计数归零后才 hide
 * - 延迟展示：避免 100ms 内的快请求闪烁
 * - 最小停留：显示后至少停留 minDuration 避免闪烁
 * - 超时保护：timeout 到达时自动隐藏并可选抛错
 */
let activeCount = 0
let showTimer = null
let isShown = false
let shownAt = 0

/**
 * @template T
 * @param {Promise<T>|(() => Promise<T>)} task 直接传 Promise 或函数（建议函数，便于延迟执行）
 * @param {Object} [opts]
 * @param {string} [opts.title='加载中'] Loading 文案
 * @param {number} [opts.delay=120] 延迟显示的毫秒数（小请求不显示）
 * @param {number} [opts.minDuration=280] 最小展示时长（ms）
 * @param {number} [opts.timeout=15000] 超时自动隐藏（ms），0 表示不处理
 * @param {(err:any)=>void} [opts.onError] 自定义错误处理（不提供则把错误继续抛出）
 * @returns {Promise<T>}
 */
export async function withLoading(task, opts = {}) {
  const {
    title = '加载中',
    delay = 120,
    minDuration = 280,
    timeout = 15000,
    onError
  } = opts

  const start = Date.now()
  const run = typeof task === 'function' ? task : () => task

  let timeoutId = null

  try {
    // 并发计数 + 延迟展示
    activeCount++
    if (!isShown && delay >= 0) {
      showTimer = setTimeout(() => {
        uni.showLoading({ title, mask: true })
        isShown = true
        shownAt = Date.now()
      }, delay)
    }

    // 超时保护
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        safeHide('timeout')
      }, timeout)
    }

    const res = await run()
    await ensureMinDuration(minDuration)
    return res
  } catch (err) {
    await ensureMinDuration(minDuration)
    if (onError) onError(err)
    else throw err
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    clearDelay()
    activeCount--
    if (activeCount <= 0) {
      activeCount = 0
      safeHide()
    }
  }
}

function clearDelay(){
  if (showTimer){ clearTimeout(showTimer); showTimer = null }
}

function safeHide(reason){
  try {
    if (isShown){
      // 确保最小展示时间在 finally 外也生效
      const since = Date.now() - shownAt
      const remain = since < 120 ? 120 - since : 0
      setTimeout(() => { uni.hideLoading() }, remain)
      isShown = false
      shownAt = 0
    } else {
      // 若未真正显示过，也要清理掉潜在的 showTimer
      clearDelay()
    }
  } catch(_){}
}

async function ensureMinDuration(min){
  if (!isShown) return
  const since = Date.now() - shownAt
  if (since < min) await new Promise(r => setTimeout(r, min - since))
}

// —— 常用便捷封装 ——
export const withLoginLoading = (fn) => withLoading(fn, { title: '登录中' })
export const withPayLoading    = (fn) => withLoading(fn, { title: '支付中' })
export const withSaveLoading   = (fn) => withLoading(fn, { title: '保存中' })


// —— 示例用法 ——
// 1) 包装 API 调用（推荐传函数）
// await withLoading(() => api.login(params), { title: '登录中' })

// 2) 在组合式函数/组件内使用
// const onSubmit = () => withLoading(async () => {
//   await api.createOrder(payload)
//   await api.pay(orderNo)
// }, { title: '提交中' })

// 3) 自定义错误处理（不中断流程）
// await withLoading(() => api.some(), { onError: e => uni.showToast({ title: e.message || '失败', icon: 'none' }) })


// —— 若使用 uview-plus 的 http 拦截器，可这样统一包装 ——
// import { http } from '@/utils/http' // 假设你有 http 实例
// http.interceptors.request.use(async (cfg) => {
//   cfg.__loadingToken = Symbol('ld')
//   withLoading(Promise.resolve(), { title: '加载中' }) // 进入计数/延迟显示
//   return cfg
// })
// http.interceptors