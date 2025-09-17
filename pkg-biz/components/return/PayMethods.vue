<template>
  <view class="card">
    <view class="title">支付方式</view>

    <!-- 合并余额支付 -->
    <view class="merge">
      <image class="yen" src="/static/icons/yen.png" mode="aspectFit" />
      <text class="merge-text">使用余额合并支付</text>
      <switch class="merge-switch" :checked="merge" color="#FFA24A" @change="onToggle" />
    </view>

    <!-- 提示：余额信息 -->
    <view v-if="merge" class="hint">
      <text class="orange">(当前余额：¥{{ balance.toFixed(2) }})</text>
      <text v-if="!balanceCoverAll" class="sub">余额不足，将合并{{ payMethodLabel }}支付</text>
      <text v-else class="sub ok">余额充足，将全额从余额扣款</text>
    </view>

    <!-- 微信 -->
    <view
      class="payOption"
      :class="{ on: payMethod==='wechat', lock: balanceCoverAll }"
      @click="select('wechat')"
    >
      <view class="left">
        <image src="/static/icons/wechat.png" class="logo" mode="aspectFit" />
        <text class="pay-text">微信支付</text>
      </view>

      <!-- 右侧尾部：金额 + 勾选/圆圈 -->
      <view class="tail">
        <view v-if="payMethod==='wechat' && restAmt>0" class="amount">
          <text class="symbol">￥</text>
          <text class="num">{{ restAmt.toFixed(2) }}</text>
        </view>
        <view :class="payMethod==='wechat' ? 'ok-badge' : 'radio'"></view>
      </view>
    </view>

    <!-- 支付宝 -->
    <view
      class="payOption"
      :class="{ on: payMethod==='alipay', lock: balanceCoverAll }"
      @click="select('alipay')"
    >
      <view class="left">
        <image src="/static/icons/alipay.png" class="logo" mode="aspectFit" />
        <text class="pay-text">支付宝</text>
      </view>

      <view class="tail">
        <view v-if="payMethod==='alipay' && restAmt>0" class="amount">
          <text class="symbol">￥</text>
          <text class="num">{{ restAmt.toFixed(2) }}</text>
        </view>
        <view :class="payMethod==='alipay' ? 'ok-badge' : 'radio'"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, toRefs, computed, watch } from 'vue'

/** 事件：
 * pay-amount-change: { wallet, rest, wechat, alipay, method }
 * toggle-merge: boolean
 * change-method: 'balance' | 'wechat' | 'alipay'
 */
const emit = defineEmits(['pay-amount-change', 'toggle-merge', 'change-method'])

const props = defineProps({
  total: { type: Number, required: true },   // 应付总额
  balance: { type: Number, default: 0 },     // 余额
  mergeInit: { type: Boolean, default: false }, // 初始是否合并余额
  methodInit: { type: String, default: 'wechat' } // 初始第三方方式
})

const { total, balance } = toRefs(props)
const merge = ref(props.mergeInit)
const payMethod = ref(props.methodInit) // 'wechat' | 'alipay' | 'balance'

// 余额是否足够覆盖全部
const balanceCoverAll = computed(() => merge.value && balance.value >= total.value)

// 余额支付额 & 剩余第三方支付额
const walletAmt = computed(() => (merge.value ? Math.min(balance.value, total.value) : 0))
const restAmt   = computed(() => (merge.value ? Math.max(0, total.value - balance.value) : total.value))

// 仅用于透出给父组件（便于区分渠道）
const wechatAmt = computed(() => (payMethod.value === 'wechat' ? restAmt.value : 0))
const alipayAmt = computed(() => (payMethod.value === 'alipay' ? restAmt.value : 0))

// 余额充足时：强制 balance，锁定第三方；不充足时：回到默认第三方
watch([merge, total, balance], () => {
  if (balanceCoverAll.value) {
    payMethod.value = 'balance'
    emit('change-method', 'balance')
  } else if (payMethod.value === 'balance') {
    payMethod.value = props.methodInit || 'wechat'
    emit('change-method', payMethod.value)
  }
}, { immediate: true })

// 向父层同步金额变化
watch([merge, total, balance, payMethod], () => {
  emit('pay-amount-change', {
    wallet: walletAmt.value,
    rest:   restAmt.value,
    wechat: wechatAmt.value,
    alipay: alipayAmt.value,
    method: payMethod.value
  })
}, { immediate: true })

function onToggle(e) {
  merge.value = e.detail.value
  emit('toggle-merge', merge.value)
}

function select(method) {
  // 余额已覆盖全部时锁死第三方
  if (balanceCoverAll.value) return
  payMethod.value = method
  emit('change-method', method)
}

const payMethodLabel = computed(() =>
  payMethod.value === 'alipay' ? '支付宝' : '微信'
)
</script>

<style scoped>
/* 卡片容器 */
.card{
  width:710rpx;background:#FFFFFF;border-radius:24rpx;
  margin:20rpx auto;padding:24rpx;box-sizing:border-box;
  box-shadow:0 6rpx 18rpx rgba(0,0,0,.03);
}
.title{ font-weight:500;font-size:32rpx;color:#444;line-height:40rpx;margin-bottom:16rpx; }

/* 合并支付行 */
.merge{ display:flex; align-items:center; }
.yen{ width:40rpx; height:40rpx; margin-right:16rpx; }
.merge-text{ font-size:34rpx; color:#444; flex:1; font-weight:520; }
.merge-switch{ transform: scale(0.87); margin-left:auto; }

/* 提示：两行 */
.hint{ margin-top:8rpx; margin-bottom:8rpx; }
.orange{ display:block; font-size:28rpx; color:#F4A33E; line-height:40rpx; padding-left:56rpx; }
.sub{ display:block; font-size:28rpx; color:#666; line-height:40rpx; padding-left:56rpx; }
.sub.ok{ color:#07BF4A; }

/* 支付选项行 */
.payOption{
  margin-top:20rpx; width:636rpx; height:108rpx; background:#fff;
  border-radius:24rpx; border:2rpx solid #E6E8EB;
  padding:0 20rpx; box-sizing:border-box; display:flex; align-items:center;
}
.payOption.on{ border-color:#02D901; box-shadow:0 0 0 4rpx #e9fbef inset; }
.payOption.lock{ opacity:.5; pointer-events:none; } /* 余额足够时锁定第三方 */

.left{ display:flex; align-items:center; }
.logo{ width:40rpx; height:40rpx; margin-right:14rpx; }
.pay-text{ font-size:36rpx; color:#444; }

/* 右侧尾部容器：金额 + 勾选框 */
.tail{ margin-left:auto; display:flex; align-items:center; gap:12rpx; }

.amount{ display:flex; align-items:flex-end; }
.symbol{ font-size:28rpx; color:#FD0300; font-family:D-DIN; }
.num{ font-size:48rpx; color:#FD0300; font-weight:700; line-height:40rpx; font-family:D-DIN; }

/* 未选中右侧圆框 */
.radio{
  width:40rpx; height:40rpx; border-radius:50%;
  border:2rpx solid #DDDDDD;
}

/* 选中：渐变绿圆 + 白色对勾 */
.ok-badge{
  width:40rpx; height:40rpx; border-radius:50%;
  background:linear-gradient(180deg,#82ED71 0%,#0DB63D 100%);
  position:relative; flex:0 0 40rpx;
}
.ok-badge::after{
  content:''; position:absolute; left:50%; top:50%;
  width:14rpx; height:24rpx;
  transform: translate(-40%,-60%) rotate(40deg);
  border-right:4rpx solid #fff; border-bottom:4rpx solid #fff;
  border-bottom-right-radius:4rpx; box-sizing:border-box;
}
</style>
