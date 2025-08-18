<template>
  <view v-if="visible" class="mask" @click.self="$emit('update:visible', false)">
    <view class="sheet">
      <view class="grid">
        <view class="kv"><text class="k">￥{{ wallet.consumable.toFixed(2) }}</text><text class="v">可消费</text></view>
        <view class="kv"><text class="k">￥{{ wallet.withdrawable.toFixed(2) }}</text><text class="v">可提现</text></view>
        <view class="kv"><text class="k">￥{{ wallet.carDeposit }}</text><text class="v">车辆押金（使用中）</text></view>
        <view class="kv"><text class="k">￥{{ wallet.violationDeposit }}</text><text class="v">违章押金（冻结中）</text></view>
      </view>
      <view class="btns">
        <button class="btn ghost" @click="$emit('withdraw')">提现</button>
        <button class="btn dark" @click="$emit('recharge')">充值</button>
      </view>
    </view>
  </view>
</template>
<script setup>
defineProps({ visible: Boolean, wallet: Object })
</script>
<style scoped>
.mask{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:flex-end; }
.sheet{ width:100%; background:#FFF6E5; border-top-left-radius:24rpx; border-top-right-radius:24rpx; padding:24rpx; }
.grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:16rpx 24rpx; }
.k{ font-size:34rpx; font-weight:700; color:#6E3D05; }
.v{ font-size:22rpx; color:#A86B2D; margin-top:4rpx; display:block; }
.btns{ display:flex; gap:20rpx; margin-top:16rpx; }
.btn{ flex:1; height:84rpx; border-radius:48rpx; font-size:30rpx; }
.ghost{ background:#FFF; color:#B37A2F; border:2rpx solid #B37A2F; }
.dark{ background:#222; color:#FFF; }
</style>