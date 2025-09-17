<template>
  <view class="page">
    <TitleBar title="收银台" />
    <Cashier
      :scene="scene"
      :order-num="orderNum"
      :user-id="userId"
      :default-amount="defaultAmount"
      :redirect-url="redirectUrl"
      :allow-mixed="true"
      :enable-wechat="true"
      :enable-alipay="true"
      @success="onSuccess"
      @fail="onFail"
    />
  </view>
</template>

<script setup>
import TitleBar from '@/components/header/TitleBar.vue'
import Cashier from '@/components/cashier/Cashier.vue'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const scene = ref('ORDER')
const orderNum = ref('')
const userId = ref(0)
const defaultAmount = ref(0)
const redirectUrl = ref('/pages/order/success')

onLoad((q) => {
  scene.value = q.scene || 'ORDER'
  orderNum.value = q.orderNum || ''
  userId.value = Number(q.userId || 0)
  defaultAmount.value = Number(q.amount || 0)
  if (q.redirectUrl) redirectUrl.value = decodeURIComponent(q.redirectUrl)
})

function onSuccess(payload) {
  // 统计/打点/埋点都可以放这
}
function onFail(err) {
  // 失败上报
}
</script>

<style>
.page { min-height: 100vh; background: #fff; }
</style>
