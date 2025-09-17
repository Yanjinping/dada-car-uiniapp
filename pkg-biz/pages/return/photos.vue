<template>
  <scroll-view scroll-y class="page">
    <!-- 顶部导航（自定义） -->
    <TitleBar title="还车照片" background="#FFFFFF" />

    <StepBar :current="1" />

    <!-- 直接使用组件（内联模式） -->
    <ReturnPhotosSheet
      inline
      mode="return"
      @submit="urls => goPay(urls)"
    />
  </scroll-view>
</template>

<script setup>
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import StepBar from '../../components/return/StepBar.vue'
import ReturnPhotosSheet from '../../components/return/ReturnPhotosSheet.vue'
// NoticeBar 若本页不直接用，可不引入
// import NoticeBar from '../../components/return/NoticeBar.vue'

import { useReturnFlowStore } from '../../store/returnFlow'
import { ReturnStep } from '../../constants/returnFlow'
import { ensureReturnStep } from '../../utils/returnGuard'
// import { createReturnOrder } from '@/api/order' // 如需后端下单再打开

const flow = useReturnFlowStore()
const q = ref({ orderNum: '' })

onLoad((opts) => {
  q.value.orderNum = String(opts?.orderNum || uni.getStorageSync('currentOrderNum') || '')
  console.debug('[photos] before goPay', {
    qOrderNum: q.value.orderNum,
    currentOrderNum: uni.getStorageSync('currentOrderNum'),
  })
})

onShow(async () => { await ensureReturnStep(ReturnStep.PHOTOS) })

// 通用安全导航，避免 navigateTo/reLaunch 超时
let __navBusy = false
const nextTickDelay = (ms = 0) => new Promise(r => setTimeout(r, ms))
async function safeNavigate(doNav) {
  if (__navBusy) return
  __navBusy = true
  try {
    await nextTickDelay(0)
    await doNav()
  } finally {
    __navBusy = false
  }
}

// ▶ 接收子组件回传：urls 可能是 ['url1',...] 或 [{label,url},...]
// ▶ 接收子组件回传：urls 可能是 ['url1',...] 或 [{label,url},...]
async function goPay(urls) {
  const orderNum = String(q.value.orderNum || '')
  if (!orderNum) {
    uni.showToast({ title: '缺少订单号', icon: 'none' })
    return
  }

  // 归一化 URL 数组
  const list = Array.isArray(urls) ? urls : []
  const flat = list.map(it => typeof it === 'string' ? it : it.url).filter(Boolean)
  if (flat.length < 4) {
    uni.showToast({ title: '请按要求上传4张还车照片', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '上传中...' })

    // 1) 上传还车照片 —— 接入后端时解开注释
    // await uploadReturnPhotos({ orderNum, photos: flat })

    // 2) 获取订单应付金额 —— 推荐调用后端接口
    // const brief = await getOrderBrief(orderNum)
    // const payable = Number(brief?.data?.payable ?? 0)
    // const useDuration = brief?.data?.useDuration || ''
    // const distanceKm  = Number(brief?.data?.distanceKm ?? 0)

    // 先用 mock 值
    const payable     = 10
    const useDuration = ''
    const distanceKm  = 10

    // 3) 写入还车流程 store
    flow.toPay?.({
      orderNum,
      payable,
      photos: flat,
      meta: {
        takeSite: uni.getStorageSync('takeSite') || '',
        backSite: uni.getStorageSync('backSite') || '',
        useDuration,
        distanceKm
      }
    })
    flow.setStep?.(ReturnStep.PAY)

    // 4) 本地持久化（供下一页守卫读取）
    try { uni.setStorageSync('currentOrderNum', orderNum) } catch (_) {}
    try {
      const snapshot = {
        step: ReturnStep.PAY,
        orderNum,
        payable,
        photos: flat,
        meta: {
          takeSite: uni.getStorageSync('takeSite') || '',
          backSite: uni.getStorageSync('backSite') || '',
          useDuration,
          distanceKm
        }
      }
      uni.setStorageSync('returnFlow', snapshot)
    } catch (_) {}

    uni.hideLoading()

    // 5) 跳转到支付页
    await safeNavigate(() =>
      uni.redirectTo({ url: `/pkg-biz/pages/return/pay?step=2&orderNum=${encodeURIComponent(orderNum)}` })
    )
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: e?.message || '上传或结算失败', icon: 'none' })
  }
}

</script>

<style scoped>
.page{ min-height:100vh; background:#ffffff; }
</style>
