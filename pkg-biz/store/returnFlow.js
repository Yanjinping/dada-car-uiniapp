// src/store/returnFlow.js
import { defineStore } from 'pinia'
import { ReturnStep } from '../constants/returnFlow'

const KEY = 'return_flow_cache_v1'

export const useReturnFlowStore = defineStore('returnFlow', {
  state: () => ({
    step: ReturnStep.PHOTOS,
    orderNum: '',          // 有订单号就更可靠
    photos: [],            // 本地拍照结果（urls）
    payable: 0,            // 应付金额
    paid: false,           // 是否已支付成功（本地态）
    meta: {},              // 取车/还车网点、时间等摘要
  }),

  actions: {
    hydrate() {
      try {
        const raw = uni.getStorageSync(KEY)
        if (raw) Object.assign(this, JSON.parse(raw))
      } catch(_) {}
    },
    persist() {
      uni.setStorageSync(KEY, JSON.stringify({
        step: this.step, orderNum: this.orderNum,
        photos: this.photos, payable: this.payable,
        paid: this.paid, meta: this.meta
      }))
    },
    // 上一步：拍照完成，进入支付
    toPay(payload) {
      this.photos = payload?.photos || this.photos
      if (payload?.orderNum) this.orderNum = payload.orderNum
      if (payload?.payable != null) this.payable = payload.payable
      this.paid = false
      this.step = ReturnStep.PAY
      this.persist()
    },
    // 支付成功，进入确认
    toConfirm() {
      this.paid = true
      this.step = ReturnStep.CONFIRM
      this.persist()
    },
    // 完成后清理
    reset() {
      this.$reset()
      uni.removeStorageSync(KEY)
    },
    // 由后端状态回推本地 step
    applyServerStatus(s) {
      // 推荐服务端返回：
      // { orderNum, needPhotos:boolean, paid:boolean, confirmable:boolean, payable:number }
      this.orderNum = s.orderNum || this.orderNum
      this.payable  = s.payable ?? this.payable
      if (s.needPhotos)        this.step = ReturnStep.PHOTOS
      else if (!s.paid)        this.step = ReturnStep.PAY
      else                     this.step = ReturnStep.CONFIRM
      this.paid = !!s.paid
      this.persist()
    }
  }
})
