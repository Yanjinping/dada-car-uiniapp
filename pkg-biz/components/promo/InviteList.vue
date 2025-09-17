<template>
  <view class="list">
    <view class="hd">
      <view class="total">
        <text>我的收入</text>
        <text class="money">￥{{ total }}</text>
      </view>
      <text class="withdraw" @tap="$emit('withdraw')">去提现</text>
    </view>

    <view class="thead">
      <text class="c1">微信昵称</text>
      <text class="c2">邀请时间</text>
      <text class="c3">好友状态</text>
      <text class="c4">奖励金额</text>
    </view>

    <view v-for="(r,i) in records" :key="i" class="row">
      <view class="c1 nick">
        <image class="avatar" :src="r.avatar || '/static/avatar/default.png'"/>
        <text class="name">{{ r.name }}</text>
      </view>
      <text class="c2">{{ r.time }}</text>
      <text class="c3">{{ r.status }}</text>
      <text class="c4 red">{{ r.reward }}</text>
    </view>

    <view v-if="!records || !records.length" class="empty">
      暂无好友助力信息，快去邀请好友一起赚钱吧！
    </view>
  </view>
</template>

<script setup>
defineProps({
  total: { type: [Number,String], default: 0 },
  records: { type: Array, default: () => [] }
})
defineEmits(['withdraw'])
</script>

<style scoped>
.list{ margin:20rpx 24rpx 40rpx; padding:20rpx; border-radius:20rpx; background:#fff;}
.hd{ display:flex; justify-content:space-between; align-items:flex-end;}
.total{ display:flex; align-items:flex-end; gap:16rpx; color:#333; font-size:28rpx;}
.money{ color:#ff1444; font-size:56rpx; font-weight:900;}
.withdraw{ color:#ff7b00; font-size:26rpx;}
.thead, .row{ display:grid; grid-template-columns: 2.4fr 2fr 2.2fr 1.6fr; align-items:center; gap:8rpx;}
.thead{ margin-top:18rpx; padding:12rpx 0; color:#666; font-size:24rpx;}
.row{ padding:18rpx 0; border-top:2rpx dashed #f0f0f0; font-size:26rpx; color:#333;}
.nick{ display:flex; align-items:center; gap:12rpx;}
.avatar{ width:60rpx; height:60rpx; border-radius:50%;}
.name{ max-width:200rpx; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.red{ color:#ff2a2a; font-weight:700;}
.empty{ text-align:center; color:#999; padding:60rpx 0;}
</style>
