<template>
  <view class="wallet">
    <view class="head" @click="toggle">
      <view class="left">
        <image class="ico" src="/static/ico_wallet.png" mode="widthFix" />
        <text class="title">嗒嗒钱包</text>
      </view>
      <text class="caret">{{ open ? '︿' : '﹀' }}</text>
    </view>

    <view class="grid">
      <view class="kv"><text class="k">￥{{ fmt(wallet.consumable) }}</text><text class="v">可消费</text></view>
      <view class="kv"><text class="k">￥{{ fmt(wallet.withdrawable) }}</text><text class="v">可提现</text></view>
      <view class="kv"><text class="k">￥{{ fmt(wallet.carDeposit) }}</text><text class="v">车辆押金（使用中）</text></view>
      <view class="kv"><text class="k">￥{{ fmt(wallet.violationDeposit) }}</text><text class="v">违章押金（冻结中）</text></view>
    </view>

    <view v-show="open" class="actions">
      <button class="btn ghost" @click.stop="$emit('withdraw')">提现</button>
      <button class="btn solid" @click.stop="$emit('recharge')">充值</button>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({ wallet:{ type:Object, required:true } })
const open = $ref(true)
const toggle = () => open = !open
const fmt = (n) => Number(n||0).toFixed(2)
</script>

<style scoped lang="scss">
.wallet{
  background:#FFF6E5; border-radius:24rpx; padding:20rpx; box-shadow:0 8rpx 24rpx rgba(255,122,0,.12);
  .head{ display:flex; align-items:center; }
  .left{ display:flex; align-items:center; gap:12rpx; }
  .ico{ width:36rpx; }
  .title{ font-size:28rpx; color:#A86B2D; font-weight:600; }
  .caret{ margin-left:auto; color:#A86B2D; }

  .grid{
    display:grid; grid-template-columns:repeat(4,1fr); gap:20rpx; margin-top:16rpx;
    .k{ display:block; font-size:34rpx; font-weight:700; color:#6E3D05; }
    .v{ display:block; font-size:22rpx; color:#A86B2D; opacity:.9; margin-top:4rpx; }
  }
  .actions{ display:flex; gap:24rpx; margin-top:20rpx; }
  .btn{ flex:1; height:84rpx; border-radius:48rpx; font-size:30rpx; }
  .ghost{ background:#FFF; border:2rpx solid #B37A2F; color:#B37A2F; }
  .solid{ background:#222; color:#FFF; }
}
</style>
